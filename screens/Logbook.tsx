import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import SessionStore from '../services/sessions/SessionStore';
import SessionItem from '../components/logbook/SessionItem';

type Section = { title: string; data: any[][] };

// Group sessions by month and chunk into rows for a grid layout
const groupSessions = (sessions: any[]): Section[] => {
  const groups: Record<string, any[]> = {};
  sessions.forEach(session => {
    const date = new Date(session.date || session.created);
    const title = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!groups[title]) groups[title] = [];
    groups[title].push(session);
  });

  const chunk = (arr: any[], size: number) =>
    arr.reduce((acc: any[][], _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);

  return Object.keys(groups).map(title => ({
    title,
    data: chunk(groups[title], 2),
  }));
};

export default function Logbook({ navigation }: any) {
  const [sections, setSections] = useState<Section[]>([]);

  const load = useCallback(async () => {
    const list = await SessionStore.list();
    setSections(groupSessions(list.reverse()));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = (session: any) => {
    navigation?.navigate?.('SessionDetail', { session });
  };

  const handleDelete = async (id: string) => {
    await SessionStore.delete(id);
    load();
  };

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Logbook</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.map((s: any) => s.id).join('-') + index}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((session: any) => (
              <SessionItem
                key={session.id}
                session={session}
                onView={() => handleView(session)}
                onDelete={() => handleDelete(session.id)}
              />
            ))}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.section}>{title}</Text>}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No sessions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', margin: 16 },
  section: { color: '#ccc', fontSize: 18, marginHorizontal: 16, marginTop: 16 },
  row: { flexDirection: 'row' },
  list: { paddingHorizontal: 8 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});


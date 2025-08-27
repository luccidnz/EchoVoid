import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SessionStore from '../services/sessions/SessionStore';
import SessionItem from '../components/logbook/SessionItem';
import { useTheme, Theme } from '../theme';

export default function Logbook({ navigation }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  useEffect(() => {
    (async () => {
      const list = await SessionStore.list();
      setSessions(list.reverse());
    })();
  }, []);

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Logbook</Text>
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation?.navigate?.('SessionDetail', { session: item })}>
            <SessionItem session={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No sessions yet.</Text>}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#111' },
    title: { ...theme.typography.heading1, color: '#fff', margin: 16 },
    empty: { ...theme.typography.body, color: '#888', textAlign: 'center', marginTop: 40 },
  });
}

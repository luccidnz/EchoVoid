import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import SessionStore from '../services/sessions/SessionStore';
import SessionItem from '../components/logbook/SessionItem';

export default function Logbook({ navigation }: any) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const list = await SessionStore.list();
      setSessions(list.reverse());
    })();
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Logbook</Text>
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation?.navigate?.('SessionDetail', { session: item })}>
            <SessionItem session={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.colors.text, opacity: 0.6 }]}>No sessions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', margin: 16 },
  empty: { textAlign: 'center', marginTop: 40 },
});

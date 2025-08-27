import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SessionStore from '../services/sessions/SessionStore';
import SessionItem from '../components/logbook/SessionItem';
import { scaleFont } from 'src/utils/scale';

export default function Logbook({ navigation }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#111' },
  title: { fontSize: scaleFont(28), fontWeight: '800', color: '#fff', margin: 16 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SessionStore from '../services/sessions/SessionStore';
import SessionItem from '../components/logbook/SessionItem';
import { useTheme } from '../theme';
import { useDesignSystem } from '../theme/designSystem';

export default function Logbook({ navigation }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  useEffect(() => {
    (async () => {
      const list = await SessionStore.list();
      setSessions(list.reverse());
    })();
  }, []);

  const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.colors.bg },
    title: { ...typography.h1, color: theme.colors.text, margin: spacing.lg },
    empty: { color: theme.colors.text + '88', textAlign: 'center', marginTop: spacing.xxxl },
  });
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

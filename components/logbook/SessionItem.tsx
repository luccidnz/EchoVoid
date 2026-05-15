import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';
// TODO: Show session summary, type, date, and quick actions
export default function SessionItem({ session, onDelete, onView }: { session: any; onDelete: () => void; onView: () => void }) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    item: { padding: spacing.lg, borderRadius: spacing.md, backgroundColor: theme.colors.surface, marginVertical: spacing.sm },
    type: { ...typography.body, fontWeight: '700', color: theme.colors.text },
    date: { ...typography.caption, color: theme.colors.text + '99', marginTop: spacing.xs },
    info: { ...typography.caption, color: theme.colors.accent, marginTop: spacing.xs },
    actions: { flexDirection: 'row', marginTop: spacing.sm },
    actionButton: { marginRight: spacing.md, padding: spacing.sm, backgroundColor: theme.colors.surface, borderRadius: spacing.sm },
    actionText: { ...typography.caption, color: theme.colors.text },
  });
  return (
    <View style={styles.item}>
      <Text style={styles.type}>{session.type || 'Session'}</Text>
      <Text style={styles.date}>{new Date(session.created).toLocaleString()}</Text>
      <Text style={styles.info}>Anomalies: {session.anomalies?.length ?? 0}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onView} style={styles.actionButton}><Text style={styles.actionText}>View</Text></Pressable>
        <Pressable onPress={onDelete} style={styles.actionButton}><Text style={styles.actionText}>Delete</Text></Pressable>
      </View>
    </View>
  );
}

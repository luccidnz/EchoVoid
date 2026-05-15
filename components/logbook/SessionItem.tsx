import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';
// TODO: Show session summary, type, date, and quick actions
export default function SessionItem({ session, onDelete, onView }: { session: any; onDelete: () => void; onView: () => void }) {
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
const styles = StyleSheet.create({
  item: { padding: SPACING.md, borderRadius: SPACING.sm + SPACING.xs, backgroundColor: '#222', marginVertical: SPACING.sm - SPACING.xxs },
  type: { color: '#fff', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
  date: { color: '#aaa', fontSize: 13, marginTop: SPACING.xxs },
  info: { color: '#8ff', fontSize: 13, marginTop: SPACING.xs },
  actions: { flexDirection: 'row', marginTop: SPACING.sm },
  actionButton: { marginRight: SPACING.sm + SPACING.xs, padding: SPACING.sm, backgroundColor: '#444', borderRadius: SPACING.sm },
  actionText: { color: '#fff', fontSize: 13 },
});

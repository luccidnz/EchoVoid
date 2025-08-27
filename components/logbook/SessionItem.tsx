import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface SessionItemProps {
  session: any;
  onDelete?: () => void;
  onView?: () => void;
}

// TODO: Show session summary, type, date, and quick actions
export default function SessionItem({ session, onDelete = () => {}, onView = () => {} }: SessionItemProps) {
  const date = session.date ?? session.created ?? Date.now();
  return (
    <View style={styles.item}>
      <Text style={styles.type}>{session.type || 'Session'}</Text>
      <Text style={styles.date}>{new Date(date).toLocaleString()}</Text>
      <Text style={styles.info}>Anomalies: {session.anomalies?.length ?? 0}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onView} style={styles.actionButton}><Text style={styles.actionText}>View</Text></Pressable>
        <Pressable onPress={onDelete} style={styles.actionButton}><Text style={styles.actionText}>Delete</Text></Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  item: { padding: 16, borderRadius: 12, backgroundColor: '#222', marginVertical: 6 },
  type: { color: '#fff', fontWeight: '700', fontSize: 16 },
  date: { color: '#aaa', fontSize: 13, marginTop: 2 },
  info: { color: '#8ff', fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 8 },
  actionButton: { marginRight: 12, padding: 8, backgroundColor: '#444', borderRadius: 8 },
  actionText: { color: '#fff', fontSize: 13 },
});

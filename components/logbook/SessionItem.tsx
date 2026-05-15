import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

type Props = {
  session: any;
  onDelete: () => void;
  onView: () => void;
  onShare?: () => void;
  onEdit?: () => void;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  evp: 'mic',
  live: 'radio',
  board: 'clipboard',
  sigil: 'flash',
  notes: 'document-text',
};

export default function SessionItem({ session, onDelete, onView, onShare, onEdit }: Props) {
  const { theme } = useTheme();
  const icon = typeIcons[session.type] || 'document-text-outline';
  const latestNote = session.notes?.length ? session.notes[session.notes.length - 1] : null;

  return (
    <View style={[styles.item, { backgroundColor: theme.colors.surface, padding: theme.spacing[3], borderRadius: theme.radii[2] }]}> 
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={theme.colors.accent} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.type, { color: theme.colors.text }]}>{session.type || 'Session'}</Text>
          <Text style={[styles.date, { color: theme.colors.accent }]}>{new Date(session.created).toLocaleString()}</Text>
        </View>
      </View>
      {session.duration && (
        <Text style={[styles.info, { color: theme.colors.text }]}>Duration: {formatDuration(session.duration)}</Text>
      )}
      <Text style={[styles.info, { color: theme.colors.accent }]}>Anomalies: {session.anomalies?.length ?? 0}</Text>
      {latestNote && <Text numberOfLines={1} style={[styles.note, { color: theme.colors.text }]}>Note: {latestNote}</Text>}
      <View style={styles.actions}>
        <Pressable onPress={onView} style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>View</Text>
        </Pressable>
        {onEdit && (
          <Pressable onPress={onEdit} style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Edit</Text>
          </Pressable>
        )}
        {onShare && (
          <Pressable onPress={onShare} style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Share</Text>
          </Pressable>
        )}
        <Pressable onPress={onDelete} style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { marginVertical: 6 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  type: { fontWeight: '700', fontSize: 16 },
  date: { fontSize: 13, marginTop: 2 },
  info: { fontSize: 13, marginTop: 4 },
  note: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  actionButton: { marginRight: 12, marginTop: 4, padding: 8, borderRadius: 8 },
  actionText: { fontSize: 13 },
});

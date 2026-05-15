import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SessionItemProps = {
  session: any;
  onDelete?: () => void;
  onView?: () => void;
};

// Card-style representation of a logbook session
export default function SessionItem({ session, onDelete, onView }: SessionItemProps) {
  const handleView = () => {
    onView && onView();
  };

  const handleDelete = () => {
    onDelete && onDelete();
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={handleView} style={styles.preview}>
        {session.snapshot ? (
          <Image source={{ uri: session.snapshot }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]} />
        )}
      </Pressable>
      <View style={styles.meta}>
        <Text style={styles.type}>{session.type || 'Session'}</Text>
        <Text style={styles.date}>{new Date(session.date || session.created).toLocaleString()}</Text>
        <Text style={styles.info}>Anomalies: {session.anomalies?.length ?? 0}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleView} style={styles.iconButton} accessibilityLabel="View session">
          <Ionicons name="eye" size={20} color="#fff" />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.iconButton} accessibilityLabel="Delete session">
          <Ionicons name="trash" size={20} color="#ff6666" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    flex: 1,
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#333',
  },
  meta: {
    padding: 12,
  },
  type: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  date: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  info: {
    color: '#8ff',
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  iconButton: {
    padding: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
});


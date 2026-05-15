// TODO: CRUD for sessions (EVP, Live marks, Board, Sigils, Notes)
// Use FileSystem for media, AsyncStorage/MMKV for index

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type SyncStatus = 'offline' | 'connecting' | 'online';

export interface Session {
  id: string;
  participants: string[];
  syncStatus: SyncStatus;
  media?: string[];
  [key: string]: any;
}

const SESSIONS_KEY = 'sessions';
const MEDIA_DIR = `${FileSystem.documentDirectory}media/`;

// Add error handling for session operations
async function create(session: Session) {
  try {
    const sessions = await list();
    const newSession: Session = {
      participants: [],
      syncStatus: 'offline',
      ...session,
    };
    sessions.push(newSession);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    if (newSession.media) {
      const mediaPath = `${MEDIA_DIR}${session.id}/`;
      await FileSystem.makeDirectoryAsync(mediaPath, { intermediates: true });
      for (const file of newSession.media) {
        try {
          await FileSystem.copyAsync({ from: file, to: `${mediaPath}${file.split('/').pop()}` });
        } catch (fileError) {
          console.error(`Failed to copy media file: ${file}`, fileError);
        }
      }
    }
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Session creation failed. Please try again.');
  }
}

async function list(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    const sessions: Session[] = raw ? JSON.parse(raw) : [];
    return sessions.map((s) => ({
      participants: [],
      syncStatus: 'offline',
      ...s,
    }));
  } catch (error) {
    console.error('Failed to list sessions:', error);
    return [];
  }
}

async function read(id: string): Promise<Session | null> {
  try {
    const sessions = await list();
    return sessions.find((s: Session) => s.id === id) || null;
  } catch (error) {
    console.error('Failed to read session:', error);
    return null;
  }
}

async function update(id: string, data: Partial<Session>) {
  try {
    const sessions = await list();
    const idx = sessions.findIndex((s: Session) => s.id === id);
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...data };
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update session:', error);
    throw error;
  }
}

async function deleteMedia(sessionId: string) {
  try {
    const mediaPath = `${MEDIA_DIR}${sessionId}/`;
    const exists = await FileSystem.getInfoAsync(mediaPath);
    if (exists.exists) {
      await FileSystem.deleteAsync(mediaPath, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to delete media:', error);
  }
}

async function _delete(id: string) {
  try {
    const sessions = await list();
    const filtered = sessions.filter((s: Session) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
    await deleteMedia(id);
    return true;
  } catch (error) {
    console.error('Failed to delete session:', error);
    return false;
  }
}

export default {
  create,
  read,
  update,
  delete: _delete,
  list,
};

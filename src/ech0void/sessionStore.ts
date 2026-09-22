import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import type { Ech0Session } from './types';

const INDEX_KEY = 'ech0void.sessions.v2';
const ROOT = `${FileSystem.documentDirectory ?? ''}ech0void/sessions/`;

async function ensureRoot() {
  if (!FileSystem.documentDirectory) throw new Error('Persistent document storage is unavailable.');
  await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true }).catch(() => undefined);
}

async function readAll(): Promise<Ech0Session[]> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Ech0Session[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.schemaVersion === 2) : [];
  } catch {
    return [];
  }
}

export async function listSessions(): Promise<Ech0Session[]> {
  const sessions = await readAll();
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getSession(id: string): Promise<Ech0Session | null> {
  return (await readAll()).find((session) => session.id === id) ?? null;
}

export async function persistRoomRecording(sessionId: string, sourceUri: string | null): Promise<string | null> {
  if (!sourceUri) return null;
  await ensureRoot();
  const dir = `${ROOT}${sessionId}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
  const destination = `${dir}room.m4a`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export async function saveSession(session: Ech0Session): Promise<void> {
  await ensureRoot();
  const existing = await readAll();
  const next = [session, ...existing.filter((item) => item.id !== session.id)].slice(0, 250);
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(next));

  const dir = `${ROOT}${session.id}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
  await FileSystem.writeAsStringAsync(`${dir}session.json`, JSON.stringify(session, null, 2));
}

export async function updateSession(session: Ech0Session): Promise<void> {
  await saveSession(session);
}

export async function deleteSession(id: string): Promise<void> {
  const existing = await readAll();
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(existing.filter((item) => item.id !== id)));
  if (FileSystem.documentDirectory) {
    await FileSystem.deleteAsync(`${ROOT}${id}/`, { idempotent: true }).catch(() => undefined);
  }
}

export async function writeShareableSession(session: Ech0Session): Promise<string> {
  if (!FileSystem.cacheDirectory) throw new Error('Cache storage is unavailable.');
  const uri = `${FileSystem.cacheDirectory}ech0void-session-${session.id}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify({
    app: 'Ech0Void',
    exportedAt: new Date().toISOString(),
    disclosure: 'Generated source events are explicitly labelled ech0void-generated. This export does not establish a paranormal cause.',
    session,
  }, null, 2));
  return uri;
}

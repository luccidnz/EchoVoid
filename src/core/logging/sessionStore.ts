import * as FileSystem from 'expo-file-system';

export type StoredMessage = {
  text: string;
  conf?: number;
  tag?: string;
  ts: number;
};

export type StoredSession = {
  id: string;
  startedAt?: number;
  mode?: string;
  messages: StoredMessage[];
};

export async function ensureSessionsDir() {
  const dir = FileSystem.documentDirectory + 'sessions/';
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

export async function writeSession(name: string, data: any) {
  const dir = await ensureSessionsDir();
  const path = `${dir}${name}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
  return path;
}

/**
 * Append a message to a session file. The session is stored as JSON and each
 * message may include an optional tag.
 */
export async function addMessage(sessionId: string, message: StoredMessage) {
  const dir = await ensureSessionsDir();
  const path = `${dir}${sessionId}.json`;

  let session: StoredSession;
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    const raw = await FileSystem.readAsStringAsync(path);
    session = JSON.parse(raw) as StoredSession;
  } else {
    session = { id: sessionId, messages: [] };
  }

  session.messages.push(message);
  await FileSystem.writeAsStringAsync(path, JSON.stringify(session, null, 2));
}

/**
 * Search across all stored sessions for messages matching a query and optional
 * tag. Returns an array of objects containing the session id and message.
 */
export async function searchSessions(query: string, tag?: string) {
  const dir = await ensureSessionsDir();
  const files = await FileSystem.readDirectoryAsync(dir);
  const res: { sessionId: string; message: StoredMessage }[] = [];
  const q = query.toLowerCase();

  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const raw = await FileSystem.readAsStringAsync(dir + f);
    const session = JSON.parse(raw) as StoredSession;
    for (const m of session.messages) {
      const matchesQuery = !q || m.text.toLowerCase().includes(q);
      const matchesTag = tag ? m.tag === tag : true;
      if (matchesQuery && matchesTag) {
        res.push({ sessionId: session.id, message: m });
      }
    }
  }
  return res;
}

/**
 * Return a list of unique tags found across all sessions.
 */
export async function listTags() {
  const dir = await ensureSessionsDir();
  const files = await FileSystem.readDirectoryAsync(dir);
  const tags = new Set<string>();

  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const raw = await FileSystem.readAsStringAsync(dir + f);
    const session = JSON.parse(raw) as StoredSession;
    for (const m of session.messages) if (m.tag) tags.add(m.tag);
  }

  return Array.from(tags);
}

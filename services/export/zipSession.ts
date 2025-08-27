
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import { Session } from '../sessions/SessionStore';

// Minimal zip: just copy JSON and media to a folder, return folder path (simulate zip)
export default async function zipSession(session: Session) {
  const tmpDir = FileSystem.cacheDirectory + 'session_' + (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, session.id)) + '/';
  await FileSystem.makeDirectoryAsync(tmpDir, { intermediates: true });
  // Write session JSON
  const jsonPath = tmpDir + 'session.json';
  await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(session, null, 2));
  // Copy media
  let mediaPath = null;
  if (session.uri) {
    const ext = session.uri.split('.').pop();
    mediaPath = tmpDir + 'audio.' + ext;
    await FileSystem.copyAsync({ from: session.uri, to: mediaPath });
  }
  // Simulate zip: return folder path (could use a real zip lib)
  return tmpDir;
}

export async function shareSessionZip(session: Session) {
  const zipPath = await zipSession(session);
  await Sharing.shareAsync(zipPath);
}

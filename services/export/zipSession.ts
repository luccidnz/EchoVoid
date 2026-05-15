
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import { zip as zipDirectory } from 'react-native-zip-archive';

// Create a real zip archive of the session and return the zip file path
export default async function zipSession(session: any) {
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, session.id);
  const dir = `${FileSystem.cacheDirectory}session_${hash}`;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const jsonPath = `${dir}/session.json`;
    try {
      await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(session, null, 2));
    } catch {
      throw new Error('Failed to write session data');
    }

    if (session.uri) {
      const info = await FileSystem.getInfoAsync(session.uri);
      if (!info.exists) throw new Error('Media file missing');
      const ext = session.uri.split('.').pop();
      try {
        await FileSystem.copyAsync({ from: session.uri, to: `${dir}/audio.${ext}` });
      } catch {
        throw new Error('Failed to copy media');
      }
    }

    const zipPath = `${dir}.zip`;
    await zipDirectory(dir, zipPath);
    return zipPath;
  } catch (error) {
    console.error('zipSession error', error);
    throw error;
  }
}

export async function shareSessionZip(session: any) {
  try {
    const zipPath = await zipSession(session);
    await Sharing.shareAsync(zipPath);
  } catch (error) {
    console.error('shareSessionZip error', error);
  }
}

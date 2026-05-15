
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import JSZip from 'jszip';

// Create a real zip archive containing session.json and any media assets
export default async function zipSession(session: any) {
  const tmpDir = FileSystem.cacheDirectory +
    'session_' +
    (await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      session.id
    )) +
    '/';

  await FileSystem.makeDirectoryAsync(tmpDir, { intermediates: true });
  const zipFilePath = tmpDir + 'session.zip';

  const zip = new JSZip();
  zip.file('session.json', JSON.stringify(session, null, 2));

  if (session.uri) {
    const ext = session.uri.split('.').pop();
    const mediaContent = await FileSystem.readAsStringAsync(session.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    zip.file(`audio.${ext}`, mediaContent, { base64: true });
  }

  const zipContent = await zip.generateAsync({ type: 'base64' });
  await FileSystem.writeAsStringAsync(zipFilePath, zipContent, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return zipFilePath;
}

export async function shareSessionZip(session: any) {
  const zipPath = await zipSession(session);
  await Sharing.shareAsync(zipPath);
}

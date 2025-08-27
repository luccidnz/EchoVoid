import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import JSZip from 'jszip';

const EXPORT_DIR = `${FileSystem.documentDirectory}exports/`;

// Placeholder for exporting sessions to encrypted ZIP
export async function exportAll() {
  try {
    const sessions = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions/');
    const zip = new JSZip();

    for (const session of sessions) {
      const sessionPath = `${FileSystem.documentDirectory}sessions/${session}/`;
      const files = await FileSystem.readDirectoryAsync(sessionPath);

      for (const file of files) {
        try {
          const filePath = `${sessionPath}${file}`;
          const fileContent = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.Base64 });
          zip.file(`${session}/${file}`, fileContent, { base64: true });
        } catch (fileError) {
          console.error(`Failed to process file: ${file}`, fileError);
        }
      }
    }

    const zipContent = await zip.generateAsync({ type: 'base64' });
    const encrypted = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, zipContent);
    const exportPath = `${EXPORT_DIR}sessions_${Date.now()}.zip`;

    await FileSystem.writeAsStringAsync(exportPath, encrypted, { encoding: FileSystem.EncodingType.Base64 });
    console.log('Exported to:', exportPath);
  } catch (error) {
    console.error('Failed to export sessions:', (error as Error).message);
    throw new Error('Export failed. Please try again.');
  }
}

export async function autoDelete() {
  try {
    const sessionsPath = `${FileSystem.documentDirectory}sessions/`;
    const exists = await FileSystem.getInfoAsync(sessionsPath);
    if (exists.exists) {
      await FileSystem.deleteAsync(sessionsPath, { idempotent: true });
      console.log('Local sessions deleted.');
    }
  } catch (error) {
    console.error('Failed to delete local sessions:', error);
  }
}

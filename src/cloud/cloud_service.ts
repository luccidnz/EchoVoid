export interface CloudProvider {
  upload(filePath: string): Promise<void>;
}

/**
 * Simple placeholder provider. Replace with integration to AWS S3, Firebase, etc.
 */
export class DummyProvider implements CloudProvider {
  async upload(filePath: string): Promise<void> {
    // In a real implementation this would upload the file to the cloud.
    console.log(`Uploading ${filePath} to cloud storage...`);
  }
}

export interface Settings {
  /**
   * When true the recording is automatically uploaded after it is saved.
   */
  uploadOnSave: boolean;
}

// Default runtime settings. In a real app this would be persisted by the user.
let currentSettings: Settings = {
  uploadOnSave: false,
};

export function updateSettings(settings: Partial<Settings>): void {
  currentSettings = { ...currentSettings, ...settings };
}

export function getSettings(): Settings {
  return currentSettings;
}

/**
 * Saves a recording and optionally uploads it depending on the current settings.
 * The actual save functionality is omitted and would be implemented elsewhere.
 */
export async function saveRecording(
  filePath: string,
  provider: CloudProvider = new DummyProvider(),
): Promise<void> {
  // Placeholder for persisting the recording locally.
  console.log(`Saved recording at ${filePath}`);

  if (currentSettings.uploadOnSave) {
    await provider.upload(filePath);
  }
}

import React, { useState } from 'react';
import { Button, Share, View } from 'react-native';
import {
  saveRecording,
  getSettings,
  updateSettings,
  Settings,
} from '../cloud/cloud_service';

interface Props {
  /**
   * Location of the audio file that this screen is presenting.
   */
  filePath: string;
}

/**
 * Screen showing details about a recorded audio file.
 * Users can save the recording and share it with other apps or social media.
 */
export const RecordDetailScreen: React.FC<Props> = ({ filePath }) => {
  const [settings, setSettings] = useState<Settings>(getSettings());

  const onSave = async () => {
    await saveRecording(filePath);
  };

  const onShare = async () => {
    await Share.share({
      url: filePath,
      message: 'Check out my recording!',
    });
  };

  const toggleUpload = () => {
    const newValue = !settings.uploadOnSave;
    updateSettings({ uploadOnSave: newValue });
    setSettings({ ...settings, uploadOnSave: newValue });
  };

  return (
    <View>
      <Button title="Save" onPress={onSave} />
      <Button title="Share" onPress={onShare} />
      <Button
        title={settings.uploadOnSave ? 'Disable Auto Upload' : 'Enable Auto Upload'}
        onPress={toggleUpload}
      />
    </View>
  );
};

export default RecordDetailScreen;

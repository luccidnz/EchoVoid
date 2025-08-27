import React, { useState } from 'react';
import recorder from '../recorder/recorder_service';

/**
 * Simple UI screen with start and stop buttons for recording.
 */
export const RecordScreen: React.FC = () => {
  const [recording, setRecording] = useState(false);

  const start = async () => {
    await recorder.start();
    setRecording(true);
  };

  const stop = async () => {
    await recorder.stop();
    setRecording(false);
  };

  return (
    <div>
      {recording ? (
        <button onClick={stop}>Stop Recording</button>
      ) : (
        <button onClick={start}>Start Recording</button>
      )}
    </div>
  );
};

export default RecordScreen;

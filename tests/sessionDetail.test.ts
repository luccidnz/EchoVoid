import { test, mock } from 'node:test';
import assert from 'node:assert';
import { playSessionAudio } from '../services/audio/playSessionAudio';

test('playSessionAudio alerts and unloads on failure', async () => {
  const createAsyncMock = mock.fn(async () => { throw new Error('fail'); });
  const alertMock = mock.fn();
  const unloadMock = mock.fn(async () => {});
  const AudioModule = { Sound: { createAsync: createAsyncMock } };

  const soundRef: any = { current: { unloadAsync: unloadMock } };
  let setPlayingVal: boolean | null = null;
  const setPlaying = (v: boolean) => { setPlayingVal = v; };

  let errorLogged = false;
  const originalError = console.error;
  console.error = () => { errorLogged = true; };

  await playSessionAudio({ uri: 'u' }, false, setPlaying, soundRef, AudioModule, alertMock);

  assert.strictEqual(createAsyncMock.mock.callCount(), 1);
  assert.strictEqual(alertMock.mock.callCount(), 1);
  assert.strictEqual(unloadMock.mock.callCount(), 1);
  assert.strictEqual(soundRef.current, null);
  assert.strictEqual(setPlayingVal, false);
  assert.ok(errorLogged);

  console.error = originalError;
});

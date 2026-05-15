export async function playSessionAudio(
  session: any,
  playing: boolean,
  setPlaying: (val: boolean) => void,
  soundRef: { current: any },
  AudioModule: any,
  alert: (title: string, message?: string) => void
) {
  if (!session?.uri) return;
  if (playing) {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaying(false);
    return;
  }

  let sound: any = null;
  try {
    const result = await AudioModule.Sound.createAsync({ uri: session.uri }, { shouldPlay: true });
    sound = result.sound;
    soundRef.current = sound;
    setPlaying(true);
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (!status.isLoaded || status.didJustFinish) {
        setPlaying(false);
        sound.unloadAsync();
        soundRef.current = null;
      }
    });
  } catch (err) {
    console.error('Playback error', err);
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (e) {
        console.error('Error unloading sound', e);
      }
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.error('Error unloading current sound', e);
      }
      soundRef.current = null;
    }
    setPlaying(false);
    alert('Playback Error', 'Unable to play recording.');
  }
}

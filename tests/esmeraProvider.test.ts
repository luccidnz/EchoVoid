import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import EsmeraProvider, { useEsmera } from '../services/tts/EsmeraProvider';
import * as Speech from 'expo-speech';

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([{ identifier: '1', name: 'Voice', language: 'en' }]),
}));

test('provides voices and speak function', async () => {
  let ctx: any;
  const Consumer = () => {
    ctx = useEsmera();
    return null;
  };

  await act(async () => {
    TestRenderer.create(
      React.createElement(EsmeraProvider, null, React.createElement(Consumer))
    );
  });

  expect(ctx.availableVoices).toEqual([{ identifier: '1', name: 'Voice', language: 'en' }]);
  expect(ctx.isLimited).toBe(false);

  ctx.speak('hello', { pitch: 2 });
  expect(Speech.speak).toHaveBeenCalledWith('hello', expect.objectContaining({ pitch: 2 }));
});

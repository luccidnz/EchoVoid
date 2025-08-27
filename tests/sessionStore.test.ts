import SessionStore from '../services/sessions/SessionStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/docs/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  deleteAsync: jest.fn(),
}));

beforeEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  jest.clearAllMocks();
});

test('creates session and copies media', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
  await SessionStore.create({ id: '1', media: ['a.mp3'] });
  expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
  expect(FileSystem.copyAsync).toHaveBeenCalled();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('sessions', expect.any(String));
});

test('lists sessions', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[{"id":"2"}]');
  const sessions = await SessionStore.list();
  expect(sessions).toEqual([{ id: '2' }]);
});

test('reads session by id', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[{"id":"3"}]');
  const session = await SessionStore.read('3');
  expect(session).toEqual({ id: '3' });
});

test('updates session data', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[{"id":"4","name":"old"}]');
  const result = await SessionStore.update('4', { name: 'new' });
  expect(result).toBe(true);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('sessions', '[{"id":"4","name":"new"}]');
});

test('deletes session and media', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[{"id":"5"}]');
  const result = await SessionStore.delete('5');
  expect(result).toBe(true);
  expect(FileSystem.deleteAsync).toHaveBeenCalled();
});

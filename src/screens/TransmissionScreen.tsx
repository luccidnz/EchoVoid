import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import SessionSync from '../../services/sessions/SessionSync';
import SessionStore from '../../services/sessions/SessionStore';

// Added type annotation for navigation prop
const TransmissionScreen = ({ navigation }: { navigation: any }) => {
  // Log navigation prop
  console.log('[TransmissionScreen] navigation prop:', navigation);

  const [sessionId, setSessionId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [status, setStatus] = useState<'offline' | 'connecting' | 'online'>('offline');
  const syncRef = useRef<SessionSync | null>(null);

  const handleHost = async () => {
    const sync = new SessionSync(sessionId, true);
    syncRef.current = sync;
    sync.on('participants', async (p: string[]) => {
      setParticipants(p);
      await SessionStore.update(sessionId, { participants: p });
    });
    sync.on('status', async (s) => {
      setStatus(s);
      await SessionStore.update(sessionId, { syncStatus: s });
    });
    await SessionStore.create({ id: sessionId });
    sync.connect();
  };

  const handleJoin = () => {
    const sync = new SessionSync(sessionId, false);
    syncRef.current = sync;
    sync.on('participants', setParticipants);
    sync.on('status', setStatus);
    sync.connect();
  };

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Transmission</Text>
        <TextInput
          placeholder="Session ID"
          placeholderTextColor={colors.subtext}
          style={styles.input}
          value={sessionId}
          onChangeText={setSessionId}
        />
        <View style={styles.buttonRow}>
          <Button title="Host" onPress={handleHost} />
          <Button title="Join" onPress={handleJoin} />
        </View>
        <Text style={styles.status}>Status: {status}</Text>
        <FlatList
          data={participants}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <Text style={styles.participant}>{item}</Text>}
          ListEmptyComponent={<Text style={styles.p}>No participants</Text>}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700' },
  p: { color: colors.subtext, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.subtext,
    padding: 8,
    marginTop: 16,
    color: colors.text,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  participant: {
    color: colors.text,
    marginTop: 4,
  },
  status: { color: colors.subtext, marginTop: 16, marginBottom: 8 },
});

export default TransmissionScreen;

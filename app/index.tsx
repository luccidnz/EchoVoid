import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome</Text>
      <Pressable
        onPress={() => {
          console.log('router.push -> /home');
          router.push('/home');
        }}
        style={{ marginTop: 24, padding: 12, borderWidth: 1 }}
      >
        <Text>Go Home</Text>
      </Pressable>
    </View>
  );
}

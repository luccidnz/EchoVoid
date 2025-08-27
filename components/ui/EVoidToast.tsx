import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

type Props = { message: string; type?: 'info' | 'danger' | 'success' };
export default function EVoidToast({ message, type = 'info' }: Props) {
  const { theme } = useTheme();
  const color = type === 'danger' ? theme.colors.danger : type === 'success' ? theme.colors.accent : theme.colors.primary;
  return (
    <View style={[styles.toast, { borderColor: color }]}> 
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  toast: { position: 'absolute', bottom: 32, left: 24, right: 24, backgroundColor: '#222E', borderRadius: 12, borderWidth: 2, padding: 16, alignItems: 'center' },
  text: { fontWeight: '700', fontSize: 15 },
});

import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme, Theme } from '../../theme';

type Props = { visible: boolean; title: string; children: React.ReactNode; onClose: () => void };
export default function EVoidDialog({ visible, title, children, onClose }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: '#0009', justifyContent: 'center', alignItems: 'center' },
    dialog: { borderRadius: 18, padding: 24, minWidth: 260 },
    title: { ...theme.typography.heading3, marginBottom: 12 },
  });
}

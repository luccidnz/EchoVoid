import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

type Props = { visible: boolean; title: string; children: React.ReactNode; onClose: () => void };
export default function EVoidDialog({ visible, title, children, onClose }: Props) {
  const { theme } = useTheme();
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
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#0009', justifyContent: 'center', alignItems: 'center' },
  dialog: { borderRadius: SPACING.md + SPACING.xxs, padding: SPACING.lg, minWidth: 260 },
  title: { fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.lg, marginBottom: SPACING.sm + SPACING.xs },
});

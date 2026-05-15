import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { visible: boolean; title: string; children: React.ReactNode; onClose: () => void };
export default function EVoidDialog({ visible, title, children, onClose }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    dialog: { borderRadius: spacing.xl, padding: spacing.xxl, minWidth: 260 },
    title: { ...typography.title, marginBottom: spacing.md },
  });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.bg + '99' }]}> 
        <View style={[styles.dialog, { backgroundColor: theme.colors.surface }]}> 
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

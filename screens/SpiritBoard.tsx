
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import getEntropy from '../services/rng/Entropy';
import { useTheme } from '../theme';
import { useDesignSystem } from '../theme/designSystem';

const LETTERS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '_', '.'],
];

export default function SpiritBoard() {
  const [pointer, setPointer] = useState({ row: 1, col: 3 });
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();

  // Use entropy from sensors for pointer movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPointer((p) => {
        // Use entropy to bias movement
        const e = getEntropy();
        let row = p.row + (e > 0.5 ? 1 : -1) * (e > 0.7 ? 1 : 0);
        let col = p.col + (e < 0.5 ? 1 : -1) * (e < 0.3 ? 1 : 0);
        row = Math.max(0, Math.min(LETTERS.length - 1, row));
        col = Math.max(0, Math.min(LETTERS[0].length - 1, col));
        return { row, col };
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const styles = StyleSheet.create({
    flex: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
    title: { ...typography.h1, color: theme.colors.text, marginBottom: spacing.xxl },
    grid: { marginBottom: spacing.xxxl },
    row: { flexDirection: 'row' },
    cell: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      margin: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pointer: { backgroundColor: theme.colors.accent, borderWidth: 2, borderColor: theme.colors.text },
    letter: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
    tip: { color: theme.colors.text + '99', fontSize: 13, marginTop: spacing.md },
  });
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Spirit Board</Text>
      <View style={styles.grid}>
        {LETTERS.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((ch, c) => (
              <View
                key={ch}
                style={[styles.cell, pointer.row === r && pointer.col === c && styles.pointer]}
              >
                <Text style={styles.letter}>{ch}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.tip}>Pointer uses sensor entropy for movement</Text>
    </View>
  );
}

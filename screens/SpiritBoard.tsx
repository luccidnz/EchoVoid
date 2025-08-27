
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import getEntropy from '../services/rng/Entropy';
import Screen from './_layout/Screen';

const LETTERS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '_', '.'],
];

export default function SpiritBoard() {
  const [pointer, setPointer] = useState({ row: 1, col: 3 });

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

  return (
    <Screen style={styles.flex}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24 },
  grid: { marginBottom: 32 },
  row: { flexDirection: 'row' },
  cell: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', margin: 6, alignItems: 'center', justifyContent: 'center' },
  pointer: { backgroundColor: '#00E0FF', borderWidth: 2, borderColor: '#fff' },
  letter: { color: '#fff', fontSize: 22, fontWeight: '700' },
  tip: { color: '#aaa', fontSize: 13, marginTop: 12 },
});

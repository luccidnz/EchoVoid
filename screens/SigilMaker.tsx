import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import buildSigil from '../services/sigil/buildSigil';
import { useTheme } from '../theme';
import { useDesignSystem } from '../theme/designSystem';

export default function SigilMaker() {
  const [phrase, setPhrase] = useState('');
  const [sigilPath, setSigilPath] = useState('');
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();

  const handleGenerate = () => {
    setSigilPath(buildSigil(phrase));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: theme.colors.bg },
    title: { ...typography.title, color: theme.colors.text, marginBottom: spacing.lg },
    input: { borderWidth: 1, borderColor: theme.colors.surface, padding: spacing.sm, width: '100%', marginBottom: spacing.lg, color: theme.colors.text },
    button: { ...typography.button, color: theme.colors.primary, marginBottom: spacing.lg },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sigil Maker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a phrase"
        placeholderTextColor={theme.colors.text}
        value={phrase}
        onChangeText={setPhrase}
      />
      <TouchableOpacity onPress={handleGenerate}>
        <Text style={styles.button}>Generate</Text>
      </TouchableOpacity>
      {sigilPath ? (
        <Svg height="100" width="100" viewBox="0 0 100 100">
          <Path d={sigilPath} stroke={theme.colors.text} fill="none" />
        </Svg>
      ) : null}
    </View>
  );
}


import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme';
import buildSigil from '../services/sigil/buildSigil';

export default function SigilMaker() {
  const { theme } = useTheme();
  const [phrase, setPhrase] = useState('');
  const [sigilPath, setSigilPath] = useState('');

  const handleGenerate = () => {
    setSigilPath(buildSigil(phrase));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Sigil Maker</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.text, color: theme.colors.text }]}
        placeholder="Enter a phrase"
        placeholderTextColor={theme.colors.text}
        value={phrase}
        onChangeText={setPhrase}
      />
      <TouchableOpacity onPress={handleGenerate}>
        <Text style={[styles.button, { color: theme.colors.accent }]}>Generate</Text>
      </TouchableOpacity>
      {sigilPath ? (
        <Svg height="100" width="100" viewBox="0 0 100 100">
          <Path d={sigilPath} stroke={theme.colors.text} fill="none" />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  input: { borderWidth: 1, padding: 8, width: '100%', marginBottom: 16 },
  button: { marginBottom: 16 },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import buildSigil from '../services/sigil/buildSigil';
import { scaleFont } from 'src/utils/scale';

export default function SigilMaker() {
  const [phrase, setPhrase] = useState('');
  const [sigilPath, setSigilPath] = useState('');

  const handleGenerate = () => {
    setSigilPath(buildSigil(phrase));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sigil Maker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a phrase"
        value={phrase}
        onChangeText={setPhrase}
      />
      <TouchableOpacity onPress={handleGenerate}>
        <Text style={styles.button}>Generate</Text>
      </TouchableOpacity>
      {sigilPath ? (
        <Svg height="100" width="100" viewBox="0 0 100 100">
          <Path d={sigilPath} stroke="black" fill="none" />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: scaleFont(24), marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, width: '100%', marginBottom: 16 },
  button: { color: 'blue', marginBottom: 16 },
});

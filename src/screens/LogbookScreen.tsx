import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { listTags } from '../core/logging/sessionStore';

export default function LogbookScreen() {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await listTags();
      setTags(t);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search sessions"
        placeholderTextColor={colors.subtext}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <FlatList
        data={tags}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              setActiveTag(item === activeTag ? null : item)
            }
            style={[
              styles.tag,
              item === activeTag && styles.tagActive,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                item === activeTag && styles.tagTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tags</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  search: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  tagList: {
    paddingVertical: 4,
  },
  tag: {
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  tagActive: {
    backgroundColor: colors.accent,
  },
  tagText: {
    color: colors.text,
  },
  tagTextActive: {
    color: colors.bg,
  },
  empty: {
    color: colors.text,
  },
});


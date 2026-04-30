import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, SafeAreaView
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Tag, storage } from '../../utils/storage';
import { colors, radius, TAG_COLORS } from '../../utils/theme';

const EMOJIS = ['🌴','👨‍👩‍👧','🎂','🏠','🌸','🎉','✈️','🐾','🎵','🌿','❤️','⭐','🏖️','🍀','📸','🎨','🐶','🎃','🏔️','🌊'];

export default function TagsScreen() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌸');
  const [showNew, setShowNew] = useState(false);

  useFocusEffect(useCallback(() => { loadTags(); }, []));

  const loadTags = async () => {
    const t = await storage.getTags();
    setTags(t);
  };

  const createTag = async () => {
    if (!newName.trim()) return;
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      colorIndex: tags.length % TAG_COLORS.length,
      mediaIds: [],
      createdAt: Date.now(),
    };
    const updated = [...tags, newTag];
    await storage.saveTags(updated);
    setTags(updated);
    setNewName('');
    setShowNew(false);
  };

  const deleteTag = (tag: Tag) => {
    Alert.alert(
      `Delete "${tag.name}"?`,
      'The folder will be removed, but the media will stay in your library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            const updated = tags.filter(t => t.id !== tag.id);
            await storage.saveTags(updated);
            setTags(updated);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>tags & folders</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowNew(!showNew)}>
          <Text style={styles.addBtnText}>{showNew ? '✕' : '+ New'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, gap: 10 }}>
        {/* New tag creator */}
        {showNew && (
          <View style={styles.newTagBox}>
            <Text style={styles.newTagLabel}>Choose an emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnSelected]}
                    onPress={() => setNewEmoji(e)}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              style={styles.nameInput}
              placeholder="Folder name (e.g. Vacances, Famille...)"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity style={styles.createBtn} onPress={createTag}>
              <Text style={styles.createBtnText}>Create folder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing tags */}
        {tags.length === 0 && !showNew && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏷</Text>
            <Text style={styles.emptyTitle}>No folders yet</Text>
            <Text style={styles.emptySub}>Create folders to organize your photos and videos into collections.</Text>
          </View>
        )}

        {tags.map(tag => {
          const col = TAG_COLORS[tag.colorIndex % TAG_COLORS.length];
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tagCard, { backgroundColor: col.bg, borderColor: col.border }]}
              onLongPress={() => deleteTag(tag)}
              activeOpacity={0.85}
            >
              <View style={styles.tagLeft}>
                <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                <View>
                  <Text style={[styles.tagName, { color: col.text }]}>{tag.name}</Text>
                  <Text style={styles.tagCount}>
                    {tag.mediaIds.length} {tag.mediaIds.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              </View>
              <Text style={{ color: col.text, opacity: 0.5, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.hint}>Long-press a folder to delete it</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.borderPink,
    backgroundColor: colors.bgSecondary,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textSecondary, letterSpacing: -0.5 },
  addBtn: {
    backgroundColor: colors.accentPurple, borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  addBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  newTagBox: {
    backgroundColor: colors.bgSecondary, borderRadius: radius.lg,
    padding: 14, borderWidth: 0.5, borderColor: colors.borderPink,
  },
  newTagLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
  emojiBtn: { padding: 6, borderRadius: radius.sm },
  emojiBtnSelected: { backgroundColor: colors.borderPink },
  nameInput: {
    borderWidth: 0.5, borderColor: colors.borderPink, borderRadius: radius.md,
    backgroundColor: 'white', padding: 10, fontSize: 14, color: colors.textPrimary, marginBottom: 10,
  },
  createBtn: {
    backgroundColor: colors.accentPurple, borderRadius: radius.md,
    padding: 12, alignItems: 'center',
  },
  createBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  tagCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: radius.lg, borderWidth: 0.5, paddingVertical: 14, paddingHorizontal: 16,
  },
  tagLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tagEmoji: { fontSize: 24 },
  tagName: { fontSize: 15, fontWeight: '600' },
  tagCount: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  hint: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});

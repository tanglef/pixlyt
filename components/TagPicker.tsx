import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Tag, storage } from '../utils/storage';
import { colors, radius, TAG_COLORS } from '../utils/theme';

const EMOJIS = ['🌴','👨‍👩‍👧','🎂','🏠','🌸','🎉','✈️','🐾','🎵','🌿','❤️','⭐','🏖️','🍀','📸'];

interface TagPickerProps {
  visible: boolean;
  assetId: string;
  onClose: () => void;
  onTagged: (tagName: string) => void;
}

export default function TagPicker({ visible, assetId, onClose, onTagged }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌸');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (visible) loadTags();
  }, [visible]);

  const loadTags = async () => {
    const t = await storage.getTags();
    setTags(t);
  };

  const handleSelectTag = async (tag: Tag) => {
    await storage.addTagToMedia(tag.id, assetId);
    onTagged(tag.name);
    onClose();
  };

  const handleCreateTag = async () => {
    if (!newName.trim()) return;
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      colorIndex: tags.length % TAG_COLORS.length,
      mediaIds: [assetId],
      createdAt: Date.now(),
    };
    const updated = [...tags, newTag];
    await storage.saveTags(updated);
    await storage.addTagToMedia(newTag.id, assetId);
    setNewName('');
    setShowNew(false);
    setTags(updated);
    onTagged(newTag.name);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Tag this media</Text>

              {/* Existing tags */}
              <ScrollView style={styles.tagList} keyboardShouldPersistTaps="handled">
                {tags.map(tag => {
                  const col = TAG_COLORS[tag.colorIndex % TAG_COLORS.length];
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[styles.tagRow, { backgroundColor: col.bg, borderColor: col.border }]}
                      onPress={() => handleSelectTag(tag)}
                    >
                      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                      <Text style={[styles.tagName, { color: col.text }]}>{tag.name}</Text>
                      <Text style={[styles.tagCount, { color: col.text }]}>
                        {tag.mediaIds.length} items
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Create new tag */}
                {showNew ? (
                  <View style={styles.newTagBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                      {EMOJIS.map(e => (
                        <TouchableOpacity
                          key={e}
                          style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnSelected]}
                          onPress={() => setNewEmoji(e)}
                        >
                          <Text style={styles.emojiText}>{e}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={styles.newTagInputRow}>
                      <TextInput
                        style={styles.input}
                        placeholder="Tag name..."
                        placeholderTextColor={colors.textMuted}
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                      />
                      <TouchableOpacity style={styles.createBtn} onPress={handleCreateTag}>
                        <Text style={styles.createBtnText}>Create</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowNew(true)}>
                    <Text style={styles.addNewText}>+ New tag</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(60,30,50,0.3)' },
  sheet: {
    backgroundColor: colors.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 40, paddingHorizontal: 20, maxHeight: '70%',
  },
  handle: { width: 36, height: 4, backgroundColor: colors.borderPink, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: 14 },
  tagList: { flex: 1 },
  tagRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 0.5,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, gap: 10,
  },
  tagEmoji: { fontSize: 18 },
  tagName: { flex: 1, fontSize: 14, fontWeight: '500' },
  tagCount: { fontSize: 11, opacity: 0.7 },
  addNewBtn: {
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderPink,
    borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  addNewText: { color: colors.accentPurple, fontSize: 14, fontWeight: '500' },
  newTagBox: {
    backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: 12, marginTop: 4,
  },
  emojiRow: { marginBottom: 10 },
  emojiBtn: { padding: 6, borderRadius: radius.sm, marginRight: 4 },
  emojiBtnSelected: { backgroundColor: colors.borderPink },
  emojiText: { fontSize: 20 },
  newTagInputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.borderPink,
    backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.accentPurple, borderRadius: radius.md,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  createBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
});

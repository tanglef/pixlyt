import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, Modal, SafeAreaView
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import SwipeCard from '../../components/SwipeCard';
import TagPicker from '../../components/TagPicker';
import Toast from '../../components/Toast';
import { storage, Tag } from '../../utils/storage';
import { colors, radius } from '../../utils/theme';

type SortOrder = 'creationTime' | 'modificationTime' | 'mediaType';
const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'creationTime', label: 'Date (newest first)' },
  { key: 'modificationTime', label: 'Date modified' },
  { key: 'mediaType', label: 'Photos then videos' },
];

export default function SortScreen() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);
  const [sortOrderVisible, setSortOrderVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('creationTime');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (permission?.granted) loadAssets(sortOrder);
  }, [sortOrder, permission]);

  const initApp = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { setLoading(false); return; }
    }
    const [order, tagsData] = await Promise.all([storage.getSortOrder(), storage.getTags()]);
    setSortOrder(order as SortOrder);
    setTags(tagsData);
  };

  const loadAssets = async (order: SortOrder) => {
    setLoading(true);
    try {
      const sorted = await storage.getSorted();
      let allAssets: MediaLibrary.Asset[] = [];
      let after: string | undefined;
      // Fetch all (paginated)
      while (true) {
        const page = await MediaLibrary.getAssetsAsync({
          mediaType: ['photo', 'video'],
          first: 200,
          after,
          sortBy: order === 'mediaType'
            ? [MediaLibrary.SortBy.creationTime]
            : [order === 'modificationTime' ? MediaLibrary.SortBy.modificationTime : MediaLibrary.SortBy.creationTime],
        });
        allAssets = [...allAssets, ...page.assets];
        if (!page.hasNextPage) break;
        after = page.endCursor;
        if (allAssets.length > 2000) break; // safety cap
      }

      // Filter out already sorted
      const unsorted = allAssets.filter(a => !sorted[a.id] || sorted[a.id] === 'skip');

      if (order === 'mediaType') {
        unsorted.sort((a, b) => {
          if (a.mediaType !== b.mediaType) return a.mediaType === 'photo' ? -1 : 1;
          return b.creationTime - a.creationTime;
        });
      }

      setAssets(unsorted);
      setCurrentIndex(0);
      setRemaining(unsorted.length);
      setSortedCount(Object.values(sorted).filter(v => v !== 'skip').length);
      setAllDone(unsorted.length === 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = useCallback(async (action: 'keep' | 'delete' | 'skip') => {
    const asset = assets[currentIndex];
    if (!asset) return;

    if (action !== 'skip') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { stats, milestone } = await storage.recordSort(action, asset.id);

    if (action === 'delete') {
      Alert.alert(
        'Delete this media?',
        'This will remove it from your library.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => advance(stats.totalSorted, stats.sortedToday) },
          {
            text: 'Delete', style: 'destructive',
            onPress: async () => {
              try { await MediaLibrary.deleteAssetsAsync([asset]); } catch { }
              if (milestone) setToast(milestone);
              advance(stats.totalSorted, stats.sortedToday);
            }
          }
        ]
      );
      return;
    }

    if (milestone) setToast(milestone);
    advance(stats.totalSorted, stats.sortedToday);
  }, [assets, currentIndex]);

  const advance = (total: number, today: number) => {
    setSortedCount(total);
    setCurrentIndex(i => {
      const next = i + 1;
      setRemaining(assets.length - next);
      if (next >= assets.length) setAllDone(true);
      return next;
    });
  };

  const handleSortOrderChange = async (order: SortOrder) => {
    setSortOrder(order);
    await storage.saveSortOrder(order);
    setSortOrderVisible(false);
    loadAssets(order);
  };

  const currentAsset = assets[currentIndex];

  if (!permission) return <View style={styles.center}><ActivityIndicator color={colors.accentPurple} /></View>;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permTitle}>Allow access to photos</Text>
        <Text style={styles.permSub}>pixlyt needs access to your library to help you organize it.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>pixlyt</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setSortOrderVisible(true)} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>sort ↕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <Text style={styles.progressText}>
          {sortedCount} sorted · {remaining} remaining
        </Text>
        {remaining + sortedCount > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (sortedCount / (sortedCount + remaining)) * 100)}%` as any }
              ]}
            />
          </View>
        )}
      </View>

      {/* Main content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accentPurple} />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : allDone ? (
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All done!</Text>
          <Text style={styles.doneSub}>You've gone through all your photos — congrats! {sortedCount} sorted total.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={() => loadAssets(sortOrder)}>
            <Text style={styles.permBtnText}>Refresh library</Text>
          </TouchableOpacity>
        </View>
      ) : currentAsset ? (
        <View style={styles.cardArea}>
          <SwipeCard
            uri={currentAsset.uri}
            mediaType={currentAsset.mediaType as 'photo' | 'video'}
            filename={currentAsset.filename}
            creationTime={currentAsset.creationTime}
            onSwipeLeft={() => handleAction('delete')}
            onSwipeRight={() => handleAction('keep')}
            onSkip={() => handleAction('skip')}
          />

          {/* Tag chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
            <TouchableOpacity style={styles.tagAdd} onPress={() => setTagPickerVisible(true)}>
              <Text style={styles.tagAddText}>+ tag</Text>
            </TouchableOpacity>
            {tags.slice(0, 5).map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip]}
                onPress={async () => {
                  await storage.addTagToMedia(tag.id, currentAsset.id);
                  setToast(`Tagged as ${tag.name}!`);
                }}
              >
                <Text style={styles.tagChipText}>{tag.emoji} {tag.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Toast */}
      <Toast message={toast} onHide={() => setToast(null)} />

      {/* Tag picker */}
      <TagPicker
        visible={tagPickerVisible}
        assetId={currentAsset?.id ?? ''}
        onClose={() => { setTagPickerVisible(false); storage.getTags().then(setTags); }}
        onTagged={(name) => setToast(`Tagged as ${name}!`)}
      />

      {/* Sort order modal */}
      <Modal visible={sortOrderVisible} transparent animationType="fade" onRequestClose={() => setSortOrderVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSortOrderVisible(false)} activeOpacity={1}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sort order</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, sortOrder === opt.key && styles.modalOptionSelected]}
                onPress={() => handleSortOrderChange(opt.key)}
              >
                <Text style={[styles.modalOptionText, sortOrder === opt.key && styles.modalOptionTextSelected]}>
                  {opt.label}
                </Text>
                {sortOrder === opt.key && <Text style={{ color: colors.accentPurple }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.borderPink,
    backgroundColor: colors.bgSecondary,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textSecondary, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    backgroundColor: colors.bgBlue, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: colors.borderBlue,
  },
  headerBtnText: { fontSize: 12, color: colors.accentBlue, fontWeight: '500' },
  progressWrap: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.bgSecondary },
  progressText: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  progressBar: { height: 4, backgroundColor: colors.borderPink, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accentPurple, borderRadius: 2 },
  cardArea: { flex: 1, paddingTop: 12 },
  tagRow: { maxHeight: 44, marginTop: 4 },
  tagAdd: {
    backgroundColor: colors.bgSecondary, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: colors.borderPink,
  },
  tagAddText: { fontSize: 12, color: colors.accentPurple, fontWeight: '500' },
  tagChip: {
    backgroundColor: '#ecdaf2', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#d4b8e0',
  },
  tagChipText: { fontSize: 12, color: '#7050a0', fontWeight: '500' },
  loadingText: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  doneEmoji: { fontSize: 52 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  doneSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  permTitle: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  permSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  permBtn: {
    backgroundColor: colors.accentPurple, borderRadius: radius.full,
    paddingHorizontal: 28, paddingVertical: 12, marginTop: 8,
  },
  permBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(60,30,50,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: colors.bgPrimary, borderRadius: radius.xl, padding: 20,
    width: '80%', borderWidth: 0.5, borderColor: colors.borderPink,
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  modalOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: radius.md,
  },
  modalOptionSelected: { backgroundColor: colors.bgSecondary },
  modalOptionText: { fontSize: 14, color: colors.textSecondary },
  modalOptionTextSelected: { color: colors.accentPurple, fontWeight: '500' },
});

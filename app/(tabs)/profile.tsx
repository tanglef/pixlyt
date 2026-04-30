import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { storage, Stats, Tag } from '../../utils/storage';
import { colors, radius } from '../../utils/theme';

const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000];

function getMilestoneMessage(stats: Stats): string {
  if (stats.totalSorted === 0) return 'Start sorting to see your progress here!';
  if (stats.sortedToday === 0) return 'Come back today to keep your streak!';
  if (stats.currentStreak >= 7) return `🔥 ${stats.currentStreak}-day streak! You're incredible!`;
  if (stats.sortedToday >= 100) return `🌟 ${stats.sortedToday} sorted today — legendary!`;
  if (stats.sortedToday >= 50) return `⚡ ${stats.sortedToday} sorted today — you're flying!`;
  if (stats.sortedToday >= 10) return `✨ ${stats.sortedToday} sorted today — keep going!`;
  return `🌸 ${stats.totalSorted} sorted total — great start!`;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [s, t] = await Promise.all([storage.getStats(), storage.getTags()]);
      setStats(s);
      setTags(t);
    })();
  }, []));

  if (!stats) return null;

  const nextMilestone = MILESTONES.find(m => m > stats.totalSorted) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES.filter(m => m <= stats.totalSorted).pop() ?? 0;
  const milestoneProgress = nextMilestone === prevMilestone
    ? 1
    : (stats.totalSorted - prevMilestone) / (nextMilestone - prevMilestone);

  const keepRatio = stats.totalSorted > 0
    ? Math.round((stats.totalKept / stats.totalSorted) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>my progress</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Avatar & message */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🌸</Text>
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.message}>{getMilestoneMessage(stats)}</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.totalSorted}</Text>
            <Text style={styles.statLabel}>total sorted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.sortedToday}</Text>
            <Text style={styles.statLabel}>today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e8f0f8', borderColor: colors.borderBlue }]}>
            <Text style={[styles.statNum, { color: colors.accentBlue }]}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>day streak 🔥</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e8f5ec', borderColor: '#b8d8c0' }]}>
            <Text style={[styles.statNum, { color: colors.accentGreen }]}>{keepRatio}%</Text>
            <Text style={styles.statLabel}>kept</Text>
          </View>
        </View>

        {/* Milestone progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next milestone</Text>
          <View style={styles.milestoneRow}>
            <Text style={styles.milestoneNow}>{stats.totalSorted}</Text>
            <Text style={styles.milestoneSep}> / </Text>
            <Text style={styles.milestoneTarget}>{nextMilestone} sorted</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${milestoneProgress * 100}%` as any }]} />
          </View>
          <Text style={styles.milestoneHint}>
            {nextMilestone - stats.totalSorted} more to go!
          </Text>
        </View>

        {/* Best stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal bests</Text>
          <View style={styles.bestRow}>
            <Text style={styles.bestLabel}>Best day</Text>
            <Text style={styles.bestValue}>{stats.bestDayCount} sorted</Text>
          </View>
          <View style={[styles.bestRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.bestLabel}>Best streak</Text>
            <Text style={styles.bestValue}>{stats.bestStreak} days 🔥</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you've done</Text>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownItem, { backgroundColor: '#e8f5ec' }]}>
              <Text style={[styles.breakdownNum, { color: colors.accentGreen }]}>{stats.totalKept}</Text>
              <Text style={styles.breakdownLabel}>kept</Text>
            </View>
            <View style={[styles.breakdownItem, { backgroundColor: '#fce8e8' }]}>
              <Text style={[styles.breakdownNum, { color: colors.accentRed }]}>{stats.totalDeleted}</Text>
              <Text style={styles.breakdownLabel}>deleted</Text>
            </View>
            <View style={[styles.breakdownItem, { backgroundColor: '#ecdaf2' }]}>
              <Text style={[styles.breakdownNum, { color: colors.accentPurple }]}>{stats.totalTagged}</Text>
              <Text style={styles.breakdownLabel}>tagged</Text>
            </View>
          </View>
        </View>

        {/* Tags summary */}
        {tags.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your folders</Text>
            {tags.map(tag => (
              <View key={tag.id} style={styles.bestRow}>
                <Text style={styles.bestLabel}>{tag.emoji} {tag.name}</Text>
                <Text style={styles.bestValue}>{tag.mediaIds.length} items</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>Made with 🌸 — keep sorting!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.borderPink,
    backgroundColor: colors.bgSecondary,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textSecondary, letterSpacing: -0.5 },
  avatarSection: { alignItems: 'center', gap: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bgSecondary, borderWidth: 1.5, borderColor: colors.borderPink,
  },
  avatarEmoji: { fontSize: 34 },
  messageBox: {
    backgroundColor: colors.bgSecondary, borderRadius: radius.lg, borderWidth: 0.5,
    borderColor: colors.borderPink, padding: 14, width: '100%',
  },
  message: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.borderPink,
    padding: 14, alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '700', color: colors.accentPurple },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: 'white', borderRadius: radius.lg, borderWidth: 0.5,
    borderColor: colors.borderPink, padding: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  milestoneRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  milestoneNow: { fontSize: 22, fontWeight: '700', color: colors.accentPurple },
  milestoneSep: { fontSize: 16, color: colors.textMuted },
  milestoneTarget: { fontSize: 16, color: colors.textMuted },
  progressBar: { height: 8, backgroundColor: colors.bgSecondary, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accentPurple },
  milestoneHint: { fontSize: 11, color: colors.textMuted },
  bestRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.borderPink,
  },
  bestLabel: { fontSize: 13, color: colors.textSecondary },
  bestValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  breakdownRow: { flexDirection: 'row', gap: 8 },
  breakdownItem: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  breakdownNum: { fontSize: 20, fontWeight: '700' },
  breakdownLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, paddingVertical: 8 },
});

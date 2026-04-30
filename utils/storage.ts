import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  colorIndex: number;
  mediaIds: string[];
  createdAt: number;
}

export interface Stats {
  totalSorted: number;
  totalKept: number;
  totalDeleted: number;
  totalTagged: number;
  sortedToday: number;
  lastSortDate: string;
  currentStreak: number;
  bestStreak: number;
  bestDayCount: number;
  bestDayDate: string;
  sessionCount: number;
  consecutiveCount: number;
}

export interface SortedMedia {
  [assetId: string]: 'keep' | 'delete' | 'skip';
}

const KEYS = {
  TAGS: 'pixlyt_tags',
  STATS: 'pixlyt_stats',
  SORTED: 'pixlyt_sorted',
  SORT_ORDER: 'pixlyt_sort_order',
};

const defaultStats: Stats = {
  totalSorted: 0,
  totalKept: 0,
  totalDeleted: 0,
  totalTagged: 0,
  sortedToday: 0,
  lastSortDate: '',
  currentStreak: 0,
  bestStreak: 0,
  bestDayCount: 0,
  bestDayDate: '',
  sessionCount: 0,
  consecutiveCount: 0,
};

export const storage = {
  async getTags(): Promise<Tag[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.TAGS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  async saveTags(tags: Tag[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
  },

  async getStats(): Promise<Stats> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.STATS);
      if (!raw) return { ...defaultStats };
      const stats = { ...defaultStats, ...JSON.parse(raw) };
      // Reset daily count if new day
      const today = new Date().toDateString();
      if (stats.lastSortDate !== today) {
        stats.sortedToday = 0;
        if (stats.lastSortDate) {
          // Check if yesterday — maintain streak
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (stats.lastSortDate !== yesterday) stats.currentStreak = 0;
        }
        stats.lastSortDate = today;
      }
      return stats;
    } catch { return { ...defaultStats }; }
  },

  async saveStats(stats: Stats): Promise<void> {
    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  async getSorted(): Promise<SortedMedia> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SORTED);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  },

  async saveSorted(sorted: SortedMedia): Promise<void> {
    await AsyncStorage.setItem(KEYS.SORTED, JSON.stringify(sorted));
  },

  async getSortOrder(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(KEYS.SORT_ORDER)) ?? 'creationTime';
    } catch { return 'creationTime'; }
  },

  async saveSortOrder(order: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SORT_ORDER, order);
  },

  async recordSort(action: 'keep' | 'delete' | 'skip', assetId: string): Promise<{ stats: Stats; milestone: string | null }> {
    const [stats, sorted] = await Promise.all([this.getStats(), this.getSorted()]);

    sorted[assetId] = action;

    const today = new Date().toDateString();
    if (stats.lastSortDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (stats.lastSortDate === yesterday) stats.currentStreak++;
      else stats.currentStreak = 1;
      stats.sortedToday = 0;
      stats.lastSortDate = today;
    }

    if (action !== 'skip') {
      stats.totalSorted++;
      stats.sortedToday++;
      stats.consecutiveCount++;
      if (action === 'keep') stats.totalKept++;
      if (action === 'delete') stats.totalDeleted++;
      if (stats.sortedToday > stats.bestDayCount) {
        stats.bestDayCount = stats.sortedToday;
        stats.bestDayDate = today;
      }
      if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
    } else {
      stats.consecutiveCount = 0;
    }

    let milestone: string | null = null;
    if (action !== 'skip') {
      if (stats.consecutiveCount === 10) milestone = '🔥 10 in a row! You\'re on fire!';
      else if (stats.consecutiveCount === 25) milestone = '⚡ 25 in a row! Incredible!';
      else if (stats.totalSorted === 50) milestone = '🌸 50 sorted — you\'re just getting started!';
      else if (stats.totalSorted === 100) milestone = '💜 100 sorted — amazing progress!';
      else if (stats.totalSorted === 500) milestone = '🎉 500 sorted — you\'re a legend!';
      else if (stats.sortedToday === 10) milestone = `📱 ${stats.sortedToday} sorted today, keep going!`;
      else if (stats.sortedToday === 50) milestone = `🌟 ${stats.sortedToday} sorted today — wow!`;
    }

    await Promise.all([this.saveStats(stats), this.saveSorted(sorted)]);
    return { stats, milestone };
  },

  async addTagToMedia(tagId: string, assetId: string): Promise<void> {
    const tags = await this.getTags();
    const tag = tags.find(t => t.id === tagId);
    if (tag && !tag.mediaIds.includes(assetId)) {
      tag.mediaIds.push(assetId);
      await this.saveTags(tags);
    }
    const stats = await this.getStats();
    stats.totalTagged++;
    await this.saveStats(stats);
  },
};

// ============================================
// SOLO LEVELING GAME ENGINE v2.0
// Core logic for XP, leveling, ranks, stats,
// demon difficulty, penalties, and quest system
// ============================================

export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type ActivityType =
  | 'study' | 'gym' | 'reading' | 'coding' | 'meditation'
  | 'running' | 'cooking' | 'cleaning' | 'writing' | 'music'
  | 'art' | 'language' | 'finance' | 'social' | 'work'
  | 'health' | 'sleep' | 'hydration' | 'stretching' | 'custom';

export type QuestFrequency = 'daily' | 'weekly' | 'custom';
export type QuestStatus = 'active' | 'completed' | 'failed';
export type DemonLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface UserStats {
  strength: number;
  endurance: number;
  intelligence: number;
  discipline: number;
  charisma: number;
  luck: number;
}

export interface User {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  currentXP: number;
  rankTier: RankTier;
  currentStreak: number;
  bestStreak: number;
  stats: UserStats;
  statPoints: number;
  coins: number;
  titles: string[];
  activeTitle: string;
  punishmentsEnabled: boolean;
  createdAt: string;
  lastActiveDate: string;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  notes: string;
  durationMinutes: number;
  quantity: number;
  difficulty: number;
  xpEarned: number;
  statImpacts: Partial<UserStats>;
  questId?: string;
  questTitle?: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: string;
  targetType: ActivityType;
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  xpPenalty: number;
  statRewards: Partial<UserStats>;
  frequency: QuestFrequency;
  status: QuestStatus;
  demonLevel: DemonLevel;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface SystemLogEntry {
  id: string;
  type: 'levelUp' | 'questComplete' | 'questFailed' | 'rankUp' | 'rankDown' | 'penalty' | 'title' | 'streak' | 'xpGain' | 'xpLoss' | 'questCreated' | 'system';
  message: string;
  xpChange?: number;
  timestamp: string;
}

// ---- DEMON LEVEL SYSTEM ----

export const DEMON_LEVELS: Record<DemonLevel, {
  name: string;
  color: string;
  xpMultiplier: number;
  penaltyMultiplier: number;
  description: string;
}> = {
  1: { name: 'Imp', color: '#6b7280', xpMultiplier: 1.0, penaltyMultiplier: 0.5, description: 'Easy — A minor nuisance' },
  2: { name: 'Ghoul', color: '#3b82f6', xpMultiplier: 1.5, penaltyMultiplier: 0.8, description: 'Normal — A worthy foe' },
  3: { name: 'Wraith', color: '#a855f7', xpMultiplier: 2.0, penaltyMultiplier: 1.0, description: 'Hard — Dangerous spirit' },
  4: { name: 'Berserker', color: '#ef4444', xpMultiplier: 2.8, penaltyMultiplier: 1.5, description: 'Very Hard — Brutal challenge' },
  5: { name: 'Overlord', color: '#f59e0b', xpMultiplier: 4.0, penaltyMultiplier: 2.0, description: 'Extreme — Near impossible' },
  6: { name: 'Shadow Monarch', color: '#8b5cf6', xpMultiplier: 6.0, penaltyMultiplier: 3.0, description: 'Legendary — Only the chosen' },
};

// ---- EXPANDED ACTIVITY TYPES ----

export const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: string; color: string; statFocus: (keyof UserStats)[] }> = {
  study:      { label: 'Study',       icon: '📚', color: '#3b82f6', statFocus: ['intelligence', 'discipline'] },
  gym:        { label: 'Workout',     icon: '💪', color: '#ef4444', statFocus: ['strength', 'endurance'] },
  reading:    { label: 'Reading',     icon: '📖', color: '#a855f7', statFocus: ['intelligence', 'charisma'] },
  coding:     { label: 'Coding',      icon: '💻', color: '#22c55e', statFocus: ['intelligence', 'discipline'] },
  meditation: { label: 'Meditation',  icon: '🧘', color: '#fbbf24', statFocus: ['discipline', 'luck'] },
  running:    { label: 'Running',     icon: '🏃', color: '#f97316', statFocus: ['endurance', 'strength'] },
  cooking:    { label: 'Cooking',     icon: '🍳', color: '#ec4899', statFocus: ['charisma', 'discipline'] },
  cleaning:   { label: 'Cleaning',    icon: '🧹', color: '#14b8a6', statFocus: ['discipline', 'endurance'] },
  writing:    { label: 'Writing',     icon: '✍️', color: '#8b5cf6', statFocus: ['intelligence', 'charisma'] },
  music:      { label: 'Music',       icon: '🎵', color: '#e879f9', statFocus: ['charisma', 'luck'] },
  art:        { label: 'Art',         icon: '🎨', color: '#f472b6', statFocus: ['charisma', 'intelligence'] },
  language:   { label: 'Language',    icon: '🌍', color: '#06b6d4', statFocus: ['intelligence', 'charisma'] },
  finance:    { label: 'Finance',     icon: '💰', color: '#84cc16', statFocus: ['intelligence', 'discipline'] },
  social:     { label: 'Social',      icon: '🤝', color: '#f43f5e', statFocus: ['charisma', 'luck'] },
  work:       { label: 'Work',        icon: '💼', color: '#64748b', statFocus: ['discipline', 'endurance'] },
  health:     { label: 'Health',      icon: '❤️', color: '#ef4444', statFocus: ['endurance', 'luck'] },
  sleep:      { label: 'Sleep',       icon: '😴', color: '#6366f1', statFocus: ['endurance', 'luck'] },
  hydration:  { label: 'Hydration',   icon: '💧', color: '#0ea5e9', statFocus: ['endurance', 'discipline'] },
  stretching: { label: 'Stretching',  icon: '🤸', color: '#10b981', statFocus: ['endurance', 'strength'] },
  custom:     { label: 'Custom',      icon: '⚡', color: '#00d4ff', statFocus: ['discipline'] },
};

// ---- XP & LEVELING ----

export function calculateQuestXP(baseXP: number, demonLevel: DemonLevel): number {
  return Math.round(baseXP * DEMON_LEVELS[demonLevel].xpMultiplier);
}

export function calculateQuestPenalty(baseXP: number, demonLevel: DemonLevel): number {
  return Math.round(baseXP * DEMON_LEVELS[demonLevel].penaltyMultiplier);
}

export function xpToNextLevel(level: number): number {
  return 100 + Math.pow(level, 2) * 20;
}

export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpToNextLevel(i);
  }
  return total;
}

// ---- RANK SYSTEM ----

export function getRankForLevel(level: number): RankTier {
  if (level >= 50) return 'S';
  if (level >= 35) return 'A';
  if (level >= 22) return 'B';
  if (level >= 12) return 'C';
  if (level >= 5) return 'D';
  return 'E';
}

export function getLevelForXP(totalXP: number): { level: number; currentXP: number } {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level++;
  }
  return { level, currentXP: remaining };
}

export const RANK_COLORS: Record<RankTier, string> = {
  E: '#9ca3af',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#ef4444',
  S: '#fbbf24',
};

export const RANK_NAMES: Record<RankTier, string> = {
  E: 'Novice Hunter',
  D: 'Beginner Hunter',
  C: 'Intermediate Hunter',
  B: 'Advanced Hunter',
  A: 'Elite Hunter',
  S: 'Shadow Monarch',
};

// ---- STAT IMPACTS ----

export function getStatImpactsFromQuest(type: ActivityType, demonLevel: DemonLevel): Partial<UserStats> {
  const config = ACTIVITY_TYPES[type];
  if (!config) return { discipline: 1 };
  const base = Math.ceil(demonLevel * 0.8);
  const impacts: Partial<UserStats> = {};
  config.statFocus.forEach((stat, i) => {
    impacts[stat] = base + (i === 0 ? 2 : 1);
  });
  return impacts;
}

// ---- TITLE SYSTEM ----

export function checkTitleUnlocks(user: User): string[] {
  const titles: string[] = [];
  if (user.currentStreak >= 7) titles.push('Consistency Demon');
  if (user.currentStreak >= 30) titles.push('Iron Will');
  if (user.currentStreak >= 100) titles.push('Unbreakable');
  if (user.level >= 10) titles.push('Rising Hunter');
  if (user.level >= 25) titles.push('Dungeon Conqueror');
  if (user.level >= 50) titles.push('Shadow Monarch');
  if (user.stats.strength >= 50) titles.push('Titan');
  if (user.stats.intelligence >= 50) titles.push('Sage');
  if (user.stats.discipline >= 50) titles.push('Ascetic');
  if (user.totalXP >= 10000) titles.push('XP Hoarder');
  return titles;
}

// ---- AI SUMMARY GENERATION (client-side) ----

export function generateStatSummary(user: User, quests: Quest[], logs: ActivityLog[]): string {
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests = quests.filter(q => q.status === 'failed');
  const activeQuests = quests.filter(q => q.status === 'active');
  const totalLogged = logs.length;

  if (totalLogged === 0 && quests.length === 0) {
    return 'No data available yet. Start creating quests and completing them to see your analysis here.';
  }

  const statEntries = Object.entries(user.stats) as [keyof UserStats, number][];
  const topStat = statEntries.sort((a, b) => b[1] - a[1])[0];
  const weakStat = statEntries.sort((a, b) => a[1] - b[1])[0];

  // Activity breakdown
  const typeCounts: Record<string, number> = {};
  logs.forEach(l => {
    const label = ACTIVITY_TYPES[l.type]?.label || 'Other';
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  });
  const topActivity = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const completionRate = quests.length > 0 ? Math.round((completedQuests.length / quests.length) * 100) : 0;

  let summary = `Hunter ${user.name} — ${RANK_NAMES[user.rankTier]} (Level ${user.level}). `;

  if (completedQuests.length > 0) {
    summary += `You have completed ${completedQuests.length} quest${completedQuests.length > 1 ? 's' : ''} with a ${completionRate}% completion rate. `;
  }
  if (failedQuests.length > 0) {
    summary += `${failedQuests.length} quest${failedQuests.length > 1 ? 's' : ''} failed — the penalty system has been enforced. `;
  }
  if (activeQuests.length > 0) {
    summary += `${activeQuests.length} quest${activeQuests.length > 1 ? 's remain' : ' remains'} active. `;
  }
  if (topStat) {
    summary += `Your strongest attribute is ${topStat[0]} (${topStat[1]}). `;
  }
  if (weakStat && topStat && weakStat[0] !== topStat[0]) {
    summary += `Consider training ${weakStat[0]} (${weakStat[1]}) to balance your build. `;
  }
  if (topActivity) {
    summary += `Most frequent activity: ${topActivity[0]} (${topActivity[1]} sessions). `;
  }
  if (user.currentStreak > 0) {
    summary += `Current streak: ${user.currentStreak} day${user.currentStreak > 1 ? 's' : ''}. Keep it up!`;
  }

  return summary;
}

export function generateMonthlyReport(logs: ActivityLog[], quests: Quest[], month: number, year: number) {
  const monthLogs = logs.filter(l => {
    const d = new Date(l.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const monthQuests = quests.filter(q => {
    const d = new Date(q.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalXP = monthLogs.reduce((sum, l) => sum + l.xpEarned, 0);
  const completedQuests = monthQuests.filter(q => q.status === 'completed').length;
  const failedQuests = monthQuests.filter(q => q.status === 'failed').length;
  const totalQuests = monthQuests.length;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // Activity breakdown
  const typeCounts: Record<string, number> = {};
  monthLogs.forEach(l => {
    const label = ACTIVITY_TYPES[l.type]?.label || 'Other';
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  });

  // Daily XP
  const dailyXP: Record<string, number> = {};
  monthLogs.forEach(l => {
    const day = new Date(l.createdAt).getDate().toString();
    dailyXP[day] = (dailyXP[day] || 0) + l.xpEarned;
  });

  // Demon level breakdown
  const demonCounts: Record<number, number> = {};
  monthQuests.forEach(q => {
    demonCounts[q.demonLevel] = (demonCounts[q.demonLevel] || 0) + 1;
  });

  return {
    totalXP,
    completedQuests,
    failedQuests,
    totalQuests,
    completionRate,
    typeCounts,
    dailyXP,
    demonCounts,
    totalLogs: monthLogs.length,
  };
}

// ---- NANOID REPLACEMENT ----
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

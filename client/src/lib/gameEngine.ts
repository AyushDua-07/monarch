// ============================================
// SOLO LEVELING GAME ENGINE
// Core logic for XP, leveling, ranks, stats
// ============================================

export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type ActivityType = 'study' | 'gym' | 'reading' | 'coding' | 'meditation' | 'custom';

export type QuestFrequency = 'daily' | 'weekly' | 'custom';
export type QuestStatus = 'active' | 'completed' | 'failed';

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
  statRewards: Partial<UserStats>;
  frequency: QuestFrequency;
  status: QuestStatus;
  dueDate: string;
  createdAt: string;
}

export interface Punishment {
  id: string;
  ruleType: 'missedDaily' | 'missedWeekly';
  punishmentType: 'XPpenalty' | 'debtQuest' | 'streakFreezeCost' | 'rankWarning';
  value: number;
  active: boolean;
  description: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  type: 'levelUp' | 'questComplete' | 'rankUp' | 'penalty' | 'title' | 'streak';
  message: string;
  timestamp: string;
}

// ---- XP & LEVELING ----

export function calculateXP(difficulty: number, durationMinutes: number, quantity: number): number {
  const baseXP = 20;
  const difficultyMultiplier = 0.6 + (difficulty * 0.4); // 1.0 to 2.6
  const durationFactor = durationMinutes > 0 ? Math.min(2.0, durationMinutes / 30) : 1;
  const quantityFactor = quantity > 0 ? Math.min(1.5, 0.5 + quantity * 0.1) : 1;
  return Math.round(baseXP * difficultyMultiplier * Math.max(durationFactor, quantityFactor));
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

export function getStatImpacts(type: ActivityType, difficulty: number): Partial<UserStats> {
  const base = Math.ceil(difficulty * 0.5);
  const impacts: Record<ActivityType, Partial<UserStats>> = {
    gym: { strength: base + 2, endurance: base + 1 },
    study: { intelligence: base + 2, discipline: base + 1 },
    reading: { intelligence: base + 1, charisma: base },
    coding: { intelligence: base + 2, discipline: base },
    meditation: { discipline: base + 2, luck: base },
    custom: { discipline: base },
  };
  return impacts[type] || { discipline: base };
}

// ---- ACTIVITY TYPE CONFIG ----

export const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: string; color: string }> = {
  study: { label: 'Study', icon: '📚', color: '#3b82f6' },
  gym: { label: 'Workout', icon: '💪', color: '#ef4444' },
  reading: { label: 'Reading', icon: '📖', color: '#a855f7' },
  coding: { label: 'Coding', icon: '💻', color: '#22c55e' },
  meditation: { label: 'Meditation', icon: '🧘', color: '#fbbf24' },
  custom: { label: 'Custom', icon: '⚡', color: '#00d4ff' },
};

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

// ---- DEFAULT QUESTS ----

export function generateDailyQuests(): Omit<Quest, 'id' | 'createdAt'>[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return [
    {
      title: 'Morning Training',
      description: 'Complete a workout session',
      target: 'Complete 1 workout',
      targetType: 'gym' as ActivityType,
      targetValue: 1,
      currentProgress: 0,
      xpReward: 50,
      statRewards: { strength: 2, endurance: 1 },
      frequency: 'daily' as QuestFrequency,
      status: 'active' as QuestStatus,
      dueDate: today.toISOString(),
    },
    {
      title: 'Knowledge Seeker',
      description: 'Study or read for at least 30 minutes',
      target: 'Study/Read 30 min',
      targetType: 'study' as ActivityType,
      targetValue: 30,
      currentProgress: 0,
      xpReward: 40,
      statRewards: { intelligence: 2 },
      frequency: 'daily' as QuestFrequency,
      status: 'active' as QuestStatus,
      dueDate: today.toISOString(),
    },
    {
      title: 'Inner Peace',
      description: 'Meditate for 10 minutes',
      target: 'Meditate 10 min',
      targetType: 'meditation' as ActivityType,
      targetValue: 10,
      currentProgress: 0,
      xpReward: 30,
      statRewards: { discipline: 2, luck: 1 },
      frequency: 'daily' as QuestFrequency,
      status: 'active' as QuestStatus,
      dueDate: today.toISOString(),
    },
  ];
}

// ---- NANOID REPLACEMENT ----
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

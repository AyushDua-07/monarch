import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type User, type ActivityLog, type Quest, type Punishment, type SystemNotification,
  type ActivityType, type UserStats, type QuestStatus,
  calculateXP, xpToNextLevel, getRankForLevel, getStatImpacts,
  checkTitleUnlocks, generateDailyQuests, generateId, RANK_NAMES,
} from '@/lib/gameEngine';

interface GameState {
  user: User;
  logs: ActivityLog[];
  quests: Quest[];
  punishments: Punishment[];
  notifications: SystemNotification[];
}

interface GameContextType extends GameState {
  logActivity: (type: ActivityType, title: string, notes: string, difficulty: number, durationMinutes: number, quantity: number) => { xpEarned: number; leveledUp: boolean; newLevel: number };
  completeQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  deleteQuest: (questId: string) => void;
  allocateStat: (stat: keyof UserStats) => void;
  updateUserName: (name: string) => void;
  togglePunishments: () => void;
  setActiveTitle: (title: string) => void;
  dismissNotification: (id: string) => void;
  clearAllData: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_KEY = 'leveling_game_state';

function createDefaultUser(): User {
  return {
    id: generateId(),
    name: 'Hunter',
    level: 1,
    totalXP: 0,
    currentXP: 0,
    rankTier: 'E',
    currentStreak: 0,
    bestStreak: 0,
    stats: { strength: 5, endurance: 5, intelligence: 5, discipline: 5, charisma: 5, luck: 3 },
    statPoints: 0,
    coins: 0,
    titles: [],
    activeTitle: '',
    punishmentsEnabled: true,
    createdAt: new Date().toISOString(),
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
}

function createDefaultState(): GameState {
  const quests = generateDailyQuests().map(q => ({
    ...q,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }));

  return {
    user: createDefaultUser(),
    logs: [],
    quests,
    punishments: [],
    notifications: [{
      id: generateId(),
      type: 'streak' as const,
      message: 'System initialized. Welcome, Hunter. Your journey begins now.',
      timestamp: new Date().toISOString(),
    }],
  };
}

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if quests need daily refresh
      const today = new Date().toISOString().split('T')[0];
      const lastActive = parsed.user?.lastActiveDate;
      if (lastActive && lastActive !== today) {
        // Check for missed daily quests and apply punishments
        const missedQuests = (parsed.quests || []).filter(
          (q: Quest) => q.status === 'active' && q.frequency === 'daily'
        );
        if (missedQuests.length > 0 && parsed.user?.punishmentsEnabled) {
          const penalty: Punishment = {
            id: generateId(),
            ruleType: 'missedDaily',
            punishmentType: 'XPpenalty',
            value: missedQuests.length * 10,
            active: true,
            description: `Missed ${missedQuests.length} daily quest(s). -${missedQuests.length * 10} XP penalty.`,
            createdAt: new Date().toISOString(),
          };
          parsed.punishments = [...(parsed.punishments || []), penalty];
          parsed.notifications = [...(parsed.notifications || []), {
            id: generateId(),
            type: 'penalty',
            message: `WARNING: ${missedQuests.length} daily quest(s) were not completed. Penalty applied.`,
            timestamp: new Date().toISOString(),
          }];
          parsed.user.totalXP = Math.max(0, (parsed.user.totalXP || 0) - missedQuests.length * 10);
        }
        // Generate new daily quests
        const newQuests = generateDailyQuests().map(q => ({
          ...q,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }));
        // Keep weekly/custom quests, replace daily ones
        const keptQuests = (parsed.quests || []).filter(
          (q: Quest) => q.frequency !== 'daily'
        );
        parsed.quests = [...keptQuests, ...newQuests];
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastActive === yesterdayStr) {
          // Streak continues
        } else {
          parsed.user.currentStreak = 0;
        }
        parsed.user.lastActiveDate = today;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return createDefaultState();
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNotification = useCallback((type: SystemNotification['type'], message: string) => {
    const notification: SystemNotification = {
      id: generateId(),
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications].slice(0, 50),
    }));
  }, []);

  const logActivity = useCallback((
    type: ActivityType, title: string, notes: string,
    difficulty: number, durationMinutes: number, quantity: number
  ) => {
    const xpEarned = calculateXP(difficulty, durationMinutes, quantity);
    const statImpacts = getStatImpacts(type, difficulty);
    const log: ActivityLog = {
      id: generateId(),
      type, title, notes, durationMinutes, quantity, difficulty, xpEarned, statImpacts,
      createdAt: new Date().toISOString(),
    };

    let leveledUp = false;
    let newLevel = 0;

    setState(prev => {
      const newUser = { ...prev.user };
      newUser.totalXP += xpEarned;
      newUser.currentXP += xpEarned;

      // Apply stat impacts
      const newStats = { ...newUser.stats };
      Object.entries(statImpacts).forEach(([key, val]) => {
        if (val) newStats[key as keyof UserStats] += val;
      });
      newUser.stats = newStats;

      // Check level up
      while (newUser.currentXP >= xpToNextLevel(newUser.level)) {
        newUser.currentXP -= xpToNextLevel(newUser.level);
        newUser.level += 1;
        newUser.statPoints += 3;
        newUser.coins += 10;
        leveledUp = true;
        newLevel = newUser.level;
      }

      // Update rank
      const newRank = getRankForLevel(newUser.level);
      const rankChanged = newRank !== newUser.rankTier;
      newUser.rankTier = newRank;

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (newUser.lastActiveDate !== today) {
        newUser.currentStreak += 1;
        newUser.bestStreak = Math.max(newUser.bestStreak, newUser.currentStreak);
        newUser.lastActiveDate = today;
      }

      // Check titles
      const newTitles = checkTitleUnlocks(newUser);
      const brandNewTitles = newTitles.filter(t => !newUser.titles.includes(t));
      newUser.titles = Array.from(new Set([...newUser.titles, ...newTitles]));

      // Update quest progress
      const newQuests = prev.quests.map(q => {
        if (q.status !== 'active') return q;
        if (q.targetType === type || (type === 'reading' && q.targetType === 'study')) {
          const progress = type === 'gym' ? q.currentProgress + 1 : q.currentProgress + durationMinutes;
          const completed = progress >= q.targetValue;
          return {
            ...q,
            currentProgress: progress,
            status: completed ? 'completed' as QuestStatus : 'active' as QuestStatus,
          };
        }
        return q;
      });

      // Build notifications
      const newNotifications = [...prev.notifications];
      if (leveledUp) {
        newNotifications.unshift({
          id: generateId(), type: 'levelUp',
          message: `LEVEL UP! You have reached Level ${newLevel}. +3 stat points awarded.`,
          timestamp: new Date().toISOString(),
        });
      }
      if (rankChanged) {
        newNotifications.unshift({
          id: generateId(), type: 'rankUp',
          message: `RANK UP! You are now ${RANK_NAMES[newRank]} (${newRank}-Rank).`,
          timestamp: new Date().toISOString(),
        });
      }
      brandNewTitles.forEach(t => {
        newNotifications.unshift({
          id: generateId(), type: 'title',
          message: `NEW TITLE UNLOCKED: "${t}"`,
          timestamp: new Date().toISOString(),
        });
      });
      // Check completed quests
      newQuests.forEach((q, i) => {
        if (q.status === 'completed' && prev.quests[i]?.status === 'active') {
          newUser.totalXP += q.xpReward;
          newUser.currentXP += q.xpReward;
          newUser.coins += 5;
          Object.entries(q.statRewards).forEach(([key, val]) => {
            if (val) newUser.stats[key as keyof UserStats] += val;
          });
          newNotifications.unshift({
            id: generateId(), type: 'questComplete',
            message: `QUEST COMPLETE: "${q.title}" — +${q.xpReward} XP`,
            timestamp: new Date().toISOString(),
          });
        }
      });

      return {
        ...prev,
        user: newUser,
        logs: [log, ...prev.logs],
        quests: newQuests,
        notifications: newNotifications.slice(0, 50),
      };
    });

    return { xpEarned, leveledUp, newLevel };
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.status !== 'active') return prev;
      const newUser = { ...prev.user };
      newUser.totalXP += quest.xpReward;
      newUser.currentXP += quest.xpReward;
      newUser.coins += 5;
      Object.entries(quest.statRewards).forEach(([key, val]) => {
        if (val) newUser.stats[key as keyof UserStats] += val;
      });
      while (newUser.currentXP >= xpToNextLevel(newUser.level)) {
        newUser.currentXP -= xpToNextLevel(newUser.level);
        newUser.level += 1;
        newUser.statPoints += 3;
        newUser.coins += 10;
      }
      newUser.rankTier = getRankForLevel(newUser.level);
      return {
        ...prev,
        user: newUser,
        quests: prev.quests.map(q => q.id === questId ? { ...q, status: 'completed' as QuestStatus, currentProgress: q.targetValue } : q),
        notifications: [{
          id: generateId(), type: 'questComplete' as const,
          message: `QUEST COMPLETE: "${quest.title}" — +${quest.xpReward} XP`,
          timestamp: new Date().toISOString(),
        }, ...prev.notifications].slice(0, 50),
      };
    });
  }, []);

  const addQuest = useCallback((quest: Omit<Quest, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, { ...quest, id: generateId(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId),
    }));
  }, []);

  const allocateStat = useCallback((stat: keyof UserStats) => {
    setState(prev => {
      if (prev.user.statPoints <= 0) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          statPoints: prev.user.statPoints - 1,
          stats: { ...prev.user.stats, [stat]: prev.user.stats[stat] + 1 },
        },
      };
    });
  }, []);

  const updateUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, name } }));
  }, []);

  const togglePunishments = useCallback(() => {
    setState(prev => ({ ...prev, user: { ...prev.user, punishmentsEnabled: !prev.user.punishmentsEnabled } }));
  }, []);

  const setActiveTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, activeTitle: title } }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createDefaultState());
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      logActivity, completeQuest, addQuest, deleteQuest,
      allocateStat, updateUserName, togglePunishments,
      setActiveTitle, dismissNotification, clearAllData,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

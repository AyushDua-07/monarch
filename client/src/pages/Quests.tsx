/*
 * Quests Page — Quest management with demon difficulty levels
 * Design: Abyss Interface — quest cards with demon images, create quest modal with full customization
 * No pre-set quests — user creates everything from scratch
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Clock, AlertTriangle, Trash2, Skull, Swords } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import {
  ACTIVITY_TYPES, DEMON_LEVELS, type ActivityType, type QuestFrequency,
  type Quest, type DemonLevel, calculateQuestXP, calculateQuestPenalty,
} from '@/lib/gameEngine';
import { getDemonImage } from '@/lib/assets';
import SystemCard from '@/components/SystemCard';
import LevelUpModal from '@/components/LevelUpModal';

const BASE_XP = 30;

export default function Quests() {
  const { quests, completeQuest, failQuest, addQuest, deleteQuest } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'completed' | 'failed'>('active');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  // Form state
  const [qTitle, setQTitle] = useState('');
  const [qDesc, setQDesc] = useState('');
  const [qTarget, setQTarget] = useState('');
  const [qTargetType, setQTargetType] = useState<ActivityType>('study');
  const [qTargetValue, setQTargetValue] = useState(1);
  const [qFrequency, setQFrequency] = useState<QuestFrequency>('daily');
  const [qDemonLevel, setQDemonLevel] = useState<DemonLevel>(1);

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests = quests.filter(q => q.status === 'failed');

  const previewXP = calculateQuestXP(BASE_XP, qDemonLevel);
  const previewPenalty = calculateQuestPenalty(BASE_XP, qDemonLevel);

  function handleCreateQuest() {
    if (!qTitle.trim()) return;
    const now = new Date();
    let dueDate: Date;
    if (qFrequency === 'daily') {
      dueDate = new Date(now);
      dueDate.setHours(23, 59, 59, 999);
    } else if (qFrequency === 'weekly') {
      dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 7);
      dueDate.setHours(23, 59, 59, 999);
    } else {
      dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 3);
      dueDate.setHours(23, 59, 59, 999);
    }

    addQuest({
      title: qTitle,
      description: qDesc,
      target: qTarget || `${ACTIVITY_TYPES[qTargetType].label} x${qTargetValue}`,
      targetType: qTargetType,
      targetValue: qTargetValue,
      currentProgress: 0,
      xpReward: previewXP,
      xpPenalty: previewPenalty,
      statRewards: {},
      frequency: qFrequency,
      status: 'active',
      demonLevel: qDemonLevel,
      dueDate: dueDate.toISOString(),
    });
    setShowCreate(false);
    resetForm();
  }

  function resetForm() {
    setQTitle('');
    setQDesc('');
    setQTarget('');
    setQTargetType('study');
    setQTargetValue(1);
    setQFrequency('daily');
    setQDemonLevel(1);
  }

  function handleComplete(questId: string) {
    const result = completeQuest(questId);
    if (result.leveledUp) {
      setNewLevel(result.newLevel);
      setTimeout(() => setShowLevelUp(true), 300);
    }
  }

  const displayQuests = tab === 'active' ? activeQuests : tab === 'completed' ? completedQuests : failedQuests;

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Quests</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">Defeat demons. Earn XP. Level up.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono rounded-sm hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={14} /> New Quest
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'active', label: 'Active', count: activeQuests.length, color: 'cyan' },
            { key: 'completed', label: 'Completed', count: completedQuests.length, color: 'emerald' },
            { key: 'failed', label: 'Failed', count: failedQuests.length, color: 'red' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-3 py-2 text-xs font-mono rounded-sm transition-colors ${
                tab === t.key
                  ? `bg-${t.color}-500/20 text-${t.color}-400 border border-${t.color}-500/30`
                  : 'text-gray-500 border border-transparent'
              }`}
              style={tab === t.key ? {
                backgroundColor: t.color === 'cyan' ? 'rgba(0,212,255,0.1)' : t.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: t.color === 'cyan' ? '#00d4ff' : t.color === 'emerald' ? '#10b981' : '#ef4444',
                borderColor: t.color === 'cyan' ? 'rgba(0,212,255,0.3)' : t.color === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              } : {}}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Quest List */}
        <div className="space-y-3">
          {displayQuests.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={i}
              onComplete={() => handleComplete(quest.id)}
              onFail={() => failQuest(quest.id)}
              onDelete={() => deleteQuest(quest.id)}
            />
          ))}
          {displayQuests.length === 0 && (
            <SystemCard>
              <div className="text-center py-8">
                <Swords size={28} className="mx-auto mb-2 text-gray-700" />
                <p className="text-xs text-gray-600 font-mono">
                  {tab === 'active' ? 'No active quests. Create one to begin your journey.' :
                   tab === 'completed' ? 'No completed quests yet. Defeat your first demon!' :
                   'No failed quests. Keep up the good work!'}
                </p>
              </div>
            </SystemCard>
          )}
        </div>
      </div>

      {/* Create Quest Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md system-card rounded-t-lg sm:rounded-lg p-5 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-white">Create Quest</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Quest Title */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Quest Title *</label>
                  <input
                    value={qTitle}
                    onChange={e => setQTitle(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    placeholder="e.g., Morning Workout, Read 30 Pages..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Description</label>
                  <textarea
                    value={qDesc}
                    onChange={e => setQDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none resize-none"
                    placeholder="Optional description..."
                  />
                </div>

                {/* Activity Type — expanded with many emojis */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">Activity Type</label>
                  <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {(Object.entries(ACTIVITY_TYPES) as [ActivityType, typeof ACTIVITY_TYPES[ActivityType]][]).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setQTargetType(key)}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-sm text-center transition-all ${
                          qTargetType === key
                            ? 'bg-cyan-500/20 border border-cyan-500/40'
                            : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <span className="text-lg">{val.icon}</span>
                        <span className="text-[8px] text-gray-400 leading-tight">{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demon Level Selector */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">
                    Set Demon Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3, 4, 5, 6] as DemonLevel[]).map(level => {
                      const demon = DEMON_LEVELS[level];
                      const isSelected = qDemonLevel === level;
                      return (
                        <button
                          key={level}
                          onClick={() => setQDemonLevel(level)}
                          className={`relative flex flex-col items-center gap-1 p-2 rounded-sm transition-all ${
                            isSelected
                              ? 'border-2'
                              : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]'
                          }`}
                          style={isSelected ? {
                            borderColor: demon.color,
                            backgroundColor: `${demon.color}15`,
                          } : {}}
                        >
                          <img
                            src={getDemonImage(level)}
                            alt={demon.name}
                            className="w-12 h-12 object-contain"
                          />
                          <span className="text-[9px] font-mono font-bold" style={{ color: demon.color }}>
                            {demon.name}
                          </span>
                          <span className="text-[8px] text-gray-500">x{demon.xpMultiplier} XP</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono mt-1.5">
                    {DEMON_LEVELS[qDemonLevel].description}
                  </p>
                </div>

                {/* Target & Frequency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Target Value</label>
                    <input
                      type="number"
                      value={qTargetValue}
                      onChange={e => setQTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Frequency</label>
                    <select
                      value={qFrequency}
                      onChange={e => setQFrequency(e.target.value as QuestFrequency)}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      <option value="daily" className="bg-gray-900">Daily</option>
                      <option value="weekly" className="bg-gray-900">Weekly</option>
                      <option value="custom" className="bg-gray-900">Custom (3 days)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Target Label */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Target Label (optional)</label>
                  <input
                    value={qTarget}
                    onChange={e => setQTarget(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    placeholder={`e.g., ${ACTIVITY_TYPES[qTargetType].label} x${qTargetValue}`}
                  />
                </div>

                {/* XP Preview */}
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-sm text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Reward</p>
                    <p className="font-heading text-xl font-bold text-cyan-400">+{previewXP} XP</p>
                  </div>
                  <div className="flex-1 p-3 bg-red-500/5 border border-red-500/20 rounded-sm text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Penalty</p>
                    <p className="font-heading text-xl font-bold text-red-400">-{previewPenalty} XP</p>
                  </div>
                </div>

                {/* CREATE QUEST BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateQuest}
                  disabled={!qTitle.trim()}
                  className="w-full py-3.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-heading text-sm tracking-wider uppercase hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  ⚔️ Create Quest
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LevelUpModal show={showLevelUp} level={newLevel} onClose={() => setShowLevelUp(false)} />
    </div>
  );
}

function QuestCard({ quest, index, onComplete, onFail, onDelete }: {
  quest: Quest; index: number;
  onComplete: () => void; onFail: () => void; onDelete: () => void;
}) {
  const isCompleted = quest.status === 'completed';
  const isFailed = quest.status === 'failed';
  const demonConfig = DEMON_LEVELS[quest.demonLevel];
  const config = ACTIVITY_TYPES[quest.targetType] || ACTIVITY_TYPES.custom;

  // Time remaining
  const now = new Date();
  const due = new Date(quest.dueDate);
  const hoursLeft = Math.max(0, Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const minsLeft = Math.max(0, Math.floor(((due.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)));
  const isUrgent = hoursLeft < 3 && !isCompleted && !isFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <SystemCard className={`${isCompleted ? 'opacity-60' : ''} ${isFailed ? 'opacity-50' : ''} ${isUrgent ? 'border-red-500/30' : ''}`}>
        <div className="flex items-start gap-3">
          <img
            src={getDemonImage(quest.demonLevel)}
            alt={demonConfig.name}
            className={`w-14 h-14 object-contain ${isCompleted ? 'grayscale' : ''} ${isFailed ? 'grayscale opacity-50' : ''}`}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-semibold ${isCompleted ? 'text-gray-400 line-through' : isFailed ? 'text-red-400/60 line-through' : 'text-white'}`}>
                {quest.title}
              </h4>
              <span className="text-[8px] px-1.5 py-0.5 rounded-sm font-mono font-bold"
                style={{ color: demonConfig.color, backgroundColor: `${demonConfig.color}15`, border: `1px solid ${demonConfig.color}30` }}>
                {demonConfig.name}
              </span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-mono ${
                quest.frequency === 'daily' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                quest.frequency === 'weekly' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}>
                {quest.frequency}
              </span>
            </div>
            {quest.description && (
              <p className="text-[11px] text-gray-500 mt-0.5">{quest.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-gray-500 font-mono">{config.icon} {config.label}</span>
              <span className="text-[10px] text-amber-400 font-mono">+{quest.xpReward} XP</span>
              <span className="text-[10px] text-red-400/60 font-mono">-{quest.xpPenalty} XP</span>
            </div>
            {!isCompleted && !isFailed && (
              <div className="flex items-center gap-1 mt-1.5">
                <Clock size={10} className={isUrgent ? 'text-red-400' : 'text-gray-600'} />
                <span className={`text-[10px] font-mono ${isUrgent ? 'text-red-400' : 'text-gray-600'}`}>
                  {hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m left` : `${minsLeft}m left`}
                </span>
              </div>
            )}
            {isCompleted && quest.completedAt && (
              <p className="text-[10px] text-emerald-400/60 font-mono mt-1">
                ✓ Completed {new Date(quest.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {isFailed && (
              <p className="text-[10px] text-red-400/60 font-mono mt-1">
                ✗ Failed — {quest.xpPenalty} XP penalty applied
              </p>
            )}

            {/* Action Buttons */}
            {!isCompleted && !isFailed && (
              <div className="flex items-center gap-2 mt-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onComplete}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded-sm hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 size={12} /> Complete
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onFail}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/5 border border-red-500/20 text-red-400/60 text-[10px] font-mono rounded-sm hover:bg-red-500/10 transition-colors"
                >
                  <Skull size={12} /> Abandon
                </motion.button>
                <button
                  onClick={onDelete}
                  className="ml-auto p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            {(isCompleted || isFailed) && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-400 text-[10px] font-mono transition-colors"
                >
                  <Trash2 size={10} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </SystemCard>
    </motion.div>
  );
}

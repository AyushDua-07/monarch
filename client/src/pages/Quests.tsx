/*
 * Quests Page — Daily/Weekly quest management
 * Design: Abyss Interface — quest cards with progress bars, create quest modal
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { ACTIVITY_TYPES, type ActivityType, type QuestFrequency, type Quest } from '@/lib/gameEngine';
import SystemCard from '@/components/SystemCard';

export default function Quests() {
  const { quests, completeQuest, addQuest, deleteQuest } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  // Form state
  const [qTitle, setQTitle] = useState('');
  const [qDesc, setQDesc] = useState('');
  const [qTarget, setQTarget] = useState('');
  const [qTargetType, setQTargetType] = useState<ActivityType>('study');
  const [qTargetValue, setQTargetValue] = useState(30);
  const [qXPReward, setQXPReward] = useState(50);
  const [qFrequency, setQFrequency] = useState<QuestFrequency>('daily');

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests = quests.filter(q => q.status === 'failed');

  function handleCreateQuest() {
    if (!qTitle.trim()) return;
    const today = new Date();
    if (qFrequency === 'daily') {
      today.setHours(23, 59, 59, 999);
    } else {
      today.setDate(today.getDate() + 7);
    }
    addQuest({
      title: qTitle,
      description: qDesc,
      target: qTarget || `${ACTIVITY_TYPES[qTargetType].label} ${qTargetValue}`,
      targetType: qTargetType,
      targetValue: qTargetValue,
      currentProgress: 0,
      xpReward: qXPReward,
      statRewards: {},
      frequency: qFrequency,
      status: 'active',
      dueDate: today.toISOString(),
    });
    setShowCreate(false);
    resetForm();
  }

  function resetForm() {
    setQTitle('');
    setQDesc('');
    setQTarget('');
    setQTargetType('study');
    setQTargetValue(30);
    setQXPReward(50);
    setQFrequency('daily');
  }

  const displayQuests = tab === 'active' ? activeQuests : completedQuests;

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Quests</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">Complete quests to earn bonus XP and rewards.</p>
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
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 text-xs font-mono rounded-sm transition-colors ${
              tab === 'active' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
            }`}
          >
            Active ({activeQuests.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-2 text-xs font-mono rounded-sm transition-colors ${
              tab === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 border border-transparent'
            }`}
          >
            Completed ({completedQuests.length})
          </button>
        </div>

        {/* Quest List */}
        <div className="space-y-3">
          {displayQuests.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={i}
              onComplete={() => completeQuest(quest.id)}
              onDelete={() => deleteQuest(quest.id)}
            />
          ))}
          {displayQuests.length === 0 && (
            <SystemCard>
              <p className="text-center py-8 text-xs text-gray-600 font-mono">
                {tab === 'active' ? 'No active quests. Create one or wait for daily reset.' : 'No completed quests yet.'}
              </p>
            </SystemCard>
          )}
        </div>

        {/* Failed Quests */}
        {failedQuests.length > 0 && (
          <SystemCard title="Failed Quests" delay={0.3}>
            {failedQuests.map(q => (
              <div key={q.id} className="flex items-center gap-3 p-2 bg-red-500/5 rounded-sm border-l-2 border-red-500/30 mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 line-through">{q.title}</p>
                </div>
              </div>
            ))}
          </SystemCard>
        )}
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
              className="w-full max-w-md system-card rounded-t-lg sm:rounded-lg p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-white">Create Quest</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Quest Title</label>
                  <input
                    value={qTitle}
                    onChange={e => setQTitle(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    placeholder="e.g., Morning Workout"
                  />
                </div>

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Activity Type</label>
                    <select
                      value={qTargetType}
                      onChange={e => setQTargetType(e.target.value as ActivityType)}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                        <option key={key} value={key} className="bg-gray-900">{val.icon} {val.label}</option>
                      ))}
                    </select>
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Frequency</label>
                    <select
                      value={qFrequency}
                      onChange={e => setQFrequency(e.target.value as QuestFrequency)}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      <option value="daily" className="bg-gray-900">Daily</option>
                      <option value="weekly" className="bg-gray-900">Weekly</option>
                      <option value="custom" className="bg-gray-900">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">XP Reward</label>
                    <input
                      type="number"
                      value={qXPReward}
                      onChange={e => setQXPReward(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none"
                      min={10}
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateQuest}
                  disabled={!qTitle.trim()}
                  className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-heading text-sm tracking-wider uppercase hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Create Quest
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestCard({ quest, index, onComplete, onDelete }: { quest: Quest; index: number; onComplete: () => void; onDelete: () => void }) {
  const pct = Math.min(100, (quest.currentProgress / quest.targetValue) * 100);
  const isCompleted = quest.status === 'completed';
  const config = ACTIVITY_TYPES[quest.targetType] || ACTIVITY_TYPES.custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <SystemCard className={isCompleted ? 'opacity-60' : ''}>
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{config.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                {quest.title}
              </h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
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
              <div className="flex-1">
                <div className="h-1.5 bg-cyan-500/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {quest.currentProgress}/{quest.targetValue}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-mono">+{quest.xpReward} XP</span>
                <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(quest.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onComplete}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded-sm hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Complete
                  </motion.button>
                )}
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SystemCard>
    </motion.div>
  );
}

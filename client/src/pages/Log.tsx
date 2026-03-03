/*
 * Log Page — Activity Logging + History
 * Design: Abyss Interface — quick-add buttons, modal form, activity history
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, FileText, Filter } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { ACTIVITY_TYPES, calculateXP, type ActivityType } from '@/lib/gameEngine';
import SystemCard from '@/components/SystemCard';
import LevelUpModal from '@/components/LevelUpModal';

export default function Log() {
  const { logs, logActivity } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('study');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [duration, setDuration] = useState(30);
  const [quantity, setQuantity] = useState(0);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [lastXP, setLastXP] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);

  const previewXP = calculateXP(difficulty, duration, quantity);

  const filteredLogs = useMemo(() => {
    if (filterType === 'all') return logs;
    return logs.filter(l => l.type === filterType);
  }, [logs, filterType]);

  function openModal(type: ActivityType) {
    setSelectedType(type);
    setTitle(ACTIVITY_TYPES[type].label);
    setNotes('');
    setDifficulty(3);
    setDuration(30);
    setQuantity(0);
    setShowModal(true);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const result = logActivity(selectedType, title, notes, difficulty, duration, quantity);
    setLastXP(result.xpEarned);
    setShowXPGain(true);
    setTimeout(() => setShowXPGain(false), 2000);
    setShowModal(false);
    if (result.leveledUp) {
      setNewLevel(result.newLevel);
      setTimeout(() => setShowLevelUp(true), 300);
    }
  }

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Record your training, Hunter.</p>
        </motion.div>

        {/* XP Gain Toast */}
        <AnimatePresence>
          {showXPGain && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-sm backdrop-blur-sm"
            >
              <p className="font-heading text-lg text-cyan-400 text-glow-cyan">+{lastXP} XP</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Buttons */}
        <SystemCard title="Quick Log" delay={0.1}>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(ACTIVITY_TYPES) as [ActivityType, typeof ACTIVITY_TYPES[ActivityType]][]).map(([type, config]) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal(type)}
                className="flex flex-col items-center gap-1.5 p-3 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                <span className="text-2xl">{config.icon}</span>
                <span className="text-xs text-gray-400 font-medium">{config.label}</span>
              </motion.button>
            ))}
          </div>
        </SystemCard>

        {/* Activity History */}
        <SystemCard title="History" delay={0.2}>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <Filter size={12} className="text-gray-500 shrink-0" />
            <button
              onClick={() => setFilterType('all')}
              className={`text-[10px] px-2 py-1 rounded-sm whitespace-nowrap transition-colors ${
                filterType === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
              }`}
            >
              All
            </button>
            {(Object.entries(ACTIVITY_TYPES) as [ActivityType, typeof ACTIVITY_TYPES[ActivityType]][]).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[10px] px-2 py-1 rounded-sm whitespace-nowrap transition-colors ${
                  filterType === type ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
                }`}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredLogs.map((log, i) => {
              const config = ACTIVITY_TYPES[log.type];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-sm border-l-2"
                  style={{ borderLeftColor: config.color }}
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{log.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {log.durationMinutes > 0 && <span>· {log.durationMinutes}min</span>}
                      <span>· Diff {log.difficulty}/5</span>
                    </div>
                    {log.notes && <p className="text-[10px] text-gray-600 mt-0.5">{log.notes}</p>}
                  </div>
                  <span className="text-xs text-cyan-400 font-mono shrink-0">+{log.xpEarned}</span>
                </motion.div>
              );
            })}
            {filteredLogs.length === 0 && (
              <p className="text-center py-8 text-xs text-gray-600 font-mono">
                No activities found. Start logging to earn XP!
              </p>
            )}
          </div>
        </SystemCard>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
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
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ACTIVITY_TYPES[selectedType].icon}</span>
                  <h3 className="font-heading text-lg font-bold text-white">Log Activity</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    placeholder="Activity name..."
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">
                    Difficulty: <span className="text-cyan-400">{difficulty}/5</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 rounded-sm text-sm font-mono transition-all ${
                          d <= difficulty
                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-600'
                        }`}
                      >
                        <Star size={14} className={`mx-auto ${d <= difficulty ? 'fill-cyan-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">
                    Duration (minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none"
                      min={0}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">
                    Quantity (reps, pages, etc.)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none"
                    min={0}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none resize-none"
                    placeholder="Optional notes..."
                  />
                </div>

                {/* XP Preview */}
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-sm text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Estimated XP</p>
                  <p className="font-heading text-2xl font-bold text-cyan-400 text-glow-cyan">+{previewXP}</p>
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-heading text-sm tracking-wider uppercase hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Log Activity
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

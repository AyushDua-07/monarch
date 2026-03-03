/*
 * Activity Log Page — Quest History & Activity Timeline
 * Design: Abyss Interface — quest-focused activity history, no quick log
 * Shows completed/failed quest logs grouped by date
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Filter, TrendingUp, TrendingDown, Swords, Calendar } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { ACTIVITY_TYPES, DEMON_LEVELS, type ActivityType, type DemonLevel } from '@/lib/gameEngine';
import { getDemonImage } from '@/lib/assets';
import SystemCard from '@/components/SystemCard';

export default function Log() {
  const { logs, quests } = useGame();
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');

  const filteredLogs = useMemo(() => {
    const filtered = filterType === 'all' ? logs : logs.filter(l => l.type === filterType);
    return filtered;
  }, [logs, filterType]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};
    filteredLogs.forEach(log => {
      const dateKey = new Date(log.createdAt).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Summary stats
  const totalXPEarned = logs.reduce((sum, l) => sum + l.xpEarned, 0);
  const totalCompleted = quests.filter(q => q.status === 'completed').length;
  const totalFailed = quests.filter(q => q.status === 'failed').length;

  // Get unique activity types that have logs
  const activeTypes = useMemo(() => {
    const types = new Set(logs.map(l => l.type));
    return Array.from(types);
  }, [logs]);

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Quest completion history and XP timeline.</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <SystemCard delay={0.05} className="text-center">
            <TrendingUp size={14} className="mx-auto mb-1 text-cyan-400" />
            <p className="font-mono text-lg font-bold text-cyan-400">{totalXPEarned}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Total XP</p>
          </SystemCard>
          <SystemCard delay={0.1} className="text-center">
            <Swords size={14} className="mx-auto mb-1 text-emerald-400" />
            <p className="font-mono text-lg font-bold text-emerald-400">{totalCompleted}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Completed</p>
          </SystemCard>
          <SystemCard delay={0.15} className="text-center">
            <TrendingDown size={14} className="mx-auto mb-1 text-red-400" />
            <p className="font-mono text-lg font-bold text-red-400">{totalFailed}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Failed</p>
          </SystemCard>
        </div>

        {/* Filter */}
        {activeTypes.length > 0 && (
          <SystemCard delay={0.2}>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter size={12} className="text-gray-500 shrink-0" />
              <button
                onClick={() => setFilterType('all')}
                className={`text-[10px] px-2 py-1 rounded-sm whitespace-nowrap transition-colors ${
                  filterType === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
                }`}
              >
                All
              </button>
              {activeTypes.map(type => {
                const config = ACTIVITY_TYPES[type];
                if (!config) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-[10px] px-2 py-1 rounded-sm whitespace-nowrap transition-colors ${
                      filterType === type ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                );
              })}
            </div>
          </SystemCard>
        )}

        {/* Grouped Activity History */}
        {Object.keys(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([date, dateLogs], groupIndex) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2 mt-2">
                <Calendar size={12} className="text-gray-600" />
                <span className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">{date}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-gray-600 font-mono">
                  {dateLogs.reduce((sum, l) => sum + l.xpEarned, 0)} XP
                </span>
              </div>
              <div className="space-y-2">
                {dateLogs.map((log, i) => {
                  const config = ACTIVITY_TYPES[log.type];
                  const demonLevel = (log.difficulty || 1) as DemonLevel;
                  const demonConfig = DEMON_LEVELS[demonLevel] || DEMON_LEVELS[1];
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.05 + i * 0.02 }}
                      className="flex items-center gap-3 p-3 system-card rounded-sm"
                    >
                      <img
                        src={getDemonImage(demonLevel)}
                        alt={demonConfig.name}
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{log.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span>{config?.icon}</span>
                          <span style={{ color: demonConfig.color }}>{demonConfig.name}</span>
                          <span>·</span>
                          <Clock size={10} />
                          <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {log.notes && <p className="text-[10px] text-gray-600 mt-0.5">{log.notes}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-cyan-400 font-mono font-bold">+{log.xpEarned}</span>
                        <p className="text-[9px] text-gray-600 font-mono">XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <SystemCard delay={0.25}>
            <div className="text-center py-12">
              <Swords size={32} className="mx-auto mb-3 text-gray-700" />
              <p className="text-sm text-gray-500 font-mono">No activity logs yet.</p>
              <p className="text-xs text-gray-600 font-mono mt-1">Complete quests to see your history here.</p>
            </div>
          </SystemCard>
        )}
      </div>
    </div>
  );
}

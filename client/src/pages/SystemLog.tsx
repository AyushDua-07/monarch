/*
 * System Log — Full detailed system feed page
 * Design: Abyss Interface — logs stacked by date/time, scrollable
 * Shows all system events: quest completions, failures, level ups, rank changes, etc.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ScrollText, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import SystemCard from '@/components/SystemCard';

const TYPE_COLORS: Record<string, { text: string; bg: string; label: string }> = {
  levelUp: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'LEVEL UP' },
  questComplete: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'QUEST' },
  questFailed: { text: 'text-red-400', bg: 'bg-red-500/10', label: 'FAILED' },
  rankUp: { text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'RANK UP' },
  rankDown: { text: 'text-red-500', bg: 'bg-red-500/10', label: 'RANK DOWN' },
  penalty: { text: 'text-red-400', bg: 'bg-red-500/10', label: 'PENALTY' },
  title: { text: 'text-purple-400', bg: 'bg-purple-500/10', label: 'TITLE' },
  streak: { text: 'text-orange-400', bg: 'bg-orange-500/10', label: 'STREAK' },
  xpGain: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', label: 'XP' },
  xpLoss: { text: 'text-red-300', bg: 'bg-red-500/10', label: 'XP LOSS' },
  questCreated: { text: 'text-blue-400', bg: 'bg-blue-500/10', label: 'NEW' },
  system: { text: 'text-gray-400', bg: 'bg-gray-500/10', label: 'SYSTEM' },
};

export default function SystemLogPage() {
  const { systemLog } = useGame();

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof systemLog> = {};
    systemLog.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    return groups;
  }, [systemLog]);

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 text-gray-500 hover:text-cyan-400 transition-colors">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">System Log</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {systemLog.length} total entries
            </p>
          </div>
        </motion.div>

        {/* Grouped Logs */}
        {Object.entries(grouped).map(([date, entries], groupIdx) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2 mt-2">
              <Calendar size={12} className="text-gray-600" />
              <span className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">{date}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="space-y-1.5">
              {entries.map((entry, i) => {
                const config = TYPE_COLORS[entry.type] || TYPE_COLORS.system;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIdx * 0.03 + i * 0.02 }}
                    className="flex items-start gap-2 p-2.5 system-card rounded-sm"
                  >
                    <div className="shrink-0 mt-0.5">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-mono font-bold ${config.text} ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300 leading-relaxed">{entry.message}</p>
                      <p className="text-[9px] text-gray-600 font-mono mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                    {entry.xpChange != null && entry.xpChange !== 0 && (
                      <span className={`text-[10px] font-mono font-bold shrink-0 ${entry.xpChange > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {entry.xpChange > 0 ? '+' : ''}{entry.xpChange}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {systemLog.length === 0 && (
          <SystemCard>
            <div className="text-center py-12">
              <ScrollText size={32} className="mx-auto mb-3 text-gray-700" />
              <p className="text-sm text-gray-500 font-mono">No system events yet.</p>
            </div>
          </SystemCard>
        )}
      </div>
    </div>
  );
}

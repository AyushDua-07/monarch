/*
 * Stats Page — Stat breakdown, charts, AI summary, monthly analysis
 * Design: Abyss Interface — animated stat grid, radar chart, XP over time, monthly report
 * All values derived from actual quests — no dummy data
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Brain, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar } from 'recharts';
import { useGame } from '@/contexts/GameContext';
import { type UserStats, ACTIVITY_TYPES, DEMON_LEVELS, generateStatSummary, generateMonthlyReport, type DemonLevel } from '@/lib/gameEngine';
import SystemCard from '@/components/SystemCard';

const STAT_CONFIG: Record<keyof UserStats, { label: string; color: string; icon: string }> = {
  strength: { label: 'Strength', color: '#ef4444', icon: '⚔️' },
  endurance: { label: 'Endurance', color: '#f97316', icon: '🛡️' },
  intelligence: { label: 'Intelligence', color: '#3b82f6', icon: '🧠' },
  discipline: { label: 'Discipline', color: '#a855f7', icon: '🎯' },
  charisma: { label: 'Charisma', color: '#ec4899', icon: '✨' },
  luck: { label: 'Luck', color: '#22c55e', icon: '🍀' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Stats() {
  const { user, logs, quests, allocateStat } = useGame();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // AI Summary
  const aiSummary = useMemo(() => generateStatSummary(user, quests, logs), [user, quests, logs]);

  // Monthly report
  const monthlyReport = useMemo(
    () => generateMonthlyReport(logs, quests, selectedMonth, selectedYear),
    [logs, quests, selectedMonth, selectedYear]
  );

  // XP over time chart data
  const xpChartData = useMemo(() => {
    const days: { date: string; xp: number }[] = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayXP = logs
        .filter(l => l.createdAt.startsWith(dateStr))
        .reduce((sum, l) => sum + l.xpEarned, 0);
      days.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        xp: dayXP,
      });
    }
    return days;
  }, [logs, timeRange]);

  // Quest-based activity breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(l => {
      const label = ACTIVITY_TYPES[l.type]?.label || 'Other';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const PIE_COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#22c55e', '#fbbf24', '#00d4ff', '#ec4899', '#f97316'];

  // Quest completion rate
  const totalQuests = quests.length;
  const completedQuests = quests.filter(q => q.status === 'completed').length;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // Radar chart data
  const radarData = Object.entries(user.stats).map(([key, val]) => ({
    stat: STAT_CONFIG[key as keyof UserStats]?.label.slice(0, 3).toUpperCase() || key,
    value: val,
    fullMark: Math.max(20, val + 10),
  }));

  // Monthly daily XP bar chart
  const monthlyDailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];
    for (let d = 1; d <= daysInMonth; d++) {
      data.push({
        day: d.toString(),
        xp: monthlyReport.dailyXP[d.toString()] || 0,
      });
    }
    return data;
  }, [monthlyReport, selectedMonth, selectedYear]);

  function prevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  }
  function nextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  }

  return (
    <div className="min-h-screen pb-safe">
      <div className="container py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading text-2xl font-bold text-white">Hunter Stats</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">Analyze your growth, Hunter.</p>
        </motion.div>

        {/* AI Summary */}
        <SystemCard title="Intelligence Report" delay={0.05} glow>
          <div className="flex items-start gap-2">
            <Brain size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 leading-relaxed">{aiSummary}</p>
          </div>
        </SystemCard>

        {/* Stat Allocation */}
        {user.statPoints > 0 && (
          <SystemCard title="Allocate Stat Points" glow delay={0.08}>
            <p className="text-xs text-amber-400 font-mono mb-3">
              You have <span className="text-lg font-bold">{user.statPoints}</span> points to distribute
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(user.stats) as [keyof UserStats, number][]).map(([key, val]) => {
                const config = STAT_CONFIG[key];
                return (
                  <div key={key} className="flex items-center gap-2 p-2 bg-white/[0.02] rounded-sm">
                    <span className="text-sm">{config.icon}</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase">{config.label}</p>
                      <p className="font-mono text-sm text-white">{val}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => allocateStat(key)}
                      className="w-7 h-7 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-sm hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </SystemCard>
        )}

        {/* Radar Chart */}
        <SystemCard title="Stat Radar" delay={0.1}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(0, 212, 255, 0.1)" />
                <PolarAngleAxis
                  dataKey="stat"
                  tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Radar
                  dataKey="value"
                  stroke="#00d4ff"
                  fill="#00d4ff"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SystemCard>

        {/* Detailed Stats — quest-based values */}
        <SystemCard title="Detailed Stats" delay={0.15}>
          <div className="space-y-2">
            {(Object.entries(user.stats) as [keyof UserStats, number][]).map(([key, val]) => {
              const config = STAT_CONFIG[key];
              const maxVal = Math.max(20, val + 5);
              const pct = (val / maxVal) * 100;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-5">{config.icon}</span>
                  <span className="text-[10px] text-gray-500 uppercase w-16 font-mono">{config.label}</span>
                  <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                  <span className="font-mono text-sm text-white w-8 text-right">{val}</span>
                </div>
              );
            })}
          </div>
          {logs.length === 0 && (
            <p className="text-[10px] text-gray-600 font-mono mt-3 text-center">
              Complete quests to increase your stats.
            </p>
          )}
        </SystemCard>

        {/* XP Over Time */}
        <SystemCard title="XP Over Time" delay={0.2}>
          <div className="flex gap-2 mb-3">
            {([7, 30, 90] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-[10px] px-2 py-1 rounded-sm font-mono transition-colors ${
                  timeRange === range ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 border border-transparent'
                }`}
              >
                {range}D
              </button>
            ))}
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpChartData}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'rgba(0, 212, 255, 0.1)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0e1e',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#00d4ff' }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#00d4ff"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SystemCard>

        {/* Activity Breakdown */}
        <SystemCard title="Activity Breakdown" delay={0.25}>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-400 flex-1">{item.name}</span>
                    <span className="text-xs text-white font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-6 text-xs text-gray-600 font-mono">Complete quests to see activity breakdown.</p>
          )}
        </SystemCard>

        {/* Quest Completion Rate */}
        <SystemCard title="Quest Completion" delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.1)"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${completionRate}, 100` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-lg font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white font-medium">{completedQuests} of {totalQuests} quests</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">
                <TrendingUp size={10} className="inline mr-1" />
                {totalQuests === 0 ? 'Create quests to track completion.' : 'Keep pushing, Hunter.'}
              </p>
            </div>
          </div>
        </SystemCard>

        {/* Monthly Analysis */}
        <SystemCard title="Monthly Analysis" delay={0.35}>
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-gray-500 hover:text-cyan-400 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-cyan-400" />
              <span className="font-mono text-sm text-white">
                {MONTHS[selectedMonth]} {selectedYear}
              </span>
            </div>
            <button onClick={nextMonth} className="p-1 text-gray-500 hover:text-cyan-400 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Monthly Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-white/[0.02] rounded-sm text-center">
              <p className="font-mono text-lg font-bold text-cyan-400">{monthlyReport.totalXP}</p>
              <p className="text-[9px] text-gray-500 uppercase">XP Earned</p>
            </div>
            <div className="p-2 bg-white/[0.02] rounded-sm text-center">
              <p className="font-mono text-lg font-bold text-white">{monthlyReport.totalLogs}</p>
              <p className="text-[9px] text-gray-500 uppercase">Activities</p>
            </div>
            <div className="p-2 bg-white/[0.02] rounded-sm text-center">
              <p className="font-mono text-lg font-bold text-emerald-400">{monthlyReport.completedQuests}</p>
              <p className="text-[9px] text-gray-500 uppercase">Completed</p>
            </div>
            <div className="p-2 bg-white/[0.02] rounded-sm text-center">
              <p className="font-mono text-lg font-bold text-red-400">{monthlyReport.failedQuests}</p>
              <p className="text-[9px] text-gray-500 uppercase">Failed</p>
            </div>
          </div>

          {/* Daily XP Bar Chart */}
          {monthlyReport.totalLogs > 0 ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDailyData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#6b7280', fontSize: 7, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(0, 212, 255, 0.1)' }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 8, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0e1e',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '2px',
                      fontSize: '10px',
                      fontFamily: 'JetBrains Mono',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    formatter={(value: number) => [`${value} XP`, 'XP']}
                    labelFormatter={(label: string) => `Day ${label}`}
                  />
                  <Bar dataKey="xp" fill="#00d4ff" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-4 text-xs text-gray-600 font-mono">
              No data for this month yet.
            </p>
          )}

          {/* Completion Rate */}
          {monthlyReport.totalQuests > 0 && (
            <div className="mt-3 p-2 bg-white/[0.02] rounded-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 font-mono">Completion Rate</span>
                <span className="text-[10px] text-cyan-400 font-mono">{monthlyReport.completionRate}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyReport.completionRate}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </SystemCard>
      </div>
    </div>
  );
}

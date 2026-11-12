import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Folder, 
} from 'lucide-react';
import { Task, Project } from '../types';

interface AnalyticsDashboardViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  tasks,
  projects,
  onSelectTask,
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  const momentumDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, offset) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - offset));
      const count = tasks.filter(task => {
        if (task.status !== 'done' || !task.completedAt) return false;
        const completed = new Date(task.completedAt);
        return completed.toDateString() === day.toDateString();
      }).length;
      return { day, count };
    });
  }, [tasks]);

  const nextStep = useMemo(() => {
    const active = tasks.filter(task => task.status !== 'done');
    const overdue = active.find(task => task.dueDate && new Date(task.dueDate).getTime() < Date.now());
    return overdue || active.find(task => task.status === 'in_progress') || active[0];
  }, [tasks]);

  // Computed metrics from real user tasks
  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const todoTasks = tasks.filter(t => t.status === 'todo');

  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Total recorded focus time in hours
  const totalFocusSeconds = tasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);
  const focusHours = (totalFocusSeconds / 3600).toFixed(1);

  // Productivity trend from recorded completion timestamps, with no illustrative sample data.
  const trendConfig = useMemo(() => {
    const now = new Date();
    const binCount = timeframe === 'week' ? 7 : timeframe === 'month' ? 5 : 12;
    const bins = Array.from({ length: binCount }, (_, index) => {
      const start = new Date(now);
      if (timeframe === 'week') start.setDate(now.getDate() - (binCount - 1 - index));
      else if (timeframe === 'month') start.setDate(now.getDate() - (binCount - 1 - index) * 7);
      else start.setMonth(now.getMonth() - (binCount - 1 - index));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      if (timeframe === 'week') end.setDate(start.getDate() + 1);
      else if (timeframe === 'month') end.setDate(start.getDate() + 7);
      else end.setMonth(start.getMonth() + 1);
      const count = tasks.filter(task => {
        if (task.status !== 'done' || !task.completedAt) return false;
        const completed = new Date(task.completedAt);
        return completed >= start && completed < end;
      }).length;
      const label = timeframe === 'week'
        ? start.toLocaleDateString(undefined, { weekday: 'short' })
        : timeframe === 'month' ? `W${index + 1}` : start.toLocaleDateString(undefined, { month: 'short' });
      return { count, label };
    });
    const peakCount = Math.max(0, ...bins.map(bin => bin.count));
    const points = bins.map((bin, index) => ({
      cx: 50 + index * (600 / Math.max(1, binCount - 1)),
      cy: 165 - (peakCount ? bin.count / peakCount : 0) * 115,
      label: bin.label,
    }));
    const pathD = points.map((point, index) => `${index ? 'L' : 'M'} ${point.cx} ${point.cy}`).join(' ');
    const areaD = `${pathD} L 650 180 L 50 180 Z`;
    return {
      label: timeframe === 'week' ? 'Completions by day' : timeframe === 'month' ? 'Completions by week' : 'Completions by month',
      peak: `${peakCount} ${peakCount === 1 ? 'task' : 'tasks'} · busiest period`,
      points,
      pathD,
      areaD,
    };
  }, [timeframe, tasks]);

  // Task distribution percentages
  const todoPct = totalTasks ? Math.round((todoTasks.length / totalTasks) * 100) : 0;
  const inProgPct = totalTasks ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0;
  const donePct = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 select-none space-y-6">
      
      {/* =======================================================================
          1. HEADER WITH TIMEFRAME PILLS
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-300/60 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white drop-shadow-xs">
            Your Productivity Insights
          </h1>
          <p className="text-xs font-medium text-stone-600 dark:text-white/60">
            Track. Improve. Achieve.
          </p>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-stone-900/10 dark:bg-black/60 backdrop-blur-xl border border-stone-300 dark:border-white/15 shadow-md">
          {(['week', 'month', 'year'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                timeframe === tf
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* =======================================================================
          2. TOP 4 METRIC KPI CARDS
          ======================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Completion Rate */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-semibold">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {completionRate}%
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              of all tasks
            </span>
          </div>
          <span className="text-[10px] text-white/40 block mt-1">vs previous cycle</span>
        </div>

        {/* Metric 2: Focus Time */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-semibold">Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {focusHours}h
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              recorded
            </span>
          </div>
          <span className="text-[10px] text-white/40 block mt-1">Deep work sessions</span>
        </div>

        {/* Metric 3: Tasks Done */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-semibold">Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {completedTasks.length}
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              total
            </span>
          </div>
          <span className="text-[10px] text-white/40 block mt-1">Completed milestones</span>
        </div>

        {/* Metric 4: Active Projects */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-semibold">Active Projects</span>
            <Folder className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {projects.length}
            </h2>
            <span className="text-[11px] font-bold text-amber-300">
              total
            </span>
          </div>
          <span className="text-[10px] text-white/40 block mt-1">Work & Personal streams</span>
        </div>

      </div>

      {/* =======================================================================
          3. MIDDLE SECTION: PRODUCTIVITY TREND & TASK DISTRIBUTION
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Productivity Trend Smooth Area Chart */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div>
              <h3 className="font-extrabold text-sm text-white">Productivity Trend</h3>
              <p className="text-[10px] text-white/50">{trendConfig.label}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold">
              {trendConfig.peak}
            </span>
          </div>

          {/* SVG Area Chart */}
          <div className="relative w-full h-44 sm:h-52">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

              {/* Smooth filled area */}
              <path
                d={trendConfig.areaD}
                fill="url(#trendGradient)"
                className="transition-all duration-500"
              />

              {/* Smooth line */}
              <path
                d={trendConfig.pathD}
                fill="none"
                stroke="#34d399"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />

              {/* Data points */}
              {trendConfig.points.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
                  <text x={pt.cx} y={195} fill="rgba(255,255,255,0.5)" fontSize={11} textAnchor="middle" fontFamily="sans-serif">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Task Distribution Donut / Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex flex-col justify-between">
          <div className="pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white">Task Distribution</h3>
            <p className="text-[10px] text-white/50">Current state breakdown</p>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>To Do</span>
                </span>
                <span className="font-mono">{todoPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${todoPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>In Progress</span>
                </span>
                <span className="font-mono">{inProgPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${inProgPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Completed</span>
                </span>
                <span className="font-mono">{donePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${donePct}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-center text-[10px] text-white/50">
            Total active footprint: {tasks.length} tasks
          </div>
        </div>

      </div>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-3xl border border-amber-100/20 bg-gradient-to-br from-[#49301f]/95 via-[#312820]/95 to-[#201b1b]/95 p-5 sm:p-6 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-300">Your week, at a glance</p>
              <h2 className="mt-1 text-xl font-black">Momentum Map</h2>
              <p className="mt-1 text-xs text-white/60">Completed notes by day. Each mark represents a finished task.</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3" role="list" aria-label="Tasks completed each of the last seven days">
            {momentumDays.map(({ day, count }) => (
              <div key={day.toISOString()} role="listitem" className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-white/55">{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <div className="flex h-16 w-full items-end justify-center rounded-xl border border-white/10 bg-black/20 p-1.5" title={`${count} completed ${count === 1 ? 'task' : 'tasks'}`}>
                  <div className="w-full rounded-md bg-gradient-to-t from-emerald-600 to-teal-300 transition-all" style={{ height: `${Math.min(100, count * 28 + 8)}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-200">{count}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-white/45">Based on completion dates recorded in your tasks.</p>
        </div>
        <div className="lg:col-span-2 flex flex-col justify-between rounded-3xl border border-amber-100/20 bg-[#f8edda]/95 p-5 sm:p-6 text-stone-900 shadow-2xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-800">A gentle nudge</p>
            <h2 className="mt-1 text-xl font-black">One clear next step</h2>
            <p className="mt-2 text-xs text-stone-600">Keep the day moving by returning to one useful task.</p>
          </div>
          {nextStep ? (
            <button type="button" onClick={() => onSelectTask(nextStep)} className="mt-5 rounded-2xl border border-stone-900/10 bg-white/75 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500">
              <span className="block font-handwriting text-xl font-bold leading-snug">{nextStep.title}</span>
              <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-stone-500">{nextStep.status === 'in_progress' ? 'In progress' : 'Ready when you are'} · Open note →</span>
            </button>
          ) : (
            <p className="mt-5 rounded-2xl bg-white/75 p-4 font-handwriting text-lg">Everything is complete. Enjoy the clear desk.</p>
          )}
          <p className="mt-4 text-[10px] text-stone-500">Suggested from your current task list; nothing is scheduled automatically.</p>
        </div>
      </section>

    </div>
  );
};

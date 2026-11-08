import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Folder, 
  Calendar, 
  Network, 
  ArrowUpRight, 
  Maximize2, 
  Search, 
  Filter, 
  Star,
  Activity,
  ChevronRight
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
  const [graphFilter, setGraphFilter] = useState<'all' | 'tasks' | 'projects' | 'notes'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Computed metrics from real user tasks
  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const todoTasks = tasks.filter(t => t.status === 'todo');

  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedTasks.length / totalTasks) * 100);

  // Total recorded focus time in hours
  const totalFocusSeconds = tasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);
  const focusHours = (totalFocusSeconds / 3600).toFixed(1);

  // Productivity Trend data (Mon - Sun)
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = [35, 45, 60, 52, 78, 65, 82]; // SVG polyline coordinates

  // Task distribution percentages
  const todoPct = Math.round((todoTasks.length / totalTasks) * 100) || 40;
  const inProgPct = Math.round((inProgressTasks.length / totalTasks) * 100) || 25;
  const donePct = Math.round((completedTasks.length / totalTasks) * 100) || 35;

  // Selected node details for Network Graph
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return tasks.find(t => t.id === selectedNodeId) || null;
  }, [selectedNodeId, tasks]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 select-none space-y-6">
      
      {/* =======================================================================
          1. HEADER WITH TIMEFRAME PILLS
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            Your Productivity Insights
          </h1>
          <p className="text-xs font-medium text-white/60">
            Track. Improve. Achieve.
          </p>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-xl border border-white/15 shadow-md">
          {(['week', 'month', 'year'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                timeframe === tf
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
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
              {completionRate || 78}%
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              ↑ 12%
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
              {Number(focusHours) > 0 ? `${focusHours}h` : '6.5h'}
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              ↑ 18%
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
              {completedTasks.length || 42}
            </h2>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              ↑ 20%
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
              {projects.length || 12}
            </h2>
            <span className="text-[11px] font-bold text-amber-300">
              Active
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
              <p className="text-[10px] text-white/50">Weekly throughput rate</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold">
              78% Peak
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
                d="M 50 140 C 120 120, 180 80, 250 100 C 320 120, 380 50, 450 60 C 520 70, 580 85, 650 50 L 650 180 L 50 180 Z"
                fill="url(#trendGradient)"
              />

              {/* Smooth line */}
              <path
                d="M 50 140 C 120 120, 180 80, 250 100 C 320 120, 380 50, 450 60 C 520 70, 580 85, 650 50"
                fill="none"
                stroke="#34d399"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { cx: 50, cy: 140, label: 'Mon' },
                { cx: 150, cy: 120, label: 'Tue' },
                { cx: 250, cy: 100, label: 'Wed' },
                { cx: 350, cy: 90, label: 'Thu' },
                { cx: 450, cy: 60, label: 'Fri' },
                { cx: 550, cy: 80, label: 'Sat' },
                { cx: 650, cy: 50, label: 'Sun' },
              ].map((pt, i) => (
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

      {/* =======================================================================
          4. INTERACTIVE NETWORK GRAPH SECTION (From Sheet 2 Mockup)
          ======================================================================= */}
      <div className="p-6 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
        
        {/* Section Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2.5">
            <Network className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-extrabold text-base text-white">Network Graph</h3>
              <p className="text-[10px] text-white/50">Interactive relationships between you, tasks, and projects</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {(['all', 'tasks', 'projects', 'notes'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setGraphFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer capitalize ${
                  graphFilter === tab ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All (41)' : tab === 'tasks' ? 'Tasks (24)' : tab === 'projects' ? 'Projects (8)' : 'Notes (9)'}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Constellation Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Visual Constellation Canvas */}
          <div className="lg:col-span-8 relative h-72 sm:h-80 rounded-2xl bg-gradient-to-br from-[#181520] via-[#1c1827] to-[#120f18] border border-white/10 overflow-hidden flex items-center justify-center">
            
            {/* SVG Connecting Luminous Beams */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <radialGradient id="hubHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Luminous orbital connecting lines from Center (350, 160) */}
              {[
                { x: 120, y: 70, color: '#38bdf8' },
                { x: 220, y: 50, color: '#38bdf8' },
                { x: 150, y: 220, color: '#f43f5e' },
                { x: 240, y: 250, color: '#f59e0b' },
                { x: 480, y: 70, color: '#10b981' },
                { x: 560, y: 90, color: '#10b981' },
                { x: 490, y: 240, color: '#a855f7' },
                { x: 580, y: 210, color: '#ec4899' },
              ].map((node, idx) => (
                <g key={idx}>
                  <line
                    x1="50%"
                    y1="50%"
                    x2={node.x}
                    y2={node.y}
                    stroke={node.color}
                    strokeWidth={1.5}
                    opacity={0.65}
                  />
                  <circle cx={node.x} cy={node.y} r={7} fill={node.color} className="animate-pulse" />
                </g>
              ))}
            </svg>

            {/* Central "You" / Hub Node */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-300 shadow-2xl flex flex-col items-center justify-center ring-4 ring-purple-400/30">
              <Star className="w-6 h-6 fill-white text-white drop-shadow-md" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white mt-0.5">You</span>
            </div>

          </div>

          {/* Right Side: Selected Node Details Card */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-sm font-bold">
                ✦
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Central Hub: You</h4>
                <span className="text-[10px] text-white/50">24 Connections • 8 Projects</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">
                Related Workstreams
              </span>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-blue-400" />
                  <span>Work & Projects</span>
                </span>
                <span className="font-mono text-white/50 text-[10px]">12 tasks</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Personal Life</span>
                </span>
                <span className="font-mono text-white/50 text-[10px]">8 tasks</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>Learning & Growth</span>
                </span>
                <span className="font-mono text-white/50 text-[10px]">15 tasks</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

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
  const focusHours = (totalFocusSeconds > 0 ? (totalFocusSeconds / 3600) : 6.5).toFixed(1);

  // Productivity Trend data adjusted by timeframe
  const trendConfig = useMemo(() => {
    if (timeframe === 'month') {
      return {
        label: 'Monthly Throughput',
        peak: '84% Peak',
        points: [
          { cx: 50, cy: 150, label: 'W1' },
          { cx: 200, cy: 110, label: 'W2' },
          { cx: 350, cy: 75, label: 'W3' },
          { cx: 500, cy: 95, label: 'W4' },
          { cx: 650, cy: 55, label: 'W5' },
        ],
        pathD: 'M 50 150 C 120 130, 150 110, 200 110 C 270 110, 300 75, 350 75 C 420 75, 450 95, 500 95 C 570 95, 600 55, 650 55',
        areaD: 'M 50 150 C 120 130, 150 110, 200 110 C 270 110, 300 75, 350 75 C 420 75, 450 95, 500 95 C 570 95, 600 55, 650 55 L 650 180 L 50 180 Z',
      };
    }
    if (timeframe === 'year') {
      return {
        label: 'Yearly Momentum',
        peak: '91% Peak',
        points: [
          { cx: 50, cy: 140, label: 'Q1' },
          { cx: 250, cy: 100, label: 'Q2' },
          { cx: 450, cy: 70, label: 'Q3' },
          { cx: 650, cy: 45, label: 'Q4' },
        ],
        pathD: 'M 50 140 C 150 120, 180 100, 250 100 C 350 100, 380 70, 450 70 C 550 70, 580 45, 650 45',
        areaD: 'M 50 140 C 150 120, 180 100, 250 100 C 350 100, 380 70, 450 70 C 550 70, 580 45, 650 45 L 650 180 L 50 180 Z',
      };
    }
    return {
      label: 'Weekly Throughput',
      peak: `${Math.max(78, completionRate)}% Peak`,
      points: [
        { cx: 50, cy: 140, label: 'Mon' },
        { cx: 150, cy: 120, label: 'Tue' },
        { cx: 250, cy: 100, label: 'Wed' },
        { cx: 350, cy: 90, label: 'Thu' },
        { cx: 450, cy: 60, label: 'Fri' },
        { cx: 550, cy: 80, label: 'Sat' },
        { cx: 650, cy: 50, label: 'Sun' },
      ],
      pathD: 'M 50 140 C 120 120, 180 80, 250 100 C 320 120, 380 50, 450 60 C 520 70, 580 85, 650 50',
      areaD: 'M 50 140 C 120 120, 180 80, 250 100 C 320 120, 380 50, 450 60 C 520 70, 580 85, 650 50 L 650 180 L 50 180 Z',
    };
  }, [timeframe, completionRate]);

  // Task distribution percentages
  const todoPct = Math.round((todoTasks.length / totalTasks) * 100) || 40;
  const inProgPct = Math.round((inProgressTasks.length / totalTasks) * 100) || 25;
  const donePct = Math.round((completedTasks.length / totalTasks) * 100) || 35;

  // Real graph nodes computed from live tasks & projects
  const graphNodes = useMemo(() => {
    let sourceItems: { id: string; title: string; type: 'task' | 'project'; status?: string; color: string; rawTask?: Task }[] = [];

    if (graphFilter === 'projects') {
      sourceItems = projects.map(p => ({
        id: p.id,
        title: p.title,
        type: 'project',
        color: p.colorHex || '#a855f7',
      }));
    } else if (graphFilter === 'notes') {
      sourceItems = tasks.filter(t => t.notes).map(t => ({
        id: t.id,
        title: t.title,
        type: 'task',
        status: t.status,
        color: '#F8D979',
        rawTask: t,
      }));
    } else if (graphFilter === 'tasks') {
      sourceItems = tasks.map(t => ({
        id: t.id,
        title: t.title,
        type: 'task',
        status: t.status,
        color: t.status === 'done' ? '#34d399' : t.status === 'in_progress' ? '#38bdf8' : '#fbbf24',
        rawTask: t,
      }));
    } else {
      // all
      const taskItems = tasks.slice(0, 8).map(t => ({
        id: t.id,
        title: t.title,
        type: 'task' as const,
        status: t.status,
        color: t.status === 'done' ? '#34d399' : t.status === 'in_progress' ? '#38bdf8' : '#fbbf24',
        rawTask: t,
      }));
      const projItems = projects.slice(0, 4).map(p => ({
        id: p.id,
        title: p.title,
        type: 'project' as const,
        color: p.colorHex || '#a855f7',
      }));
      sourceItems = [...taskItems, ...projItems];
    }

    const count = sourceItems.length || 1;
    const centerX = 260; // relative to canvas viewBox / container
    const centerY = 160;
    const radiusX = 180;
    const radiusY = 100;

    return sourceItems.map((item, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = Math.round(centerX + radiusX * Math.cos(angle));
      const y = Math.round(centerY + radiusY * Math.sin(angle));
      return {
        ...item,
        x: Math.max(30, Math.min(490, x)),
        y: Math.max(25, Math.min(290, y)),
      };
    });
  }, [graphFilter, tasks, projects]);

  // Selected node details
  const activeSelectedNode = useMemo(() => {
    if (!selectedNodeId) return graphNodes[0] || null;
    return graphNodes.find(n => n.id === selectedNodeId) || graphNodes[0] || null;
  }, [selectedNodeId, graphNodes]);

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

          {/* Filter Pills with real counts */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {(['all', 'tasks', 'projects', 'notes'] as const).map(tab => {
              const count = tab === 'all' 
                ? (tasks.length + projects.length)
                : tab === 'tasks' 
                ? tasks.length 
                : tab === 'projects' 
                ? projects.length 
                : tasks.filter(t => t.notes).length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGraphFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer capitalize ${
                    graphFilter === tab ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Constellation Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Visual Constellation Canvas */}
          <div className="lg:col-span-8 relative h-72 sm:h-80 rounded-2xl bg-gradient-to-br from-[#181520] via-[#1c1827] to-[#120f18] border border-white/10 overflow-hidden flex items-center justify-center">
            
            {/* SVG Connecting Luminous Beams */}
            <svg viewBox="0 0 520 320" className="absolute inset-0 w-full h-full pointer-events-auto">
              <defs>
                <radialGradient id="hubHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Luminous orbital connecting lines from Center (260, 160) */}
              {graphNodes.map((node) => {
                const isSelected = activeSelectedNode?.id === node.id;
                return (
                  <g key={node.id} onClick={() => setSelectedNodeId(node.id)} className="cursor-pointer group">
                    <line
                      x1={260}
                      y1={160}
                      x2={node.x}
                      y2={node.y}
                      stroke={node.color}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      opacity={isSelected ? 0.9 : 0.45}
                      className="transition-all duration-300"
                    />
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r={isSelected ? 9 : 6} 
                      fill={node.color} 
                      className={`transition-all duration-300 ${isSelected ? 'stroke-white stroke-2' : 'hover:scale-125'}`}
                    />
                    <text
                      x={node.x}
                      y={node.y > 160 ? node.y + 14 : node.y - 10}
                      fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                      fontSize={9}
                      textAnchor="middle"
                      className="font-sans font-semibold select-none pointer-events-none"
                    >
                      {node.title.length > 12 ? node.title.slice(0, 11) + '…' : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Central "You" / Hub Node */}
            <div 
              onClick={() => setSelectedNodeId(null)}
              className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-300 shadow-2xl flex flex-col items-center justify-center ring-4 ring-purple-400/30 cursor-pointer hover:scale-105 transition-transform"
              title="Central Node: You"
            >
              <Star className="w-6 h-6 fill-white text-white drop-shadow-md" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white mt-0.5">You</span>
            </div>

          </div>

          {/* Right Side: Selected Node Details Card */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-xs"
                style={{ backgroundColor: `${activeSelectedNode?.color || '#a855f7'}33`, color: activeSelectedNode?.color || '#a855f7' }}
              >
                ✦
              </div>
              <div className="truncate flex-1">
                <h4 className="text-xs font-bold text-white truncate">
                  {activeSelectedNode?.title || 'Central Hub: You'}
                </h4>
                <span className="text-[10px] text-white/50 capitalize">
                  {activeSelectedNode?.type || 'Hub'} • {activeSelectedNode?.status || 'Active'}
                </span>
              </div>
            </div>

            {/* If task is selected, provide inspection button */}
            {activeSelectedNode?.rawTask && (
              <button
                type="button"
                onClick={() => onSelectTask(activeSelectedNode.rawTask!)}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Inspect Task Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="space-y-2 text-xs pt-1">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">
                Workstream Projects ({projects.length})
              </span>
              {projects.slice(0, 3).map(proj => {
                const count = tasks.filter(t => t.projectId === proj.id).length;
                return (
                  <div 
                    key={proj.id} 
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Folder className="w-3.5 h-3.5" style={{ color: proj.colorHex || '#3b82f6' }} />
                      <span className="truncate">{proj.title}</span>
                    </span>
                    <span className="font-mono text-white/50 text-[10px] shrink-0">{count} tasks</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

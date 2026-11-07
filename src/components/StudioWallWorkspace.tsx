import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FolderPlus, 
  FileText, 
  TrendingUp,
  Target,
  Columns3,
  LayoutGrid,
  Network,
  RotateCw,
  Play,
  Pause,
  Trash2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Task, Project, Priority, ViewMode, ThemeMode } from '../types';
import { RedPushPin } from './RedPushPin';
import { getDailyHyperFocusQuote, FocusQuote } from '../utils/quotes';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface StudioWallWorkspaceProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
  onOpenProjectModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenPermissions: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const StudioWallWorkspace: React.FC<StudioWallWorkspaceProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onMoveTaskStatus,
  audioEnabled,
  onQuickAdd,
  onOpenProjectModal,
  onOpenCategoryModal,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenPermissions,
  theme,
  onToggleTheme,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
}) => {
  // Quote of the day with exploration offset
  const [quoteOffset, setQuoteOffset] = useState<number>(0);
  const currentQuote: FocusQuote = useMemo(() => getDailyHyperFocusQuote(quoteOffset), [quoteOffset]);

  // Drag over column state for physical drop highlighting
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

  // Filter tasks into the three core wall zones
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Next upcoming tasks for right widget panel
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 4);
  }, [tasks]);

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(prev => prev + 1);
  };

  const handlePrevQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(prev => prev - 1);
  };

  const handleResetQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(0);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    onMoveTaskStatus(taskId, targetStatus);
    if (audioEnabled) playCompletionSound();

    if (targetStatus === 'done') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    }
  };

  // Formatted date string for top mural date indicator
  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden font-sans select-none studio-wall-background text-stone-900 dark:text-stone-100">
      
      {/* =========================================================================
          1. PHYSICAL STUDIO ATMOSPHERE: Warm Sunlight Beam, Leaf Shadows, Vignette
          ========================================================================= */}
      
      {/* Warm Directional Sunlight Beam entering from Top-Left */}
      <div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 10% 0%, rgba(255, 248, 220, 0.42) 0%, rgba(254, 240, 180, 0.18) 35%, transparent 75%)',
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 252, 235, 0.35) 0%, rgba(255, 243, 205, 0.15) 30%, transparent 60%)',
        }}
      />

      {/* Hanging Ivy Vine Leaves in Top-Left Corner (Studio Decoration) */}
      <div className="pointer-events-none absolute top-0 left-0 z-10 w-64 h-80 opacity-90 transition-opacity">
        <svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Main Vine Stems */}
          <path d="M 0 0 Q 40 40 50 120 T 70 240" stroke="#2d4a22" strokeWidth="2.5" fill="none" opacity="0.85" />
          <path d="M 0 10 Q 70 30 110 90 T 140 180" stroke="#365e26" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 0 0 Q 30 80 40 160 T 35 280" stroke="#233a1b" strokeWidth="2" fill="none" opacity="0.75" />
          
          {/* Leaves cluster 1 */}
          <path d="M 45 40 C 30 30 20 50 40 65 C 55 55 60 40 45 40 Z" fill="#4d7c0f" />
          <path d="M 52 50 C 40 45 35 60 50 72 C 62 65 65 52 52 50 Z" fill="#65a30d" />
          <path d="M 30 75 C 15 65 10 85 28 98 C 42 90 45 78 30 75 Z" fill="#3f6212" />
          
          {/* Leaves cluster 2 */}
          <path d="M 80 55 C 65 42 60 68 78 82 C 92 75 95 60 80 55 Z" fill="#4d7c0f" />
          <path d="M 105 85 C 90 70 85 95 102 110 C 118 102 120 88 105 85 Z" fill="#65a30d" />
          <path d="M 125 125 C 110 110 108 135 124 150 C 138 142 140 128 125 125 Z" fill="#3f6212" />
          
          {/* Lower delicate vine tips */}
          <path d="M 65 150 C 50 140 48 160 62 172 C 75 165 76 152 65 150 Z" fill="#65a30d" />
          <path d="M 68 200 C 55 190 52 210 65 220 C 76 214 78 202 68 200 Z" fill="#4d7c0f" />
          <path d="M 38 230 C 25 222 25 240 36 248 C 45 244 46 232 38 230 Z" fill="#365e26" />
        </svg>
      </div>

      {/* =========================================================================
          2. TOP HEADER BAR: Search, Theme Toggle & Notifications
          ========================================================================= */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Left spacing for aligned look with sidebar */}
        <div className="w-56 hidden lg:block" />

        {/* Center: Top Wall Search Pill */}
        <div className="flex-1 max-w-xl mx-auto">
          <div 
            onClick={onOpenCommandPalette}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/35 hover:bg-black/45 dark:bg-black/50 dark:hover:bg-black/65 backdrop-blur-xl border border-white/15 text-white/90 shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Search className="w-4 h-4 text-white/60 shrink-0" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Search tasks, notes, projects..."
              className="bg-transparent border-none text-xs text-white placeholder-white/50 focus:outline-none w-full cursor-pointer"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded-lg border border-white/15 text-white/70">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Utility Icons (Theme + Notification Bell) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white shadow-md transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Studio' : 'Switch to Dark Studio'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white/80" />}
          </button>

          <button
            type="button"
            onClick={onOpenPermissions}
            className="relative p-2 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white shadow-md transition cursor-pointer"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-black/40">
              2
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. MAIN LAYOUT: Left Glass Sidebar + Center Wall + Right Glass Panels
          ========================================================================= */}
      <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-6 pb-40 flex items-start gap-6">
        
        {/* =======================================================================
            LEFT FLOATING GLASS PANEL: Knovera / OmniSticky Navigation
            ======================================================================= */}
        <aside className="w-60 shrink-0 hidden lg:flex flex-col justify-between min-h-[640px] rounded-3xl p-5 bg-black/40 dark:bg-black/55 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
          
          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-300 shadow-md flex items-center justify-center text-white font-black text-base">
                ✦
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                  Knovera
                </h1>
                <p className="text-[10px] text-white/50 font-medium mt-0.5">
                  Plan • Focus • Achieve
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChangeViewMode('board')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Columns3 className="w-4 h-4 text-amber-300" />
                <span>My Board</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('focus')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${
                  viewMode === 'focus'
                    ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Target className="w-4 h-4 text-rose-300" />
                <span>Focus Room</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('canvas')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${
                  viewMode === 'canvas'
                    ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-emerald-300" />
                <span>Canvas Wall</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('connections')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${
                  viewMode === 'connections'
                    ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Network className="w-4 h-4 text-sky-300" />
                <span>Analytics / Network</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-stone-300" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Inspiration Floating Card & User Profile Pill */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            
            {/* Crystal Gem Inspiration Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/40 border border-purple-400/20 backdrop-blur-md shadow-md text-left">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-2">
                💎
              </div>
              <p className="text-xs font-bold text-white leading-tight">
                Small steps.
              </p>
              <p className="text-[11px] text-white/60">
                Big results. ↗
              </p>
            </div>

            {/* User Profile Pill */}
            <div 
              onClick={onOpenSettings}
              className="flex items-center justify-between p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs shrink-0">
                  SR
                </div>
                <span className="text-xs font-semibold text-white/90 truncate">
                  Sajjad Ur Rehman
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
            </div>

          </div>

        </aside>

        {/* =======================================================================
            CENTER: THE REALISTIC PHYSICAL STUDIO WALL
            ======================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col items-center">
          
          {/* Top Wall Art: "Dream Big Plan Better" with Hand-drawn Crown + Daily Rotating Quote */}
          <div className="text-center mb-7 relative select-none">
            
            {/* Hand-lettered Calligraphy Wall Inscription */}
            <div className="relative inline-block mb-1">
              <h2 
                className="text-4xl sm:text-5xl md:text-6xl text-stone-800 dark:text-amber-100/90 font-bold tracking-tight drop-shadow-sm font-handwriting"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.05)',
                }}
              >
                Dream Big
              </h2>

              {/* Hand-drawn Golden Crown doodle */}
              <div className="absolute -top-3.5 -right-9 text-amber-500/90 text-2xl rotate-12 drop-shadow-xs">
                👑
              </div>

              <p 
                className="text-2xl sm:text-3xl text-stone-700/90 dark:text-amber-200/80 font-semibold tracking-wide font-handwriting -mt-1 ml-6"
              >
                Plan Better
              </p>
            </div>

            {/* Dynamic Daily Rotating Motivational Quote System (105+ Curated Quotes) */}
            <div className="mt-2 flex items-center justify-center gap-2 max-w-xl mx-auto px-4">
              <button
                type="button"
                onClick={handlePrevQuote}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                title="Previous inspirational quote"
              >
                ‹
              </button>

              <div className="text-center px-3 py-1 rounded-xl bg-amber-50/50 dark:bg-black/30 border border-amber-200/40 dark:border-white/5 backdrop-blur-xs shadow-2xs">
                <p className="text-xs italic text-stone-700 dark:text-stone-200 font-serif leading-tight">
                  “{currentQuote.quote}”
                </p>
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] font-sans text-stone-400 dark:text-stone-500 font-medium">
                  <span>— {currentQuote.author}</span>
                  <span>•</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400/90 font-bold">{todayDateString}</span>
                  {quoteOffset !== 0 && (
                    <button
                      type="button"
                      onClick={handleResetQuote}
                      className="ml-1 text-blue-500 hover:underline cursor-pointer"
                    >
                      (Today)
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuote}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                title="Next inspirational quote"
              >
                ›
              </button>
            </div>

          </div>

          {/* =====================================================================
              3 DISTINCT STICKY NOTE ZONES: To Do | In Progress | Done
              ===================================================================== */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start max-w-5xl">
            
            {/* -------------------------------------------------------------------
                ZONE 1: TO DO (Warm Yellow & Peach Notes)
                ------------------------------------------------------------------- */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'todo')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'todo')}
              className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
                dragOverCol === 'todo' ? 'bg-amber-500/10 ring-2 ring-amber-400 scale-[1.01]' : ''
              }`}
            >
              {/* Pinned Title Card (Yellow index card pinned with cyan pin) */}
              <div className="relative mb-5 w-full max-w-[270px]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color="cyan" size={32} />
                </div>
                <div 
                  className="px-5 py-3 rounded-2xl bg-[#FFF380] border border-amber-300 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
                  style={{ transform: 'rotate(-0.8deg)' }}
                >
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-stone-700 stroke-[2.5]" />
                    <span className="font-extrabold">To Do</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-amber-400/60 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                    {todoTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Notes Stack */}
              <div className="w-full space-y-4">
                {todoTasks.map((task, idx) => {
                  const angles = [-1.8, 1.4, -0.9, 1.9, -1.5];
                  const angle = angles[idx % angles.length];
                  const pinColors: ('red' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'green')[] = ['red', 'cyan', 'blue', 'yellow'];
                  const pinColor = pinColors[idx % pinColors.length];
                  const isPeach = idx % 2 === 1;
                  const dueInfo = checkDueDate(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-xl hover:z-20 select-none shadow-md"
                      style={{
                        backgroundColor: isPeach ? '#FF9AA2' : '#FFF380',
                        borderColor: isPeach ? '#f43f5e' : '#eab308',
                        color: '#1c1917',
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      {/* Pushpin */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <RedPushPin color={pinColor} size={28} />
                      </div>

                      {/* Top Action Row (Checkbox + Title) */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTaskStatus(task.id, 'in_progress');
                            if (audioEnabled) playCompletionSound();
                          }}
                          className="w-4 h-4 mt-0.5 rounded-full border-2 border-stone-800 hover:bg-stone-800/10 flex items-center justify-center shrink-0 transition"
                          title="Click to start task"
                        />
                        <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1">
                          {task.title}
                        </h3>
                      </div>

                      {/* Notes snippet if present */}
                      {task.notes && (
                        <p className="text-xs font-handwriting text-stone-800/80 line-clamp-2 mb-2.5 pl-6">
                          {task.notes}
                        </p>
                      )}

                      {/* Bottom Metadata (Due chip + Tag pill) */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dueInfo.label && (
                            <span className="flex items-center gap-0.5 text-stone-700">
                              <span>📅</span>
                              <span>{dueInfo.label}</span>
                            </span>
                          )}
                          {task.tags.slice(0, 1).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-900/10 text-stone-800 font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Quick Advance Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTaskStatus(task.id, 'in_progress');
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition text-stone-700"
                          title="Move to In Progress"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State / Add note placeholder */}
                {todoTasks.length === 0 && (
                  <div 
                    onClick={onQuickAdd}
                    className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-amber-300/80 dark:border-amber-400/20 text-stone-500 hover:border-amber-400 hover:text-stone-800 cursor-pointer transition"
                  >
                    <span className="text-2xl block mb-1">📝</span>
                    <span className="text-xs font-bold">+ Pin a note here</span>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------------
                ZONE 2: IN PROGRESS (Green & Blue Notes)
                ------------------------------------------------------------------- */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'in_progress')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'in_progress')}
              className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
                dragOverCol === 'in_progress' ? 'bg-blue-500/10 ring-2 ring-blue-400 scale-[1.01]' : ''
              }`}
            >
              {/* Pinned Title Card (Lime index card pinned with blue pin) */}
              <div className="relative mb-5 w-full max-w-[270px]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color="blue" size={32} />
                </div>
                <div 
                  className="px-5 py-3 rounded-2xl bg-[#D9F99D] border border-lime-400 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
                  style={{ transform: 'rotate(0.9deg)' }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-700 stroke-[2.5]" />
                    <span className="font-extrabold">In Progress</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                    {inProgressTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Notes Stack */}
              <div className="w-full space-y-4">
                {inProgressTasks.map((task, idx) => {
                  const angles = [1.2, -1.6, 1.8, -1.1];
                  const angle = angles[idx % angles.length];
                  const isBlue = idx % 2 === 1;
                  const dueInfo = checkDueDate(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-xl hover:z-20 select-none shadow-md"
                      style={{
                        backgroundColor: isBlue ? '#C7CEEA' : '#B5EAD7',
                        borderColor: isBlue ? '#6366f1' : '#10b981',
                        color: '#1c1917',
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      {/* Pushpin */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <RedPushPin color={isBlue ? 'blue' : 'green'} size={28} />
                      </div>

                      {/* Top Action Row */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTaskStatus(task.id, 'done');
                            if (audioEnabled) playCompletionSound();
                          }}
                          className="w-4 h-4 mt-0.5 rounded-full border-2 border-emerald-700 bg-emerald-500/20 hover:bg-emerald-500 flex items-center justify-center shrink-0 transition"
                          title="Mark task done"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                        </button>
                        <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1">
                          {task.title}
                        </h3>
                      </div>

                      {/* Notes snippet */}
                      {task.notes && (
                        <p className="text-xs font-handwriting text-stone-800/80 line-clamp-2 mb-2.5 pl-6">
                          {task.notes}
                        </p>
                      )}

                      {/* Bottom Metadata & Timer */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dueInfo.label && (
                            <span className="flex items-center gap-0.5 text-stone-700">
                              <span>📅</span>
                              <span>{dueInfo.label}</span>
                            </span>
                          )}
                          {task.tags.slice(0, 1).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-900/10 text-stone-800 font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stopwatch or Move Done */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTimer(task.id);
                          }}
                          className={`p-1 rounded transition ${
                            task.isTimerRunning ? 'text-rose-600 animate-pulse font-bold' : 'text-stone-700 hover:bg-black/10'
                          }`}
                          title={task.isTimerRunning ? 'Pause timer' : 'Start timer'}
                        >
                          {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {inProgressTasks.length === 0 && (
                  <div className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-emerald-300/80 dark:border-emerald-400/20 text-stone-500">
                    <span className="text-2xl block mb-1">⏳</span>
                    <span className="text-xs font-bold">Drag tasks here when started</span>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------------
                ZONE 3: DONE (Lavender & Pastel Green Notes)
                ------------------------------------------------------------------- */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'done')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'done')}
              className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
                dragOverCol === 'done' ? 'bg-purple-500/10 ring-2 ring-purple-400 scale-[1.01]' : ''
              }`}
            >
              {/* Pinned Title Card (Lavender index card pinned with purple pin) */}
              <div className="relative mb-5 w-full max-w-[270px]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color="purple" size={32} />
                </div>
                <div 
                  className="px-5 py-3 rounded-2xl bg-[#DDD6FE] border border-purple-300 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
                  style={{ transform: 'rotate(-1.1deg)' }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                    <span className="font-extrabold">Done</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-purple-300 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                    {doneTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Notes Stack */}
              <div className="w-full space-y-4">
                {doneTasks.map((task, idx) => {
                  const angles = [-1.4, 1.2, -1.9, 0.9, 1.7];
                  const angle = angles[idx % angles.length];
                  const paletteColors = ['#E9D5FF', '#D9F99D', '#FF9AA2', '#FFF380'];
                  const bgColor = paletteColors[idx % paletteColors.length];

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] select-none shadow-sm opacity-90 hover:opacity-100"
                      style={{
                        backgroundColor: bgColor,
                        borderColor: 'rgba(0,0,0,0.15)',
                        color: '#1c1917',
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      {/* Pushpin */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <RedPushPin color="purple" size={28} />
                      </div>

                      {/* Top Action Row */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTaskStatus(task.id, 'todo');
                          }}
                          className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition"
                          title="Click to reopen task"
                        >
                          ✓
                        </button>
                        <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1 line-through opacity-75">
                          {task.title}
                        </h3>
                      </div>

                      {/* Bottom Completed Timestamp */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold text-stone-600">
                        <span className="flex items-center gap-1">
                          <span>✓</span>
                          <span>Done</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-600 hover:bg-rose-100 rounded transition"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {doneTasks.length === 0 && (
                  <div className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-purple-300/80 dark:border-purple-400/20 text-stone-500">
                    <span className="text-2xl block mb-1">🎉</span>
                    <span className="text-xs font-bold">Completed notes will pin here</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Floating Bottom Encouragement Pill */}
          <div className="mt-10 px-5 py-2.5 rounded-full bg-black/45 dark:bg-black/60 backdrop-blur-xl border border-white/15 text-white shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02]">
            <span className="text-amber-300 text-sm">✨</span>
            <p className="text-xs font-semibold text-white/90">
              You're doing great! Keep going, you're on the right track.
            </p>
            <span className="text-amber-400 text-xs font-bold">↗</span>
          </div>

        </main>

        {/* =======================================================================
            RIGHT FLOATING GLASS PANELS: Upcoming Tasks & Quick Actions
            ======================================================================= */}
        <aside className="w-64 shrink-0 hidden xl:flex flex-col gap-4">
          
          {/* 1. UPCOMING TASKS PANEL */}
          <div className="p-4 rounded-3xl bg-black/40 dark:bg-black/55 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/70" />
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  Upcoming
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onChangeViewMode('focus')}
                className="text-[11px] text-white/60 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Upcoming Items List */}
            <div className="space-y-3">
              {upcomingTasks.map((t, idx) => {
                const colors = ['bg-emerald-400', 'bg-purple-400', 'bg-sky-400', 'bg-amber-400'];
                const dotColor = colors[idx % colors.length];

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="p-2 rounded-2xl hover:bg-white/10 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                      <span className="text-xs font-bold text-white truncate">
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50 pl-4 block">
                      {t.dueDate || 'Scheduled'}
                    </span>
                  </div>
                );
              })}

              {upcomingTasks.length === 0 && (
                <p className="text-xs text-white/40 text-center py-4">
                  No upcoming deadlines
                </p>
              )}
            </div>
          </div>

          {/* 2. QUICK ACTIONS PANEL */}
          <div className="p-4 rounded-3xl bg-black/40 dark:bg-black/55 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-extrabold text-sm tracking-tight text-white">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onQuickAdd}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Task</span>
              </button>

              <button
                type="button"
                onClick={onQuickAdd}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>

              <button
                type="button"
                onClick={onOpenProjectModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* =========================================================================
          4. WORKSPACE DECORATIONS & WOODEN DESK DETAIL ALONG BOTTOM
          ========================================================================= */}
      
      {/* Rich Warm Mahogany Wooden Desk Base */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 z-0 overflow-hidden"
        style={{
          background: 'linear-gradient(to top, rgba(65, 36, 17, 0.98) 0%, rgba(95, 52, 25, 0.92) 55px, rgba(120, 68, 35, 0.75) 100px, transparent 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255, 230, 180, 0.25)',
        }}
      >
        {/* Desk Surface Wood Plank Highlight Line */}
        <div className="absolute top-24 left-0 right-0 h-[1.5px] bg-amber-100/20" />
      </div>

      {/* Photorealistic Studio Desk Accessories (Non-obstructing, positioned along desk base) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 z-10 max-w-[1720px] mx-auto px-6 flex items-end justify-between overflow-hidden">
        
        {/* Left Desk Accessories: Stack of Books + Desk Lamp with Warm Glow */}
        <div className="flex items-end gap-5 pl-2 pb-2">
          
          {/* Stack of Hardcover Books */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-32 h-4 rounded-sm bg-[#881337] border-t border-rose-400/40 shadow-xs flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/70 tracking-widest uppercase">Productivity</span>
            </div>
            <div className="w-36 h-4.5 rounded-sm bg-[#1e293b] border-t border-slate-400/30 shadow-xs flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/70 tracking-widest uppercase">Artificial Intelligence</span>
            </div>
            <div className="w-40 h-5 rounded-sm bg-[#3f3f46] border-t border-stone-300/40 shadow-sm flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/80 tracking-widest uppercase">Build The Future</span>
            </div>
          </div>

          {/* Desk Lamp with Warm Radial Ambient Illumination Cone */}
          <div className="relative">
            <div 
              className="absolute -top-32 -left-12 w-48 h-48 rounded-full pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(254, 240, 138, 0.6) 0%, rgba(245, 158, 11, 0.2) 45%, transparent 70%)',
              }}
            />
            {/* Lamp Silhouette SVG */}
            <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="30" cy="85" rx="20" ry="4" fill="#18181b" />
              <path d="M 30 85 L 26 40 L 40 25" stroke="#27272a" strokeWidth="4" strokeLinecap="round" />
              <path d="M 28 20 L 52 32 L 42 45 L 20 28 Z" fill="#18181b" />
              <circle cx="44" cy="35" r="5" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 8px #fef08a)" />
            </svg>
          </div>

          {/* Ceramic White Coffee Mug with Logo on Cork Coaster */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-12 h-14 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-100 via-white to-stone-200 border border-stone-300 shadow-md flex items-center justify-center relative">
              <span className="text-[9px] font-black text-stone-700 tracking-tight">✦</span>
              {/* Mug Handle */}
              <div className="absolute top-2 -right-3 w-3.5 h-7 rounded-r-lg border-2 border-stone-300 border-l-0" />
            </div>
            {/* Cork Coaster */}
            <div className="w-16 h-2 rounded-full bg-[#c49258] border-t border-[#dfb37c] shadow-xs" />
          </div>

        </div>

        {/* Center: Sleek Dark Laptop Lid */}
        <div className="hidden lg:flex flex-col items-center mb-1 opacity-90">
          <div className="w-72 h-10 rounded-t-xl bg-gradient-to-b from-stone-900 to-black border-t border-stone-600/50 shadow-2xl flex items-center justify-center">
            {/* Small apple/laptop reflection */}
            <div className="w-4 h-4 rounded-full bg-white/20" />
          </div>
          <div className="w-80 h-1.5 rounded-full bg-stone-700 shadow-md" />
        </div>

        {/* Right Desk Accessories: Pen Holder + Astronaut Figurine + Glass Cloche Terrarium */}
        <div className="flex items-end gap-4 pr-2 pb-2">
          
          {/* Black Ceramic Pen Pot with Fountain Pens and Stylus */}
          <div className="hidden sm:flex flex-col items-center">
            {/* Pens sticking out */}
            <div className="flex items-end gap-1 mb-[-4px]">
              <div className="w-1.5 h-12 bg-amber-600 rounded-t-sm rotate-[-12deg]" />
              <div className="w-1.5 h-14 bg-stone-900 border-t border-white/60 rounded-t-sm rotate-[-4deg]" />
              <div className="w-1.5 h-11 bg-indigo-600 rounded-t-sm rotate-[8deg]" />
              <div className="w-2 h-13 bg-stone-700 rounded-t-sm rotate-[14deg]" />
            </div>
            {/* Pen Cup */}
            <div className="w-11 h-12 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-800 to-stone-950 border border-stone-700 shadow-md flex items-center justify-center">
              <span className="text-[8px] text-white/40">✦</span>
            </div>
          </div>

          {/* Mini Astronaut Figurine */}
          <div className="hidden md:flex flex-col items-center">
            <svg width="34" height="48" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="12" r="10" fill="#f4f4f5" stroke="#d4d4d8" />
              <ellipse cx="17" cy="12" rx="7" ry="5.5" fill="#ca8a04" stroke="#eab308" />
              <rect x="9" y="22" width="16" height="18" rx="5" fill="#f4f4f5" stroke="#d4d4d8" />
              <rect x="13" y="25" width="8" height="6" rx="2" fill="#3b82f6" />
              <rect x="11" y="40" width="4" height="6" rx="1.5" fill="#e4e4e7" />
              <rect x="19" y="40" width="4" height="6" rx="1.5" fill="#e4e4e7" />
            </svg>
          </div>

          {/* Glass Cloche Terrarium with Miniature Plant */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-14 h-20 rounded-t-full border border-white/40 bg-white/10 backdrop-blur-xs shadow-md flex items-end justify-center pb-2 relative overflow-hidden">
              {/* Glass reflection */}
              <div className="absolute top-2 left-2 w-1.5 h-10 rounded-full bg-white/40 rotate-12" />
              {/* Mini Succulent Plant */}
              <div className="text-xl">🪴</div>
            </div>
            {/* Wood Plinth */}
            <div className="w-16 h-2 rounded-full bg-[#8c5828] border-t border-amber-300/40 shadow-xs" />
          </div>

        </div>

      </div>

    </div>
  );
};

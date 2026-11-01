import React, { useState } from 'react';
import { 
  Target, 
  Play, 
  Pause, 
  CheckCircle2, 
  Check, 
  Plus, 
  Moon, 
  Star, 
  Sparkles, 
  Clock, 
  Palette, 
  Edit3, 
  Calendar,
  Flame,
  Zap,
  Coffee,
  RotateCw
} from 'lucide-react';
import { Task, Project, Priority, DensityMode } from '../types';
import { formatDuration, checkDueDate } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import { getPostitPaperStyle } from '../utils/colorUtils';
import { STICKY_COLORS } from '../constants/theme';
import { RedPushPin } from './RedPushPin';
import confetti from 'canvas-confetti';

interface FocusViewProps {
  tasks: Task[];
  allTasks?: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  audioEnabled: boolean;
  onQuickAdd: (title?: string, priority?: Priority) => void;
  density: DensityMode;
  onToggleDensity: () => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  tasks,
  allTasks = [],
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  audioEnabled,
  onQuickAdd,
  density,
  onToggleDensity,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Source pool: if current section has 0 tasks, fall back to all uncompleted tasks
  const effectiveTasks = tasks.length > 0 
    ? tasks 
    : allTasks.length > 0 
      ? allTasks.filter(t => t.status !== 'done') 
      : [];

  const totalCount = effectiveTasks.length;
  const completedCount = effectiveTasks.filter(t => t.status === 'done').length;
  const activeTasks = effectiveTasks.filter(t => t.status !== 'done');
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Today vs Later Queues
  const dayTasks = activeTasks.filter(t => !t.isThisEvening);
  const eveningTasks = activeTasks.filter(t => t.isThisEvening);
  const completedTasks = effectiveTasks.filter(t => t.status === 'done');

  // Determine the Hero "Now" task:
  // 1. Task currently running a stopwatch timer
  // 2. Explicitly selected focused task
  // 3. First pinned / urgent active task
  // 4. First active task in Today queue
  const runningTimerTask = activeTasks.find(t => t.isTimerRunning);
  const manuallyFocusedTask = activeTasks.find(t => t.id === focusedTaskId);
  const pinnedActiveTask = activeTasks.find(t => t.isPinned || t.priority === 'urgent');

  const heroTask: Task | null = 
    runningTimerTask ||
    manuallyFocusedTask ||
    pinnedActiveTask ||
    dayTasks[0] ||
    activeTasks[0] ||
    null;

  // Remaining tasks in Today queue (excluding hero task)
  const remainingTodayQueue = dayTasks.filter(t => t.id !== heroTask?.id);

  // Circular progress metric
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Paper styling for Hero Sticky Note
  // Default color is the authentic Post-it Canary Yellow (#fef08a)
  const defaultYellow = '#fef08a';
  const heroColor = heroTask?.colorHex || defaultYellow;
  const heroPaper = getPostitPaperStyle(heroColor, heroTask?.inkType || 'auto');
  const heroProject = heroTask ? projects.find(p => p.id === heroTask.projectId) : undefined;
  const dueInfo = heroTask ? checkDueDate(heroTask.dueDate) : null;

  // Handle Mark Done on Hero Task
  const handleHeroDone = () => {
    if (!heroTask) return;
    onToggleComplete(heroTask.id);
    if (audioEnabled) playCompletionSound();
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    });
  };

  // Quick inline add
  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickAdd(trimmed, 'normal');
    setQuickTitle('');
  };

  // Add checklist item to Hero task
  const handleAddHeroChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroTask || !newChecklistText.trim()) return;

    const newItem = {
      id: 'chk_' + Math.random().toString(36).substring(2, 7),
      text: newChecklistText.trim(),
      completed: false,
    };

    onUpdateTask({
      ...heroTask,
      checklists: [...heroTask.checklists, newItem],
    });
    setNewChecklistText('');
  };

  const handleToggleChecklist = (itemId: string) => {
    if (!heroTask) return;
    const updated = heroTask.checklists.map(c => 
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    onUpdateTask({ ...heroTask, checklists: updated });
    if (audioEnabled) playCompletionSound();
  };

  const handleChangeHeroColor = (colorHex: string) => {
    if (!heroTask) return;
    onUpdateTask({ ...heroTask, colorHex });
    setShowColorPicker(false);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (!heroTask) return;
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== heroTask.title) {
      onUpdateTask({ ...heroTask, title: trimmed });
    }
  };

  const isTodayClear = totalCount > 0 && activeTasks.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 font-sans">
      
      {/* 1. Header: Date + Daily Progress Ring + Density Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎯</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Focus
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {activeTasks.length} to do
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Show me what to do now, and make capturing the next thing instant.
          </p>
        </div>

        {/* Daily Progress Ring & Density Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onToggleDensity}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
            title="Toggle card density"
          >
            {density === 'compact' ? 'Compact rows' : 'Comfortable'}
          </button>

          {totalCount > 0 && (
            <div className="flex items-center gap-3 p-1.5 px-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl">
              <div className="text-right">
                <span className="block font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                  {completedCount} of {totalCount}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {progressPercent}% completed
                </span>
              </div>
              <svg className="w-7 h-7 -rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r={11}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-amber-200/80 dark:text-amber-900/60"
                />
                <circle
                  cx="14"
                  cy="14"
                  r={11}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 11}
                  strokeDashoffset={(2 * Math.PI * 11) - progressRatio * (2 * Math.PI * 11)}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 2. Instant Quick Capture Form */}
      <form 
        onSubmit={handleInlineAdd}
        className="flex items-center gap-2 p-2 px-3 mb-6 bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-blue-500/30 transition-all"
      >
        <Plus className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Capture the next thing... (Press Enter to save)"
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
        >
          Capture
        </button>
      </form>

      {/* 3. HERO "NOW" STICKY NOTE (AUTHENTIC SIZE & CANARY YELLOW COLOR) */}
      {heroTask && !isTodayClear ? (
        <section className="mb-8 flex flex-col items-center">
          <div className="w-full max-w-[390px] flex items-center justify-between mb-2 px-1 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Now Focusing</span>
            </div>
            {heroProject && (
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 truncate max-w-[160px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: heroProject.colorHex }} />
                <span className="truncate">{heroProject.title}</span>
              </span>
            )}
          </div>

          {/* Centered Physical Sticky Note Pad */}
          <div 
            className="relative w-full max-w-[390px] min-h-[360px] p-6 pt-9 rounded-2xl border transition-all duration-200 select-none flex flex-col justify-between"
            style={{
              backgroundColor: heroPaper.baseRgb,
              backgroundImage: `linear-gradient(145deg, ${heroPaper.lightRgb} 0%, ${heroPaper.baseRgb} 55%, ${heroPaper.darkRgb} 100%)`,
              borderColor: heroPaper.borderRgb,
              color: heroPaper.inkColor,
              boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              transform: 'rotate(-0.8deg)',
            }}
          >
            {/* 3D Tactile Red Pushpin at Top Center */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
              <RedPushPin size={34} />
            </div>

            {/* Sticky Note Top Controls Bar */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10 dark:border-white/10 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {dueInfo && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    dueInfo.isOverdue ? 'bg-red-500/15 text-red-700' : 'bg-black/5 dark:bg-white/10'
                  }`}>
                    {dueInfo.label}
                  </span>
                )}
                {heroTask.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Palette & Timer Controls */}
              <div className="flex items-center gap-1.5">
                {/* Color Swatch Picker Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                    title="Change sticky note color"
                  >
                    <Palette className="w-3.5 h-3.5 opacity-75" />
                  </button>

                  {showColorPicker && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-7 z-30 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    >
                      {STICKY_COLORS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleChangeHeroColor(c.colorHex)}
                          style={{ backgroundColor: c.colorHex }}
                          className="w-5 h-5 rounded-full border border-black/15 hover:scale-120 transition cursor-pointer"
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Focus Timer Button */}
                <button
                  onClick={() => onToggleTimer(heroTask.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    heroTask.isTimerRunning
                      ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                      : 'bg-black/10 dark:bg-white/15 hover:bg-black/15'
                  }`}
                  title={heroTask.isTimerRunning ? 'Pause focus timer' : 'Start focus timer'}
                >
                  {heroTask.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  <span className="font-mono text-[11px]">{formatDuration(heroTask.timeSpentSeconds || 0)}</span>
                </button>
              </div>
            </div>

            {/* Note Title & Body */}
            <div className="flex-1 mb-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  autoFocus
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="w-full bg-transparent border-b border-black/20 text-lg font-bold focus:outline-none"
                />
              ) : (
                <h2 
                  onClick={() => {
                    setTitleInput(heroTask.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-lg sm:text-xl font-bold tracking-tight leading-snug cursor-pointer group flex items-start justify-between gap-2"
                  style={{ fontFamily: "'Caveat', 'Segoe Print', cursive, sans-serif" }}
                  title="Click to edit title"
                >
                  <span>{heroTask.title}</span>
                  <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition shrink-0 mt-1" />
                </h2>
              )}

              {heroTask.notes && (
                <p 
                  onClick={() => onSelectTask(heroTask)}
                  className="text-xs opacity-90 leading-relaxed mt-2 whitespace-pre-wrap cursor-pointer hover:opacity-100"
                >
                  {heroTask.notes}
                </p>
              )}

              {/* Checklist on Note */}
              {heroTask.checklists.length > 0 && (
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5">
                  {heroTask.checklists.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none group"
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition ${
                        item.completed 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-black/30 dark:border-white/30 group-hover:border-black/60'
                      }`}>
                        {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={`text-[11px] ${item.completed ? 'line-through opacity-50' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Subtask Adder */}
              <form onSubmit={handleAddHeroChecklist} className="mt-2.5">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="+ Add subtask..."
                  className="w-full px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 border-none text-[11px] placeholder-black/40 dark:placeholder-white/40 focus:outline-none"
                />
              </form>
            </div>

            {/* Note Footer: Inspector & Large Mark as Done */}
            <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10 gap-2">
              <button
                onClick={() => onSelectTask(heroTask)}
                className="text-[11px] font-bold opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer transition"
              >
                <span>Edit details</span>
              </button>

              <button
                onClick={handleHeroDone}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Mark as Done</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. CELEBRATION (WHEN TODAY IS CLEARED) */}
      {isTodayClear && (
        <div className="p-8 my-6 text-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🎉
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
            Today is completely clear!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            You've completed every task scheduled for today. Take a well-deserved break or capture what's next.
          </p>
          <button
            onClick={() => onQuickAdd('Plan tomorrow')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Plan Tomorrow
          </button>
        </div>
      )}

      {/* 5. EMPTY STATE (WHEN NO TASKS EXIST AT ALL) */}
      {totalCount === 0 && (
        <div className="p-8 my-6 text-center rounded-3xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-3 text-2xl">
            📝
          </div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
            Your focus queue is empty
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            Type your first note above to start your daily plan.
          </p>
          <button
            onClick={() => onQuickAdd('My first focus note')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            Capture First Note
          </button>
        </div>
      )}

      {/* 6. QUIET QUEUE: TODAY */}
      {remainingTodayQueue.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Next in Queue ({remainingTodayQueue.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Click "Focus" to switch hero note</span>
          </div>

          <div className="space-y-2">
            {remainingTodayQueue.map(task => {
              const proj = projects.find(p => p.id === task.projectId);
              const taskPaper = getPostitPaperStyle(task.colorHex || defaultYellow, task.inkType || 'auto');

              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Check className="w-2.5 h-2.5 text-transparent hover:text-emerald-500" />
                    </button>
                    <div className="truncate">
                      <span 
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:underline"
                      >
                        {task.title}
                      </span>
                      {proj && (
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {proj.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Promote to Focus & Timer */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleTimer(task.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                      title="Toggle stopwatch"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFocusedTaskId(task.id)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-700 transition cursor-pointer flex items-center gap-1"
                      title="Make this your current Hero note"
                    >
                      <Target className="w-3 h-3 text-amber-500" />
                      <span>Focus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. QUIET QUEUE: LATER / THIS EVENING */}
      {eveningTasks.length > 0 && (
        <section className="mb-6 pt-3 border-t border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2.5 px-1 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Moon className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Later / This Evening ({eveningTasks.length})</span>
          </div>

          <div className="space-y-2">
            {eveningTasks.map(task => {
              const proj = projects.find(p => p.id === task.projectId);
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Check className="w-2.5 h-2.5 text-transparent hover:text-emerald-500" />
                    </button>
                    <div className="truncate">
                      <span 
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:underline"
                      >
                        {task.title}
                      </span>
                      {proj && (
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {proj.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setFocusedTaskId(task.id)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Target className="w-3 h-3 text-indigo-500" />
                    <span>Focus</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. COMPLETED TODAY COLLAPSIBLE SECTION */}
      {completedTasks.length > 0 && !isTodayClear && (
        <details className="mt-6 pt-3 border-t border-slate-200/60 dark:border-white/10 group">
          <summary className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer select-none flex items-center gap-2">
            <span>Completed Today ({completedTasks.length})</span>
          </summary>
          <div className="space-y-1 mt-2.5">
            {completedTasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-white/5 text-xs text-slate-400"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="line-through truncate">{task.title}</span>
                </div>
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

    </div>
  );
};

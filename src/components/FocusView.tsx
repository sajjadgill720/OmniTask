import React, { useState, useEffect } from 'react';
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
  Folder, 
  ChevronRight, 
  Edit3, 
  Calendar,
  Flame,
  Zap,
  Coffee
} from 'lucide-react';
import { Task, Project, Priority, DensityMode } from '../types';
import { formatDuration, checkDueDate } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import { getPostitPaperStyle } from '../utils/colorUtils';
import { TaskRow } from './TaskRow';
import confetti from 'canvas-confetti';

interface FocusViewProps {
  tasks: Task[];
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

  // Daily Counts & Progress
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Today vs Later Queues
  const dayTasks = activeTasks.filter(t => !t.isThisEvening);
  const eveningTasks = activeTasks.filter(t => t.isThisEvening);
  const completedTasks = tasks.filter(t => t.status === 'done');

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

  // Items remaining in Today queue (excluding the active Hero task)
  const remainingTodayQueue = dayTasks.filter(t => t.id !== heroTask?.id);

  // Circular progress metric
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Handle Mark Done on Hero Task
  const handleHeroDone = () => {
    if (!heroTask) return;
    onToggleComplete(heroTask.id);
    if (audioEnabled) playCompletionSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
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

  const isTodayClear = totalCount > 0 && activeTasks.length === 0;
  const heroProject = heroTask ? projects.find(p => p.id === heroTask.projectId) : undefined;
  const heroPaper = heroTask ? getPostitPaperStyle(heroTask.colorHex, heroTask.inkType || 'auto') : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 font-sans">
      
      {/* 1. Header: Date + Daily Progress Ring + Density Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200/80 dark:border-white/10 gap-4">
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
            {density === 'compact' ? 'Compact rows' : 'Comfortable cards'}
          </button>

          {totalCount > 0 && (
            <div className="flex items-center gap-3 p-2 px-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl">
              <div className="text-right">
                <span className="block font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                  {completedCount} of {totalCount}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {progressPercent}% completed
                </span>
              </div>
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-amber-200/80 dark:text-amber-900/60"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
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
        className="flex items-center gap-2 p-2 px-3 mb-8 bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-blue-500/30 transition-all"
      >
        <Plus className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Capture the next thing... (Press Enter to save)"
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

      {/* 3. HERO "NOW" NOTE */}
      {heroTask && !isTodayClear && (
        <section className="mb-10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Now Focusing</span>
            </div>
            {heroProject && (
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: heroProject.colorHex }} />
                <span>{heroProject.title}</span>
              </span>
            )}
          </div>

          {/* Hero Card */}
          <div 
            className="relative rounded-3xl p-6 sm:p-7 border border-amber-300/60 dark:border-white/10 shadow-xl transition-all"
            style={{
              backgroundColor: heroPaper?.baseRgb || '#fef9c3',
              color: heroPaper?.inkColor || '#1e293b',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Top row: Tags & Action bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                {heroTask.dueDate && (
                  <span className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-bold font-mono">
                    Due {heroTask.dueDate}
                  </span>
                )}
                {heroTask.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[11px] font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Focus Timer Pill */}
              <button
                onClick={() => onToggleTimer(heroTask.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  heroTask.isTimerRunning
                    ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                    : 'bg-black/10 dark:bg-white/15 hover:bg-black/15 text-current'
                }`}
                title={heroTask.isTimerRunning ? 'Pause focus timer' : 'Start focus timer'}
              >
                {heroTask.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span className="font-mono">{formatDuration(heroTask.timeSpentSeconds || 0)}</span>
              </button>
            </div>

            {/* Title & Body */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-2 font-display">
                {heroTask.title}
              </h2>
              {heroTask.notes && (
                <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap font-sans">
                  {heroTask.notes}
                </p>
              )}
            </div>

            {/* Checklist Section */}
            {heroTask.checklists.length > 0 && (
              <div className="mb-6 space-y-2 border-t border-black/10 dark:border-white/10 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-2">
                  Checklist ({heroTask.checklists.filter(c => c.completed).length}/{heroTask.checklists.length})
                </span>
                <div className="space-y-2">
                  {heroTask.checklists.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none group"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                        item.completed 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-black/30 dark:border-white/30 group-hover:border-black/60'
                      }`}>
                        {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={item.completed ? 'line-through opacity-50' : ''}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Subtask Input */}
            <form onSubmit={handleAddHeroChecklist} className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="+ Add subtask to this note..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border-none text-xs placeholder-black/40 dark:placeholder-white/40 focus:outline-none"
              />
              {newChecklistText.trim() && (
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-xl bg-black/10 dark:bg-white/20 text-xs font-bold"
                >
                  Add
                </button>
              )}
            </form>

            {/* Bottom Actions: Done & Inspector */}
            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10 gap-3">
              <button
                onClick={() => onSelectTask(heroTask)}
                className="text-xs font-bold opacity-75 hover:opacity-100 flex items-center gap-1 cursor-pointer transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open details</span>
              </button>

              <button
                onClick={handleHeroDone}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Mark as Done</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. CELEBRATION (WHEN TODAY IS CLEARED) */}
      {isTodayClear && (
        <div className="p-8 my-8 text-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            🎉
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1.5">
            Today is completely clear!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            You've completed every task scheduled for today. Great job! Take a well-deserved break or capture your next idea below.
          </p>
          <button
            onClick={() => onQuickAdd('New note for tomorrow')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Plan Tomorrow
          </button>
        </div>
      )}

      {/* 5. EMPTY STATE (WHEN NO TASKS EXIST) */}
      {totalCount === 0 && (
        <div className="p-10 my-8 text-center rounded-3xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl">
            📝
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            Your focus queue is empty
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Capture your first note above or click below to start planning your day.
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
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Today's Queue ({remainingTodayQueue.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Click "Focus" to switch hero task</span>
          </div>

          <div className="space-y-2">
            {remainingTodayQueue.map(task => {
              const proj = projects.find(p => p.id === task.projectId);
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Check className="w-3 h-3 text-transparent hover:text-emerald-500" />
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
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                      title="Make this your current Now task"
                    >
                      <Target className="w-3 h-3 text-blue-500" />
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
        <section className="mb-8 pt-4 border-t border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3 px-1 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Moon className="w-4 h-4 fill-indigo-400" />
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
                      className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Check className="w-3 h-3 text-transparent hover:text-emerald-500" />
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
        <details className="mt-8 pt-4 border-t border-slate-200/60 dark:border-white/10 group">
          <summary className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer select-none flex items-center gap-2">
            <span>Completed Today ({completedTasks.length})</span>
          </summary>
          <div className="space-y-1.5 mt-3">
            {completedTasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/60 dark:bg-white/5 text-xs text-slate-400"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="line-through truncate">{task.title}</span>
                </div>
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
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

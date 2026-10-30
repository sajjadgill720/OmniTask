import React, { useState } from 'react';
import { Star, Moon, CheckCircle2, Sparkles, Plus, Calendar, Clock, Flame } from 'lucide-react';
import { Task, Project, Priority } from '../types';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  audioEnabled: boolean;
  onQuickAdd: (title?: string, priority?: Priority) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
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
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('normal');

  const dayTasks = tasks.filter(t => !t.isThisEvening);
  const eveningTasks = tasks.filter(t => t.isThisEvening);

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Formatted today date e.g., "Friday, October 30"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Circle progress calculation
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickAdd(trimmed, quickPriority);
    setQuickTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Things 3 Header: Star + Date + Circular Progress Ring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Today
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono">
              {tasks.length} {tasks.length === 1 ? 'Focus Item' : 'Focus Items'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {todayFormatted} • High-leverage execution list
          </p>
        </div>

        {/* Progress Metric Ring + Stats */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto p-2 px-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl">
            <div className="text-right">
              <span className="block font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                {completedCount}/{totalCount} Completed
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                {progressPercent}% Daily Goal
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

      {/* Quick Inline Task Adder */}
      <form 
        onSubmit={handleInlineAdd}
        className="flex items-center gap-2 p-2 px-3 mb-6 bg-white dark:bg-[#151821] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-amber-500/30 transition-all"
      >
        <Plus className="w-4 h-4 text-amber-500 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a task for Today... (Press Enter to save)"
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {/* Priority Selector */}
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as Priority)}
          className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer focus:outline-none"
        >
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="low">Low</option>
        </select>

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
        >
          Add
        </button>
      </form>

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="text-center py-20 px-4 clean-canvas-surface">
          <div className="w-14 h-14 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🌟
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            All Clear for Today
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            You've completed everything scheduled for today or haven't added tasks yet. Enjoy your day or plan your next move!
          </p>
        </div>
      )}

      {/* Main Day Tasks */}
      {dayTasks.length > 0 && (
        <div className="space-y-2 mb-8">
          {dayTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              project={projects.find(p => p.id === task.projectId)}
              onToggleComplete={onToggleComplete}
              onSelectTask={onSelectTask}
              onToggleTimer={onToggleTimer}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onReorderTasks={onReorderTasks}
              audioEnabled={audioEnabled}
            />
          ))}
        </div>
      )}

      {/* Things 3 "This Evening" Section */}
      {eveningTasks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Moon className="w-4 h-4 fill-indigo-400" />
            <span>This Evening ({eveningTasks.length})</span>
          </div>

          <div className="space-y-2">
            {eveningTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                project={projects.find(p => p.id === task.projectId)}
                onToggleComplete={onToggleComplete}
                onSelectTask={onSelectTask}
                onToggleTimer={onToggleTimer}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onReorderTasks={onReorderTasks}
                audioEnabled={audioEnabled}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { Star, Moon, CheckCircle2, Sparkles } from 'lucide-react';
import { Task, Project } from '../types';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  audioEnabled,
  onQuickAdd,
}) => {
  const dayTasks = tasks.filter(t => !t.isThisEvening);
  const eveningTasks = tasks.filter(t => t.isThisEvening);

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  // Formatted today date e.g., "Friday, October 30"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Circle progress calculation
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Things 3 Header: Star + Date + Circular Progress Ring */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Today
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {todayFormatted}
          </p>
        </div>

        {/* Progress Ring */}
        {totalCount > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {completedCount}/{totalCount}
              </span>
              <span className="text-[10px] text-slate-400">Done</span>
            </div>
            <svg className="w-7 h-7 -rotate-90">
              <circle
                cx="14"
                cy="14"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-200 dark:text-slate-800"
              />
              <circle
                cx="14"
                cy="14"
                r={radius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            No Tasks Scheduled for Today
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            Enjoy your free day, or tap the Magic Plus button below to plan a task.
          </p>
          <button
            onClick={onQuickAdd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Add Task for Today
          </button>
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
              audioEnabled={audioEnabled}
            />
          ))}
        </div>
      )}

      {/* Things 3 Signature "This Evening" Section */}
      {eveningTasks.length > 0 && (
        <div className="pt-4 mt-6 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300">
            <Moon className="w-4 h-4 fill-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              This Evening
            </h3>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950">
              {eveningTasks.length}
            </span>
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
                audioEnabled={audioEnabled}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};


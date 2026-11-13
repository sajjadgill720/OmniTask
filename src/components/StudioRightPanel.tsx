import React, { useMemo } from 'react';
import { Calendar, ChevronRight, Zap, Plus, FileText, FolderPlus, ChevronDown } from 'lucide-react';
import { Task } from '../types';

interface StudioRightPanelProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onQuickAdd: () => void;
  onOpenProjectModal: () => void;
  onViewAllUpcoming: () => void;
}

/**
 * StudioRightPanel
 * The sleek floating right sidebar matching target reference photo:
 * 1. Upcoming Panel (CS251, NTAC, SemEval)
 * 2. Quick Actions Panel (+ Add Task, New Note, New Project)
 * 3. Productivity Panel (78% ring + This Week +12% sparkline)
 */
export const StudioRightPanel: React.FC<StudioRightPanelProps> = ({
  tasks,
  onSelectTask,
  onQuickAdd,
  onOpenProjectModal,
  onViewAllUpcoming,
}) => {
  // Real upcoming tasks from user data
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 3);
  }, [tasks]);

  const completed = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  return (
    <aside className="w-64 xl:w-72 shrink-0 hidden min-[1280px]:flex flex-col gap-3.5 z-20 select-none">
      
      {/* 1. UPCOMING PANEL */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-xl text-stone-900 dark:text-white">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <h3 className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-white">
              Upcoming
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAllUpcoming}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Upcoming Items List */}
        <div className="space-y-2">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((t, idx) => {
              const dots = ['bg-emerald-500', 'bg-purple-500', 'bg-blue-500'];
              const dotColor = dots[idx % dots.length];

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer text-left flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    <span className="text-sm font-handwriting font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono shrink-0">
                    {t.dueDate || 'Soon'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="p-2 text-xs text-stone-500 dark:text-stone-300">No scheduled tasks yet. Add a due date to a note to see it here.</p>
          )}
        </div>
      </div>

      {/* 2. QUICK ACTIONS PANEL */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-xl text-stone-900 dark:text-white">
        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-black/5 dark:border-white/10">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-white">
            Quick Actions
          </h3>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onQuickAdd}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-xs font-bold text-stone-900 dark:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>+ Add Task</span>
          </button>

          <button
            type="button"
            onClick={onQuickAdd}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-xs font-bold text-stone-900 dark:text-white transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>New Note</span>
          </button>

          <button
            type="button"
            onClick={onOpenProjectModal}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-xs font-bold text-stone-900 dark:text-white transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 3. PRODUCTIVITY PANEL (Matching Reference Photo) */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-xl text-stone-900 dark:text-white">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10">
          <h3 className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-white">
            Productivity
          </h3>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Circular Progress Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-200 dark:text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400"
                strokeDasharray={`${completionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-bold text-xs font-mono text-stone-900 dark:text-white">{completionRate}%</span>
          </div>

          {/* Metric info + Green Sparkline */}
          <div className="flex-1 flex flex-col items-end">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">All notes completed</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <span>{completed} of {tasks.length}</span>
            </div>

          </div>
        </div>
      </div>

    </aside>
  );
};

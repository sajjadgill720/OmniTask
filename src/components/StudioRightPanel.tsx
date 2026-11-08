import React, { useMemo } from 'react';
import { Calendar, ChevronRight, Sparkles, Plus, FileText, FolderPlus } from 'lucide-react';
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
 * Floating dark translucent panels on the right side of the workspace:
 * 1. Upcoming Tasks Panel
 * 2. Quick Actions Panel
 * 3. Bottom encouragement pill
 */
export const StudioRightPanel: React.FC<StudioRightPanelProps> = ({
  tasks,
  onSelectTask,
  onQuickAdd,
  onOpenProjectModal,
  onViewAllUpcoming,
}) => {
  // Sort next 4 upcoming tasks
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 4);
  }, [tasks]);

  return (
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
            onClick={onViewAllUpcoming}
            className="text-[11px] text-white/60 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Upcoming Items List */}
        <div className="space-y-2.5">
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
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Add Task</span>
          </button>

          <button
            type="button"
            onClick={onQuickAdd}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-300" />
            <span>New Note</span>
          </button>

          <button
            type="button"
            onClick={onOpenProjectModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-300" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 3. ENCOURAGEMENT CARD */}
      <div className="px-4 py-3 rounded-2xl bg-black/40 dark:bg-black/55 backdrop-blur-2xl border border-white/15 text-white shadow-xl flex items-center gap-3 transition-all hover:scale-[1.01]">
        <span className="text-amber-300 text-sm">✨</span>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-white/95 leading-tight">
            You're doing great!
          </p>
          <p className="text-[10px] text-white/60">
            Keep going, on track ↗
          </p>
        </div>
      </div>

    </aside>
  );
};


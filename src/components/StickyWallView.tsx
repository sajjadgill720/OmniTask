import React from 'react';
import { Pin, Sparkles, Plus, Star, Layers } from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

interface StickyWallViewProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
}

export const StickyWallView: React.FC<StickyWallViewProps> = ({
  title,
  subtitle,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  audioEnabled,
  onQuickAdd,
}) => {
  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Wall Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {tasks.length} Notes
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {subtitle} • Motion Graphics Wall (Keep + Notezilla)
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onQuickAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Sticky Note</span>
        </button>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            📝
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Your Sticky Wall is Fresh & Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Pin ideas, checklists, and tasks with tactile washi tape, color palettes, and focus timers.
          </p>
          <button
            onClick={onQuickAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Create First Sticky Note
          </button>
        </div>
      )}

      {/* Pinned Notes Section (Google Keep & Notezilla style) */}
      {pinnedTasks.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Pin className="w-3.5 h-3.5 fill-amber-500" />
            <span>Pinned Notes ({pinnedTasks.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pinnedTasks.map((task, idx) => (
              <StickyNoteCard
                key={task.id}
                task={task}
                index={idx}
                project={projects.find(p => p.id === task.projectId)}
                onToggleComplete={onToggleComplete}
                onSelectTask={onSelectTask}
                onToggleTimer={onToggleTimer}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                audioEnabled={audioEnabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other / Unpinned Notes Section */}
      {otherTasks.length > 0 && (
        <div>
          {pinnedTasks.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Other Notes ({otherTasks.length})</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherTasks.map((task, idx) => (
              <StickyNoteCard
                key={task.id}
                task={task}
                index={idx + pinnedTasks.length}
                project={projects.find(p => p.id === task.projectId)}
                onToggleComplete={onToggleComplete}
                onSelectTask={onSelectTask}
                onToggleTimer={onToggleTimer}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                audioEnabled={audioEnabled}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};


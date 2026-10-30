import React from 'react';
import { Pin, Layers, Plus, Sparkles } from 'lucide-react';
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
  onReorderTasks?: (sourceId: string, targetId: string) => void;
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
  onReorderTasks,
}) => {
  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Clean HCI Canvas Header: Zero Cognitive Load */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200/80 dark:border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {tasks.length} {tasks.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 flex-wrap">
            <span>{subtitle}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Drag to reorder • Hover for 3D depth • Click text to edit</span>
            </span>
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Post-it</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-20 px-4 clean-canvas-surface">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            📝
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Your Sticky Wall is Fresh & Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Pin ideas, checklists, and tasks with tactile 3D pushpins, authentic handwriting ink, and drag reordering.
          </p>
          <button
            onClick={onQuickAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Create First Post-it Note
          </button>
        </div>
      )}

      {/* Distraction-Free Studio Canvas Surface (HCI Principle: High Legibility & Zero Visual Noise) */}
      {tasks.length > 0 && (
        <div className="clean-canvas-surface p-5 sm:p-8 min-h-[500px]">
          
          {/* Pinned Notes Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-amber-300/40 dark:border-amber-700/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Notes ({pinnedTasks.length}) — Drag to Reorder</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    onDropOnItem={onReorderTasks}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other / Standard Notes Section */}
          {otherTasks.length > 0 && (
            <div>
              {pinnedTasks.length > 0 && (
                <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-slate-200/60 dark:border-white/10">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Other Notes ({otherTasks.length}) — Drag to Reorder</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    onDropOnItem={onReorderTasks}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

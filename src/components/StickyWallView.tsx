import React, { useState } from 'react';
import { 
  Pin, 
  Layers, 
  Plus, 
  Sparkles, 
  Building2, 
  LayoutGrid, 
  ListTodo, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';
import { playCompletionSound } from '../utils/permissions';

export type WallLayoutMode = 'corporate' | 'studio';

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
  onQuickAdd: (status?: Task['status']) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  onMoveTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
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
  onMoveTaskStatus,
}) => {
  const [wallLayout, setWallLayout] = useState<WallLayoutMode>(() => {
    return (localStorage.getItem('omnisticky_wall_layout') as WallLayoutMode) || 'corporate';
  });

  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleSetLayout = (mode: WallLayoutMode) => {
    setWallLayout(mode);
    localStorage.setItem('omnisticky_wall_layout', mode);
  };

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Agile Lanes
  const backlogTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const deliveredTasks = tasks.filter(t => t.status === 'done');

  const corporateLanes = [
    {
      id: 'todo' as Task['status'],
      title: 'To Do / Backlog',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      badge: `${backlogTasks.length} Notes`,
      items: backlogTasks,
    },
    {
      id: 'in_progress' as Task['status'],
      title: 'In Progress / Sprint',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-300',
      badge: `${inProgressTasks.length} Active`,
      items: inProgressTasks,
    },
    {
      id: 'done' as Task['status'],
      title: 'Completed / Shipped',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      badge: `${deliveredTasks.length} Done`,
      items: deliveredTasks,
    },
  ];

  const handleColumnDrop = (e: React.DragEvent, colStatus: Task['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onMoveTaskStatus) {
      onMoveTaskStatus(taskId, colStatus);
      if (audioEnabled) playCompletionSound();
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      
      {/* Sleek, Unobtrusive Wall Navigation Bar (Clear View, No Clutter) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/70 dark:border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
            {tasks.length} {tasks.length === 1 ? 'Note' : 'Notes'}
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            • Drag post-its to reorder or advance stage
          </span>
        </div>

        {/* Right Controls: Wall Layout Switcher & New Post-it */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          
          {/* Wall Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-200/60 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSetLayout('corporate')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                wallLayout === 'corporate'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Corporate Whiteboard: Real sprint columns with drag & drop"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate Wall</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLayout('studio')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                wallLayout === 'studio'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Studio Canvas: Freeform creative post-it clusters"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Studio Canvas</span>
            </button>
          </div>

          {/* Quick Peel New Post-it */}
          <button
            onClick={() => onQuickAdd()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Peel Post-it</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-24 px-4 corporate-wall-surface">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            📝
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Whiteboard Wall is Clear
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Peel a fresh post-it note and stick it directly on the whiteboard.
          </p>
          <button
            onClick={() => onQuickAdd()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Stick First Post-it Note
          </button>
        </div>
      )}

      {/* OPTION 1: HYPERREALISTIC CORPORATE WHITEBOARD WALL */}
      {tasks.length > 0 && wallLayout === 'corporate' && (
        <div className="corporate-wall-surface p-4 sm:p-6 min-h-[620px] shadow-xl">
          
          {/* Top Magnetic Pinned Priorities Rail (if any notes pinned) */}
          {pinnedTasks.length > 0 && (
            <div className="mb-8 pb-6 border-b border-slate-300/60 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  <Pin className="w-3.5 h-3.5 fill-rose-500" />
                  <span>📌 Executive Priorities ({pinnedTasks.length})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Pinned to top magnetic rail
                </span>
              </div>

              {/* Centered square post-its flex row */}
              <div className="flex flex-wrap gap-6 items-start justify-start">
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

          {/* Real Corporate Whiteboard Agile Swimlanes (Expansive & Clear) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {corporateLanes.map(lane => {
              const isOver = dragOverCol === lane.id;

              return (
                <div
                  key={lane.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(lane.id);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => handleColumnDrop(e, lane.id)}
                  className={`flex flex-col min-h-[500px] p-3 rounded-2xl transition-colors duration-150 ${
                    isOver ? 'bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/40' : ''
                  }`}
                >
                  {/* Dry-Erase Whiteboard Marker Style Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-slate-300/80 dark:border-white/10 select-none">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${lane.dotColor}`} />
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100 font-mono">
                        {lane.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                        {lane.items.length}
                      </span>
                      <button
                        onClick={() => onQuickAdd(lane.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                        title={`Stick new note in ${lane.title}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Post-it Notes Stack: Real square proportions with comfortable spacing */}
                  <div className="space-y-6 flex flex-col items-center">
                    {lane.items.map((task, idx) => (
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

                    {lane.items.length === 0 && (
                      <div className="w-[260px] h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300/50 dark:border-white/10 rounded-2xl text-center px-4 opacity-60">
                        <span className="text-xl mb-1">📌</span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Empty lane • Drop post-its here
                        </span>
                        <button
                          onClick={() => onQuickAdd(lane.id)}
                          className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          + Peel note here
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* OPTION 2: HYPERREALISTIC STUDIO CANVAS WALL */}
      {tasks.length > 0 && wallLayout === 'studio' && (
        <div className="clean-canvas-surface p-5 sm:p-8 min-h-[550px]">
          
          {/* Pinned Notes Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-amber-300/40 dark:border-amber-700/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Post-its ({pinnedTasks.length}) — Drag to Reorder</span>
              </div>
              <div className="flex flex-wrap gap-6 items-start">
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
                  <span>Other Post-its ({otherTasks.length}) — Drag to Reorder</span>
                </div>
              )}
              <div className="flex flex-wrap gap-6 items-start">
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

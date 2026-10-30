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
  CheckCircle2, 
  Flame,
  Briefcase,
  SlidersHorizontal
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
  // Corporate Wall vs Studio Canvas Layout Option (saved to localStorage)
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

  // Corporate Agile Swimlane Categorization
  const backlogTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const deliveredTasks = tasks.filter(t => t.status === 'done');

  const corporateColumns = [
    {
      id: 'todo' as Task['status'],
      title: 'Backlog & Ideation',
      tagline: 'Incoming ideas & queued post-its',
      badgeColor: 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200',
      icon: <ListTodo className="w-4 h-4 text-blue-500" />,
      items: backlogTasks,
    },
    {
      id: 'in_progress' as Task['status'],
      title: 'In Progress / Sprint',
      tagline: 'Active execution & in flight',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      items: inProgressTasks,
    },
    {
      id: 'done' as Task['status'],
      title: 'Delivered / Shipped',
      tagline: 'Verified completed milestones',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Wall Header with Corporate vs Studio Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200/80 dark:border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {tasks.length} {tasks.length === 1 ? 'Post-it' : 'Post-its'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 flex-wrap">
            <span>{subtitle}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>
                {wallLayout === 'corporate' 
                  ? 'Corporate Agile Whiteboard active • Drag notes across lanes' 
                  : 'Studio Canvas active • Freeform post-it clusters'}
              </span>
            </span>
          </p>
        </div>

        {/* Actions: Wall Layout Switcher & New Post-it */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          
          {/* Wall Layout Toggle: Corporate Wall vs Studio Canvas */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSetLayout('corporate')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                wallLayout === 'corporate'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Corporate Agile Whiteboard: Swimlanes with sprint metrics & column drops"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate Wall</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLayout('studio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
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

          {/* Primary Action Button */}
          <button
            onClick={() => onQuickAdd()}
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
          <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            🏢
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Your Wall is Fresh & Ready
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Pin ideas, sprint goals, and tasks on the corporate whiteboard with tactile 3D pushpins and authentic handwriting ink.
          </p>
          <button
            onClick={() => onQuickAdd()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Create First Post-it Note
          </button>
        </div>
      )}

      {/* OPTION 1: CORPORATE AGILE WHITEBOARD WALL INTERFACE */}
      {tasks.length > 0 && wallLayout === 'corporate' && (
        <div className="space-y-6">
          
          {/* Corporate Sprint Pulse Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white/80 dark:bg-[#12151e]/80 border border-slate-200/80 dark:border-white/10 rounded-2xl backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-3 px-3 py-1.5 border-r border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Notes</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">{tasks.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5 border-r border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">In Flight</span>
                <p className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{inProgressTasks.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5 border-r border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Pin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Executive Pinned</span>
                <p className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{pinnedTasks.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Delivered</span>
                <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{deliveredTasks.length}</p>
              </div>
            </div>
          </div>

          {/* Corporate Whiteboard Glass Wall with Agile Swimlanes */}
          <div className="corporate-wall-surface p-4 sm:p-6 min-h-[550px]">
            
            {/* Top Pinned Executive Priorities Strip (if any notes pinned) */}
            {pinnedTasks.length > 0 && (
              <div className="mb-8 p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <Pin className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Executive Priorities ({pinnedTasks.length})</span>
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    Always visible at top of corporate wall
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Corporate Agile Swimlane Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {corporateColumns.map(col => {
                const isOver = dragOverCol === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCol(col.id);
                    }}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={(e) => handleColumnDrop(e, col.id)}
                    className={`corporate-column-lane flex flex-col p-4 min-h-[480px] ${
                      isOver ? 'drag-over' : ''
                    }`}
                  >
                    {/* Swimlane Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        {col.icon}
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            {col.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {col.tagline}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${col.badgeColor}`}>
                          {col.items.length}
                        </span>
                        <button
                          onClick={() => onQuickAdd(col.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                          title={`Add post-it to ${col.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Column Post-it Cards Stack */}
                    <div className="flex-1 space-y-6">
                      {col.items.map((task, idx) => (
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

                      {col.items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-center px-4">
                          <span className="text-2xl mb-1 opacity-50">📌</span>
                          <span className="text-xs font-semibold text-slate-400">
                            Drop post-its here
                          </span>
                          <button
                            onClick={() => onQuickAdd(col.id)}
                            className="mt-3 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + Add Post-it
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* OPTION 2: STUDIO CANVAS WALL INTERFACE */}
      {tasks.length > 0 && wallLayout === 'studio' && (
        <div className="clean-canvas-surface p-5 sm:p-8 min-h-[500px]">
          
          {/* Pinned Notes Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-amber-300/40 dark:border-amber-700/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Post-its ({pinnedTasks.length}) — Drag to Reorder</span>
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
                  <span>Other Post-its ({otherTasks.length}) — Drag to Reorder</span>
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

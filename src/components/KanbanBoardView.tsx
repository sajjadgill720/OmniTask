import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, ListTodo, GripVertical, Play, Pause, Trash2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import { checkDueDate, formatDuration } from '../utils/storage';

interface KanbanBoardViewProps {
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
  onMoveTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
}

// Compact Kanban card — much smaller than StickyNoteCard, purpose-built for columns
const KanbanCard: React.FC<{
  task: Task;
  project?: Project;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onDeleteTask: (id: string) => void;
  audioEnabled: boolean;
}> = ({ task, project, onSelectTask, onToggleComplete, onToggleTimer, onDeleteTask, audioEnabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const isDone = task.status === 'done';
  const dueInfo = checkDueDate(task.dueDate);
  const checklistTotal = task.checklists.length;
  const checklistDone = task.checklists.filter(c => c.completed).length;

  // Determine paper accent color
  const accentColor = task.paperColor || task.colorHex || '#FFF380';
  const isCharcoal = accentColor === '#2B2B2B';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onSelectTask(task)}
      className={`group relative flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
        isDragging
          ? 'opacity-40 scale-95 shadow-xl'
          : isDone
          ? 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/5'
          : 'bg-white dark:bg-[#1e1b24] border-slate-200/80 dark:border-white/10 shadow-xs'
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: isDone ? '#d1d5db' : (project?.colorHex || accentColor),
      }}
    >
      {/* Row 1: Grip + Checkbox + Title */}
      <div className="flex items-start gap-2">
        <GripVertical className="w-3 h-3 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition cursor-grab" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
            if (audioEnabled) playCompletionSound();
          }}
          className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : task.priority === 'urgent'
              ? 'border-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
          }`}
          title={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone && <CheckCircle2 className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold leading-tight block truncate ${
            isDone
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-white'
          }`}>
            {task.title || 'Untitled'}
          </span>
          {task.notes && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block mt-0.5 leading-tight">
              {task.notes.slice(0, 60)}{task.notes.length > 60 ? '…' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Metadata chips */}
      <div className="flex items-center gap-1.5 pl-9 flex-wrap">
        {/* Priority indicator */}
        {task.priority === 'urgent' && (
          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 tracking-wider">
            Urgent
          </span>
        )}

        {/* Due date chip */}
        {dueInfo.label && (
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
            dueInfo.isOverdue
              ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
          }`}>
            {dueInfo.label}
          </span>
        )}

        {/* Checklist progress */}
        {checklistTotal > 0 && (
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
            checklistDone === checklistTotal
              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
          }`}>
            ☑ {checklistDone}/{checklistTotal}
          </span>
        )}

        {/* Project */}
        {project && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: project.colorHex }} />
            {project.title}
          </span>
        )}

        {/* Timer */}
        {task.timeSpentSeconds > 0 && (
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-white/5 text-slate-500">
            ⏱ {formatDuration(task.timeSpentSeconds)}
          </span>
        )}

        {/* Tags */}
        {task.tags.slice(0, 2).map(tag => (
          <span key={tag} className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400">
            #{tag}
          </span>
        ))}
      </div>

      {/* Hover action buttons — top right corner */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTimer(task.id);
          }}
          className={`p-1 rounded-lg transition ${
            task.isTimerRunning
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 animate-pulse'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title={task.isTimerRunning ? 'Pause timer' : 'Start timer'}
        >
          {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
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
  onMoveTaskStatus,
}) => {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const columns = [
    {
      id: 'todo' as Task['status'],
      title: 'To Do',
      accent: '#94a3b8',
      headerBg: 'bg-slate-50 dark:bg-slate-800/60',
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      icon: <ListTodo className="w-4 h-4 text-slate-500" />,
      items: todoTasks,
      emptyText: 'Capture something new',
      emptyIcon: '📝',
    },
    {
      id: 'in_progress' as Task['status'],
      title: 'In Progress',
      accent: '#3b82f6',
      headerBg: 'bg-blue-50 dark:bg-blue-950/30',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      items: inProgressTasks,
      emptyText: 'Drag a note here to start working',
      emptyIcon: '⏳',
    },
    {
      id: 'done' as Task['status'],
      title: 'Completed',
      accent: '#10b981',
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      items: doneTasks,
      emptyText: 'Complete tasks to see them here',
      emptyIcon: '🎉',
    },
  ];

  const handleColumnDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl">📋</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Board
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {tasks.length} {tasks.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Drag notes between columns to track progress from start to finish.
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New note</span>
        </button>
      </div>

      {/* 3 Kanban Columns — scrollable on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map(col => {
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleColumnDragOver(e, col.id)}
              onDragLeave={(e) => {
                // Only clear if leaving the column container itself, not entering a child
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                }
              }}
              onDrop={(e) => handleColumnDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[300px] ${
                isOver
                  ? 'ring-2 ring-blue-500 shadow-lg border-blue-300 dark:border-blue-700 scale-[1.005]'
                  : 'border-slate-200/80 dark:border-white/10'
              }`}
              style={{
                background: isOver
                  ? 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 40%)'
                  : undefined,
              }}
            >
              {/* Column Header — sticky inside */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-black/5 dark:border-white/5 ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                    {col.title}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${col.badgeColor}`}>
                  {col.items.length}
                </span>
              </div>

              {/* Cards Stack */}
              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)]">
                {col.items.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-10 px-3 border-2 border-dashed rounded-xl transition-all ${
                    isOver
                      ? 'border-blue-400 bg-blue-500/5 dark:bg-blue-500/10'
                      : 'border-slate-200 dark:border-slate-700/60'
                  }`}>
                    <span className="text-2xl mb-2">{col.emptyIcon}</span>
                    <span className="text-[11px] text-slate-400 font-medium text-center">
                      {isOver ? '✦ Drop here!' : col.emptyText}
                    </span>
                  </div>
                ) : (
                  col.items.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      project={projects.find(p => p.id === task.projectId)}
                      onSelectTask={onSelectTask}
                      onToggleComplete={onToggleComplete}
                      onToggleTimer={onToggleTimer}
                      onDeleteTask={onDeleteTask}
                      audioEnabled={audioEnabled}
                    />
                  ))
                )}
              </div>

              {/* Column Footer — quick add for To Do */}
              {col.id === 'todo' && (
                <div className="px-3 pb-3 pt-1">
                  <button
                    onClick={onQuickAdd}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-dashed border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add note</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

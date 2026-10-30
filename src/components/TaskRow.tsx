import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Clock, 
  Play, 
  Pause, 
  ExternalLink, 
  ListOrdered, 
  FileText, 
  Moon, 
  AlertCircle,
  Calendar,
  GripVertical,
  Pin,
  Trash2,
  Edit2
} from 'lucide-react';
import { Task, Project } from '../types';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface TaskRowProps {
  task: Task;
  project?: Project;
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  audioEnabled: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  audioEnabled,
}) => {
  const isDone = task.status === 'done';
  const dueInfo = checkDueDate(task.dueDate);
  const checklistTotal = task.checklists.length;
  const checklistDone = task.checklists.filter(c => c.completed).length;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== task.title && onUpdateTask) {
      onUpdateTask({ ...task, title: trimmed });
    } else {
      setTitleInput(task.title);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);

    if (!isDone) {
      if (audioEnabled) {
        playCompletionSound();
      }
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: [task.colorHex || '#3b82f6', '#10b981', '#f59e0b'],
      });
    }
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTimer(task.id);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTask) {
      onUpdateTask({ ...task, isPinned: !task.isPinned });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
  };

  const priorityMeta = {
    urgent: { label: 'Urgent', bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' },
    high: { label: 'High', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    normal: { label: 'Normal', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900' },
    low: { label: 'Low', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  };

  const currentPriority = priorityMeta[task.priority || 'normal'];
  const noteColor = task.colorHex || '#fef08a';

  return (
    <div
      draggable={Boolean(onReorderTasks)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => {
        if (!onReorderTasks) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!onReorderTasks) return;
        e.preventDefault();
        setIsDragOver(false);
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== task.id) {
          onReorderTasks(sourceId, task.id);
          if (audioEnabled) playCompletionSound();
        }
      }}
      onClick={() => onSelectTask(task)}
      className={`group relative flex items-center justify-between gap-3 px-3.5 py-3 bg-white dark:bg-[#151821] hover:bg-slate-50/90 dark:hover:bg-[#1a1e2a] border border-slate-200/90 dark:border-white/10 rounded-2xl transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md ${
        isDone ? 'opacity-60 bg-slate-50/60 dark:bg-slate-900/40' : ''
      } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${isDragOver ? 'ring-2 ring-blue-500 scale-[1.01]' : ''}`}
      style={{
        borderLeftColor: noteColor,
        borderLeftWidth: '5px',
      }}
    >
      {/* Left side: Drag Handle + Checkbox + Title + Meta badges */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        
        {/* Drag Reorder Handle */}
        {onReorderTasks && (
          <div 
            className="p-1 -ml-1 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition cursor-grab active:cursor-grabbing shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Things 3 signature circular checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            isDone 
              ? 'bg-blue-500 border-blue-500 text-white scale-95 shadow-xs' 
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 group-hover:scale-105'
          }`}
          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>

        {/* Task Title & Project label */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            
            {/* Inline Title Editor vs Static Text */}
            {isEditingTitle ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSaveTitle(); }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setTitleInput(task.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-blue-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </form>
            ) : (
              <span 
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className={`text-xs font-semibold truncate ${
                  isDone 
                    ? 'line-through text-slate-400 dark:text-slate-500' 
                    : 'text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title="Double-click to edit inline"
              >
                {task.title || 'Untitled Task'}
              </span>
            )}

            {/* Pinned Note Indicator */}
            {task.isPinned && (
              <span title="Pinned to Top">
                <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              </span>
            )}

            {/* Things 3 "This Evening" Indicator */}
            {task.isThisEvening && !isDone && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400" title="This Evening">
                <Moon className="w-2.5 h-2.5 fill-indigo-400" />
              </span>
            )}

            {/* Priority Pill */}
            {task.priority && task.priority !== 'normal' && (
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${currentPriority.bg}`}>
                {currentPriority.label}
              </span>
            )}
          </div>

          {/* Subtext info: Project & Checklist progress & Notes preview */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 flex-wrap">
            {project && (
              <span 
                className="font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                style={{ color: project.colorHex }}
              >
                {project.title}
              </span>
            )}

            {checklistTotal > 0 && (
              <span className="flex items-center gap-0.5 font-mono bg-slate-100 dark:bg-white/5 px-1 rounded">
                <ListOrdered className="w-2.5 h-2.5" />
                <span>{checklistDone}/{checklistTotal}</span>
              </span>
            )}

            {task.notes && (
              <span className="flex items-center gap-1 text-slate-400 truncate max-w-xs" title={task.notes}>
                <FileText className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate italic">{task.notes}</span>
              </span>
            )}

            {task.tags.map(t => (
              <span key={t} className="text-slate-400 font-medium">#{t}</span>
            ))}
          </div>
        </div>

      </div>

      {/* Right side: Quick Action Suite + Due Date + Focus Timer */}
      <div className="flex items-center gap-2 shrink-0 text-[11px]">
        
        {/* Quick Action Buttons on Hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          {onUpdateTask && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                title="Edit Title"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleTogglePin}
                className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                title={task.isPinned ? 'Unpin Task' : 'Pin Task to Top'}
              >
                <Pin className={`w-3 h-3 ${task.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </>
          )}

          {onDeleteTask && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Due Date Indicator */}
        {task.dueDate && !isDone && (
          <span className={`flex items-center gap-1 font-medium text-[10px] px-1.5 py-0.5 rounded-md ${
            dueInfo.isOverdue 
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold' 
              : dueInfo.isToday 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold' 
              : 'text-slate-400 bg-slate-100 dark:bg-white/5'
          }`}>
            {dueInfo.isOverdue ? (
              <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
            ) : (
              <Calendar className="w-2.5 h-2.5" />
            )}
            <span>{dueInfo.label}</span>
          </span>
        )}

        {/* Anchored URL */}
        {task.contextUrl && (
          <a
            href={task.contextUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-slate-400 hover:text-blue-500 transition"
            title={`Open: ${task.contextUrl}`}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Built-in Focus Timer */}
        <div 
          onClick={handleTimerClick}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition cursor-pointer ${
            task.isTimerRunning
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-slate-200 dark:border-white/10 hover:text-slate-800'
          }`}
          title={task.isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
        >
          <Clock className="w-2.5 h-2.5" />
          <span className="font-mono text-[10px] font-semibold">
            {formatDuration(task.timeSpentSeconds)}
          </span>
          {task.isTimerRunning ? (
            <Pause className="w-2.5 h-2.5 ml-0.5 text-rose-600" />
          ) : (
            <Play className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100" />
          )}
        </div>

      </div>
    </div>
  );
};

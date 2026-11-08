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
    urgent: { label: 'Urgent', bg: 'bg-rose-500/20 text-rose-300 border-rose-400/40' },
    high: { label: 'High', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
    normal: { label: 'Normal', bg: 'bg-blue-500/20 text-blue-300 border-blue-400/40' },
    low: { label: 'Low', bg: 'bg-white/10 text-white/60 border-white/15' },
  };

  const currentPriority = priorityMeta[task.priority || 'normal'];
  const noteColor = task.paperColor || task.colorHex || '#FFF380';

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
      className={`group relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer shadow-md select-none border border-white/15 backdrop-blur-xl ${
        isDone 
          ? 'bg-black/30 dark:bg-black/40 opacity-70' 
          : 'bg-black/45 hover:bg-black/55 dark:bg-black/60 dark:hover:bg-black/70 hover:scale-[1.01]'
      } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${isDragOver ? 'ring-2 ring-amber-400 scale-[1.01]' : ''}`}
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
            className="p-1 -ml-1 text-white/30 group-hover:text-white/70 transition cursor-grab active:cursor-grabbing shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Circular Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            isDone 
              ? 'bg-emerald-500 border-emerald-500 text-white scale-95 shadow-xs' 
              : 'border-white/40 hover:border-amber-400 group-hover:scale-105'
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
                  className="w-full px-2 py-0.5 text-xs font-semibold bg-black/60 border border-amber-400 rounded-md focus:outline-none text-white"
                />
              </form>
            ) : (
              <span 
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className={`text-xs sm:text-sm font-semibold truncate ${
                  isDone 
                    ? 'line-through text-white/40' 
                    : 'text-white/95 hover:text-amber-300 font-handwriting tracking-wide text-sm'
                }`}
                title="Double-click to edit inline"
              >
                {task.title || 'Untitled Note'}
              </span>
            )}

            {/* Pinned Note Indicator */}
            {task.isPinned && (
              <span title="Pinned to Top">
                <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              </span>
            )}

            {/* "This Evening" Indicator */}
            {task.isThisEvening && !isDone && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-300" title="This Evening">
                <Moon className="w-2.5 h-2.5 fill-indigo-300" />
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
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/50 flex-wrap">
            {project && (
              <span 
                className="font-semibold px-1.5 py-0.2 rounded-md bg-white/10 border border-white/10"
                style={{ color: project.colorHex || '#60a5fa' }}
              >
                {project.title}
              </span>
            )}

            {checklistTotal > 0 && (
              <span className="flex items-center gap-0.5 font-mono bg-white/10 px-1 rounded text-white/70">
                <ListOrdered className="w-2.5 h-2.5" />
                <span>{checklistDone}/{checklistTotal}</span>
              </span>
            )}

            {task.notes && (
              <span className="flex items-center gap-1 text-white/50 truncate max-w-xs font-handwriting" title={task.notes}>
                <FileText className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{task.notes}</span>
              </span>
            )}

            {task.tags.map(t => (
              <span key={t} className="text-white/40 font-medium">#{t}</span>
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
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Edit Title"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleTogglePin}
                className="p-1 rounded-md text-white/60 hover:text-amber-400 hover:bg-white/10 transition cursor-pointer"
                title={task.isPinned ? 'Unpin Task' : 'Pin Task to Top'}
              >
                <Pin className={`w-3 h-3 ${task.isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </>
          )}

          {onDeleteTask && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded-md text-white/60 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer"
              title="Delete Note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Due Date Indicator */}
        {task.dueDate && !isDone && (
          <span className={`flex items-center gap-1 font-medium text-[10px] px-1.5 py-0.5 rounded-md ${
            dueInfo.isOverdue 
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' 
              : dueInfo.isToday 
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
              : 'text-white/50 bg-white/10'
          }`}>
            {dueInfo.isOverdue ? (
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
            ) : (
              <Calendar className="w-2.5 h-2.5" />
            )}
            <span>{dueInfo.label}</span>
          </span>
        )}

        {/* Context URL */}
        {task.contextUrl && (
          <a
            href={task.contextUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-white/50 hover:text-sky-300 transition"
            title={`Open: ${task.contextUrl}`}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Built-in Focus Timer */}
        <div 
          onClick={handleTimerClick}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border transition cursor-pointer ${
            task.isTimerRunning
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-white/10 text-white/70 border-white/15 hover:text-white hover:bg-white/15'
          }`}
          title={task.isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
        >
          <Clock className="w-2.5 h-2.5" />
          <span className="font-mono text-[10px] font-semibold">
            {formatDuration(task.timeSpentSeconds)}
          </span>
          {task.isTimerRunning ? (
            <Pause className="w-2.5 h-2.5 ml-0.5 text-rose-400" />
          ) : (
            <Play className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100" />
          )}
        </div>

      </div>
    </div>
  );
};

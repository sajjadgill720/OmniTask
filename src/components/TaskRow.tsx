import React from 'react';
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
  Calendar
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
  audioEnabled: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  audioEnabled,
}) => {
  const isDone = task.status === 'done';
  const dueInfo = checkDueDate(task.dueDate);
  const checklistTotal = task.checklists.length;
  const checklistDone = task.checklists.filter(c => c.completed).length;

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
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      });
    }
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTimer(task.id);
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white dark:bg-[#181a20] hover:bg-slate-50 dark:hover:bg-[#1e2027] border border-slate-200/80 dark:border-slate-800 rounded-2xl transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm ${
        isDone ? 'opacity-60 bg-slate-50/60 dark:bg-slate-900/40' : ''
      }`}
    >
      {/* Left side: Checkbox + Title + Meta badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        
        {/* Things 3 signature circular checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            isDone 
              ? 'bg-blue-500 border-blue-500 text-white scale-95' 
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 group-hover:scale-105'
          }`}
          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>

        {/* Task Title & Project label */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium truncate ${
              isDone 
                ? 'line-through text-slate-400 dark:text-slate-500' 
                : 'text-slate-800 dark:text-slate-100'
            }`}>
              {task.title || 'Untitled Task'}
            </span>

            {/* Things 3 "This Evening" Indicator */}
            {task.isThisEvening && !isDone && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400" title="This Evening">
                <Moon className="w-2.5 h-2.5 fill-indigo-400" />
              </span>
            )}
          </div>

          {/* Subtext info: Project & Checklist progress */}
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
            {project && (
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {project.title}
              </span>
            )}

            {checklistTotal > 0 && (
              <span className="flex items-center gap-0.5 font-mono">
                <ListOrdered className="w-2.5 h-2.5" />
                <span>{checklistDone}/{checklistTotal}</span>
              </span>
            )}

            {task.notes && (
              <span className="flex items-center gap-0.5" title="Has notes">
                <FileText className="w-2.5 h-2.5 text-slate-400" />
              </span>
            )}

            {task.tags.map(t => (
              <span key={t} className="text-slate-400">#{t}</span>
            ))}
          </div>
        </div>

      </div>

      {/* Right side: Due Date + Context Link + Focus Timer */}
      <div className="flex items-center gap-2 shrink-0 text-[11px]">
        
        {/* Due Date Indicator */}
        {task.dueDate && !isDone && (
          <span className={`flex items-center gap-1 font-medium text-[10px] ${
            dueInfo.isOverdue 
              ? 'text-rose-600 font-bold' 
              : dueInfo.isToday 
              ? 'text-amber-600 font-bold' 
              : 'text-slate-400'
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
            className="p-1 text-slate-400 hover:text-indigo-600 transition"
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
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800'
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


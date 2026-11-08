import React, { useState } from 'react';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { Task, Project } from '../types';
import { RedPushPin } from './RedPushPin';
import { checkDueDate } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface StudioBoardViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
}

/**
 * StudioBoardView
 * The 3-Column Photorealistic Sticky Note Kanban Wall from the reference photo:
 * - TO DO: Warm canary yellow & peach notes pinned with cyan/red pushpins
 * - IN PROGRESS: Mint green & sky blue notes pinned with blue/green pushpins
 * - DONE: Lavender & pastel notes pinned with purple pushpins
 */
export const StudioBoardView: React.FC<StudioBoardViewProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onMoveTaskStatus,
  audioEnabled,
  onQuickAdd,
}) => {
  // Drag over column state for physical drop highlighting
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

  // Group tasks into the three core wall zones
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    onMoveTaskStatus(taskId, targetStatus);
    if (audioEnabled) playCompletionSound();

    if (targetStatus === 'done') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
      
      {/* =======================================================================
          ZONE 1: TO DO (Warm Yellow & Peach Notes)
          ======================================================================= */}
      <div 
        onDragOver={(e) => handleColumnDragOver(e, 'todo')}
        onDragLeave={() => setDragOverCol(null)}
        onDrop={(e) => handleColumnDrop(e, 'todo')}
        className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
          dragOverCol === 'todo' ? 'bg-amber-500/10 ring-2 ring-amber-400 scale-[1.01]' : ''
        }`}
      >
        {/* Pinned Title Card (Yellow index card pinned with cyan pin) */}
        <div className="relative mb-5 w-full max-w-[270px]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <RedPushPin color="cyan" size={32} />
          </div>
          <div 
            className="px-5 py-3 rounded-2xl bg-[#FFF380] border border-amber-300 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
            style={{ transform: 'rotate(-0.8deg)' }}
          >
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-stone-700 stroke-[2.5]" />
              <span className="font-extrabold">To Do</span>
            </div>
            <span className="w-6 h-6 rounded-full bg-amber-400/60 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
              {todoTasks.length}
            </span>
          </div>
        </div>

        {/* Task Notes Stack */}
        <div className="w-full space-y-4">
          {todoTasks.map((task, idx) => {
            const angles = [-1.8, 1.4, -0.9, 1.9, -1.5];
            const angle = angles[idx % angles.length];
            const pinColors: ('red' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'green')[] = ['red', 'cyan', 'blue', 'yellow'];
            const pinColor = pinColors[idx % pinColors.length];
            const isPeach = idx % 2 === 1;
            const dueInfo = checkDueDate(task.dueDate);

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => onSelectTask(task)}
                className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-xl hover:z-20 select-none shadow-md"
                style={{
                  backgroundColor: task.paperColor || (isPeach ? '#FF9AA2' : '#FFF380'),
                  borderColor: isPeach ? '#f43f5e' : '#eab308',
                  color: '#1c1917',
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Pushpin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color={pinColor} size={28} />
                </div>

                {/* Top Action Row (Checkbox + Title) */}
                <div className="flex items-start gap-2.5 mb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTaskStatus(task.id, 'in_progress');
                      if (audioEnabled) playCompletionSound();
                    }}
                    className="w-4 h-4 mt-0.5 rounded-full border-2 border-stone-800 hover:bg-stone-800/10 flex items-center justify-center shrink-0 transition"
                    title="Click to start task"
                  />
                  <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1">
                    {task.title}
                  </h3>
                </div>

                {/* Notes snippet if present */}
                {task.notes && (
                  <p className="text-xs font-handwriting text-stone-800/80 line-clamp-2 mb-2.5 pl-6">
                    {task.notes}
                  </p>
                )}

                {/* Bottom Metadata (Due chip + Tag pill) */}
                <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dueInfo.label && (
                      <span className="flex items-center gap-0.5 text-stone-700">
                        <span>📅</span>
                        <span>{dueInfo.label}</span>
                      </span>
                    )}
                    {task.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-900/10 text-stone-800 font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick Advance Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTaskStatus(task.id, 'in_progress');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition text-stone-700"
                    title="Move to In Progress"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty State / Add note placeholder */}
          {todoTasks.length === 0 && (
            <div 
              onClick={onQuickAdd}
              className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-amber-300/80 dark:border-amber-400/20 text-stone-500 hover:border-amber-400 hover:text-stone-800 cursor-pointer transition"
            >
              <span className="text-2xl block mb-1">📝</span>
              <span className="text-xs font-bold">+ Pin a note here</span>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          ZONE 2: IN PROGRESS (Green & Blue Notes)
          ======================================================================= */}
      <div 
        onDragOver={(e) => handleColumnDragOver(e, 'in_progress')}
        onDragLeave={() => setDragOverCol(null)}
        onDrop={(e) => handleColumnDrop(e, 'in_progress')}
        className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
          dragOverCol === 'in_progress' ? 'bg-blue-500/10 ring-2 ring-blue-400 scale-[1.01]' : ''
        }`}
      >
        {/* Pinned Title Card (Lime index card pinned with blue pin) */}
        <div className="relative mb-5 w-full max-w-[270px]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <RedPushPin color="blue" size={32} />
          </div>
          <div 
            className="px-5 py-3 rounded-2xl bg-[#D9F99D] border border-lime-400 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
            style={{ transform: 'rotate(0.9deg)' }}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700 stroke-[2.5]" />
              <span className="font-extrabold">In Progress</span>
            </div>
            <span className="w-6 h-6 rounded-full bg-lime-400 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
              {inProgressTasks.length}
            </span>
          </div>
        </div>

        {/* Task Notes Stack */}
        <div className="w-full space-y-4">
          {inProgressTasks.map((task, idx) => {
            const angles = [1.2, -1.6, 1.8, -1.1];
            const angle = angles[idx % angles.length];
            const isBlue = idx % 2 === 1;
            const dueInfo = checkDueDate(task.dueDate);

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => onSelectTask(task)}
                className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-xl hover:z-20 select-none shadow-md"
                style={{
                  backgroundColor: task.paperColor || (isBlue ? '#C7CEEA' : '#B5EAD7'),
                  borderColor: isBlue ? '#6366f1' : '#10b981',
                  color: '#1c1917',
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Pushpin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color={isBlue ? 'blue' : 'green'} size={28} />
                </div>

                {/* Top Action Row */}
                <div className="flex items-start gap-2.5 mb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTaskStatus(task.id, 'done');
                      if (audioEnabled) playCompletionSound();
                    }}
                    className="w-4 h-4 mt-0.5 rounded-full border-2 border-emerald-700 bg-emerald-500/20 hover:bg-emerald-500 flex items-center justify-center shrink-0 transition"
                    title="Mark task done"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                  </button>
                  <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1">
                    {task.title}
                  </h3>
                </div>

                {/* Notes snippet */}
                {task.notes && (
                  <p className="text-xs font-handwriting text-stone-800/80 line-clamp-2 mb-2.5 pl-6">
                    {task.notes}
                  </p>
                )}

                {/* Bottom Metadata & Timer */}
                <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dueInfo.label && (
                      <span className="flex items-center gap-0.5 text-stone-700">
                        <span>📅</span>
                        <span>{dueInfo.label}</span>
                      </span>
                    )}
                    {task.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-900/10 text-stone-800 font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stopwatch */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTimer(task.id);
                    }}
                    className={`p-1 rounded transition ${
                      task.isTimerRunning ? 'text-rose-600 animate-pulse font-bold' : 'text-stone-700 hover:bg-black/10'
                    }`}
                    title={task.isTimerRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}

          {inProgressTasks.length === 0 && (
            <div className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-emerald-300/80 dark:border-emerald-400/20 text-stone-500">
              <span className="text-2xl block mb-1">⏳</span>
              <span className="text-xs font-bold">Drag tasks here when started</span>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          ZONE 3: DONE (Lavender & Pastel Green Notes)
          ======================================================================= */}
      <div 
        onDragOver={(e) => handleColumnDragOver(e, 'done')}
        onDragLeave={() => setDragOverCol(null)}
        onDrop={(e) => handleColumnDrop(e, 'done')}
        className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-2 ${
          dragOverCol === 'done' ? 'bg-purple-500/10 ring-2 ring-purple-400 scale-[1.01]' : ''
        }`}
      >
        {/* Pinned Title Card (Lavender index card pinned with purple pin) */}
        <div className="relative mb-5 w-full max-w-[270px]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <RedPushPin color="purple" size={32} />
          </div>
          <div 
            className="px-5 py-3 rounded-2xl bg-[#DDD6FE] border border-purple-300 text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight"
            style={{ transform: 'rotate(-1.1deg)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-700 stroke-[2.5]" />
              <span className="font-extrabold">Done</span>
            </div>
            <span className="w-6 h-6 rounded-full bg-purple-300 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
              {doneTasks.length}
            </span>
          </div>
        </div>

        {/* Task Notes Stack */}
        <div className="w-full space-y-4">
          {doneTasks.map((task, idx) => {
            const angles = [-1.4, 1.2, -1.9, 0.9, 1.7];
            const angle = angles[idx % angles.length];
            const paletteColors = ['#E9D5FF', '#D9F99D', '#FF9AA2', '#FFF380'];
            const bgColor = paletteColors[idx % paletteColors.length];

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => onSelectTask(task)}
                className="group relative w-full max-w-[270px] mx-auto p-4 pt-6 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] select-none shadow-sm opacity-90 hover:opacity-100"
                style={{
                  backgroundColor: task.paperColor || bgColor,
                  borderColor: 'rgba(0,0,0,0.15)',
                  color: '#1c1917',
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Pushpin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <RedPushPin color="purple" size={28} />
                </div>

                {/* Top Action Row */}
                <div className="flex items-start gap-2.5 mb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTaskStatus(task.id, 'todo');
                    }}
                    className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition"
                    title="Click to reopen task"
                  >
                    ✓
                  </button>
                  <h3 className="text-base font-bold font-handwriting leading-snug break-words flex-1 line-through opacity-75">
                    {task.title}
                  </h3>
                </div>

                {/* Bottom Completed Timestamp */}
                <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Done</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-rose-600 hover:bg-rose-100 rounded transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {doneTasks.length === 0 && (
            <div className="w-full max-w-[270px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-purple-300/80 dark:border-purple-400/20 text-stone-500">
              <span className="text-2xl block mb-1">🎉</span>
              <span className="text-xs font-bold">Completed notes will pin here</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

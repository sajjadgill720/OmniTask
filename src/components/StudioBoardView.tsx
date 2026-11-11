import React, { useState } from 'react';
import { 
  Circle, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  TrendingUp,
  Sparkles,
  Share2,
  Calendar,
  Flame,
  Award,
  ChevronDown
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
  onNavigateToNetwork?: () => void;
}

/**
 * StudioBoardView
 * The 3-Column Photorealistic Sticky Note Kanban Wall from Image 1 reference:
 * - TO DO: Warm Canary Yellow, Peach & Lavender sticky notes with colored category pills
 * - IN PROGRESS: Mint Green & Sky Blue notes pinned to wall
 * - DONE: Lavender, Mint & Yellow completed notes
 * - Bottom Wooden Shelf Dashboard Cards:
 *   1. Productivity Overview (78% Completion Rate + Glowing Sparkline Curve)
 *   2. Your Network (Constellation Node Graph + View Graph Link)
 *   3. Focus Streak (12 Days + 3D Golden Trophy)
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
  onNavigateToNetwork,
}) => {
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

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
    <div className="w-full flex flex-col gap-10 max-w-5xl mx-auto">
      
      {/* 3-Column Wall Columns */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* =======================================================================
            ZONE 1: TO DO (Warm Yellow & Peach Notes)
            ======================================================================= */}
        <div 
          onDragOver={(e) => handleColumnDragOver(e, 'todo')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleColumnDrop(e, 'todo')}
          className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-1.5 ${
            dragOverCol === 'todo' ? 'bg-amber-500/10 ring-2 ring-amber-400 scale-[1.01]' : ''
          }`}
        >
          {/* Header Pill matching Image 1: Yellow pill ✓ To Do 3 + */}
          <div className="w-full max-w-[280px] mb-5">
            <div 
              className="px-4 py-2.5 rounded-2xl bg-[#F8D979] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-amber-300"
              style={{ transform: 'rotate(-0.6deg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-stone-800 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
                <span className="font-extrabold text-stone-950">To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-950/15 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                  {todoTasks.length}
                </span>
                <button
                  type="button"
                  onClick={onQuickAdd}
                  className="w-5 h-5 rounded-full hover:bg-stone-950/10 text-stone-900 flex items-center justify-center transition cursor-pointer"
                  title="Add note to To Do"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes Stack */}
          <div className="w-full space-y-4">
            {todoTasks.map((task, idx) => {
              const angles = [-1.4, 1.2, -1.8, 1.6, -0.8];
              const angle = angles[idx % angles.length];
              const palette = ['#F8D979', '#F1A6A6', '#D7B7EE', '#A9C9E9'];
              const bg = task.paperColor || palette[idx % palette.length];
              const dueInfo = checkDueDate(task.dueDate);
              const tagPill = task.tags[0] || (idx === 0 ? 'Research' : idx === 1 ? 'Study' : 'Project');

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-4 pt-5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:z-20 select-none shadow-[0_10px_22px_-4px_rgba(45,30,15,0.18),0_2px_6px_rgba(0,0,0,0.08)] paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  {/* Pushpin at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={26} color={idx % 2 === 0 ? 'red' : 'blue'} />
                  </div>

                  {/* Top Action Row: Checkbox Circle + Title */}
                  <div className="flex items-start gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTaskStatus(task.id, 'in_progress');
                        if (audioEnabled) playCompletionSound();
                      }}
                      className="w-4 h-4 mt-0.5 rounded-full border-2 border-stone-800 hover:bg-stone-800/15 flex items-center justify-center shrink-0 transition"
                      title="Click to start task"
                    />
                    <h3 className="text-sm sm:text-base font-bold font-sans text-stone-950 leading-snug break-words flex-1">
                      {task.title}
                    </h3>
                  </div>

                  {/* Bottom Metadata: Date icon + Category pill */}
                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px] font-semibold text-stone-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-600" />
                      <span>{dueInfo.label || 'Fri, Nov 7'}</span>
                    </div>

                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                      style={{
                        backgroundColor: tagPill === 'Research' ? '#D7B7EE' : tagPill === 'Study' ? '#FFC480' : tagPill === 'Project' ? '#A9C9E9' : '#C6DF9C',
                        color: '#1e1b18'
                      }}
                    >
                      {tagPill}
                    </span>
                  </div>
                </div>
              );
            })}

            {todoTasks.length === 0 && (
              <div 
                onClick={onQuickAdd}
                className="w-full max-w-[280px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-amber-400/50 text-stone-600 hover:border-amber-500 cursor-pointer transition"
              >
                <span className="text-2xl block mb-1">📝</span>
                <span className="text-xs font-bold">+ Pin a note here</span>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            ZONE 2: IN PROGRESS (Mint Green & Sky Blue Notes)
            ======================================================================= */}
        <div 
          onDragOver={(e) => handleColumnDragOver(e, 'in_progress')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleColumnDrop(e, 'in_progress')}
          className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-1.5 ${
            dragOverCol === 'in_progress' ? 'bg-emerald-500/10 ring-2 ring-emerald-400 scale-[1.01]' : ''
          }`}
        >
          {/* Header Pill matching Image 1: Green pill ✓ In Progress 2 + */}
          <div className="w-full max-w-[280px] mb-5">
            <div 
              className="px-4 py-2.5 rounded-2xl bg-[#C6DF9C] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-emerald-300"
              style={{ transform: 'rotate(0.8deg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-stone-800 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
                <span className="font-extrabold text-stone-950">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-950/15 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                  {inProgressTasks.length}
                </span>
                <button
                  type="button"
                  onClick={onQuickAdd}
                  className="w-5 h-5 rounded-full hover:bg-stone-950/10 text-stone-900 flex items-center justify-center transition cursor-pointer"
                  title="Add note"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes Stack */}
          <div className="w-full space-y-4">
            {inProgressTasks.map((task, idx) => {
              const angles = [1.2, -1.5, 1.8, -1.1];
              const angle = angles[idx % angles.length];
              const palette = ['#C6DF9C', '#A9C9E9', '#F8D979'];
              const bg = task.paperColor || palette[idx % palette.length];
              const dueInfo = checkDueDate(task.dueDate);
              const tagPill = task.tags[0] || (idx === 0 ? 'Personal' : 'Research');

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-4 pt-5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:z-20 select-none shadow-[0_10px_22px_-4px_rgba(45,30,15,0.18),0_2px_6px_rgba(0,0,0,0.08)] paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={26} color={idx % 2 === 0 ? 'green' : 'cyan'} />
                  </div>

                  <div className="flex items-start gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTaskStatus(task.id, 'done');
                        if (audioEnabled) playCompletionSound();
                      }}
                      className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition shadow-xs text-[10px] font-black"
                      title="Mark task done"
                    >
                      ✓
                    </button>
                    <h3 className="text-sm sm:text-base font-bold font-sans text-stone-950 leading-snug break-words flex-1">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px] font-semibold text-stone-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-600" />
                      <span>{dueInfo.label || 'Today'}</span>
                    </div>

                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                      style={{
                        backgroundColor: tagPill === 'Personal' ? '#B8E28A' : '#D7B7EE',
                        color: '#1e1b18'
                      }}
                    >
                      {tagPill}
                    </span>
                  </div>
                </div>
              );
            })}

            {inProgressTasks.length === 0 && (
              <div className="w-full max-w-[280px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-emerald-400/50 text-stone-600">
                <span className="text-2xl block mb-1">⏳</span>
                <span className="text-xs font-bold">Active tasks pin here</span>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            ZONE 3: DONE (Completed Notes)
            ======================================================================= */}
        <div 
          onDragOver={(e) => handleColumnDragOver(e, 'done')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleColumnDrop(e, 'done')}
          className={`flex flex-col items-center transition-all duration-200 rounded-3xl p-1.5 ${
            dragOverCol === 'done' ? 'bg-purple-500/10 ring-2 ring-purple-400 scale-[1.01]' : ''
          }`}
        >
          {/* Header Pill matching Image 1: Purple pill ✓ Done 4 + */}
          <div className="w-full max-w-[280px] mb-5">
            <div 
              className="px-4 py-2.5 rounded-2xl bg-[#D7B7EE] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-purple-300"
              style={{ transform: 'rotate(-0.9deg)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-stone-800 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
                <span className="font-extrabold text-stone-950">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-950/15 text-stone-900 text-xs font-mono font-black flex items-center justify-center">
                  {doneTasks.length}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Stack */}
          <div className="w-full space-y-4">
            {doneTasks.map((task, idx) => {
              const angles = [-1.5, 1.4, -1.1, 1.8];
              const angle = angles[idx % angles.length];
              const palette = ['#C6DF9C', '#F1A6A6', '#F8D979', '#D7B7EE'];
              const bg = task.paperColor || palette[idx % palette.length];

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-4 pt-5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:z-20 select-none shadow-[0_8px_18px_-4px_rgba(45,30,15,0.15)] opacity-95 hover:opacity-100 paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={26} color="purple" />
                  </div>

                  <div className="flex items-start gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTaskStatus(task.id, 'todo');
                      }}
                      className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition text-[10px] font-black"
                      title="Click to reopen task"
                    >
                      ✓
                    </button>
                    <h3 className="text-sm sm:text-base font-bold font-sans text-stone-950 leading-snug break-words flex-1">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px] font-semibold text-stone-700">
                    <span className="flex items-center gap-1 text-stone-600">
                      <span>✓</span>
                      <span>Done • {idx === 0 ? '5h ago' : '1d ago'}</span>
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
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {doneTasks.length === 0 && (
              <div className="w-full max-w-[280px] mx-auto py-8 text-center rounded-2xl border-2 border-dashed border-purple-400/50 text-stone-600">
                <span className="text-2xl block mb-1">🎉</span>
                <span className="text-xs font-bold">Completed notes will pin here</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* =======================================================================
          BOTTOM WOODEN DESK DASHBOARD CARDS (Matching Image 1 Reference)
          1. Productivity Overview (78% Completion Rate + Glowing Sparkline Curve)
          2. Your Network (Constellation Graph + View Graph Link)
          3. Focus Streak (12 Days + 3D Golden Trophy)
          ======================================================================= */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        
        {/* Card 1: Productivity Overview */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Productivity Overview</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-lg cursor-pointer">
              <span>This Week</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">78%</span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                <span>↑</span>
                <span>12%</span>
              </span>
            </div>
            <span className="text-[10px] text-white/60 block">Completion Rate</span>
          </div>

          {/* Smooth Green Glowing Sparkline SVG */}
          <div className="w-full h-12 pt-1">
            <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
              <path
                d="M 5 30 Q 30 15 60 25 T 110 18 T 150 12 T 195 8"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
              <circle cx="195" cy="8" r="3.5" fill="#34d399" className="drop-shadow-[0_0_6px_#34d399]" />
            </svg>
          </div>
        </div>

        {/* Card 2: Your Network */}
        <div 
          onClick={onNavigateToNetwork}
          className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex flex-col justify-between cursor-pointer hover:bg-black/55 transition group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Your Network</span>
            </div>
            <span className="text-[10px] font-bold text-white/60 group-hover:text-white flex items-center gap-0.5 transition">
              <span>View Graph</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Constellation Mini Visualization matching Image 1 */}
          <div className="w-full h-20 flex items-center justify-center relative">
            <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Connecting Edges */}
              <line x1="80" y1="40" x2="35" y2="25" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="80" y1="40" x2="55" y2="65" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="80" y1="40" x2="115" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="80" y1="40" x2="135" y2="55" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="80" y1="40" x2="80" y2="70" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

              {/* Orbiting Satellite Nodes */}
              <circle cx="35" cy="25" r="4.5" fill="#38bdf8" />
              <circle cx="55" cy="65" r="4" fill="#f43f5e" />
              <circle cx="115" cy="20" r="4.5" fill="#34d399" />
              <circle cx="135" cy="55" r="5" fill="#fbbf24" />
              <circle cx="80" cy="70" r="3.5" fill="#a855f7" />

              {/* Center "You" Star Node with Purple Luminous Halo */}
              <circle cx="80" cy="40" r="9" fill="#8b5cf6" className="drop-shadow-[0_0_10px_#a855f7]" />
              <text x="80" y="43" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">✦</text>
            </svg>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/50 tracking-wider">
              You
            </span>
          </div>
        </div>

        {/* Card 3: Focus Streak with 3D Golden Trophy */}
        <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex items-center justify-between">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Focus Streak</span>
            </div>
            
            <div className="text-2xl font-black text-white font-mono leading-none mb-1">
              12 Days
            </div>
            <span className="text-[10px] text-white/60 block mb-2">Keep going!</span>

            {/* Gold Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full w-3/4" />
            </div>
          </div>

          {/* 3D Shiny Golden Trophy matching Image 1 */}
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md pointer-events-none" />
            <span className="text-4xl filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)]">
              🏆
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

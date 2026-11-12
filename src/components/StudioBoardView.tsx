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
  ChevronDown,
  LayoutGrid,
  Square,
  Monitor,
  Landmark
} from 'lucide-react';
import { Task, Project } from '../types';
import { RedPushPin } from './RedPushPin';
import { checkDueDate } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface StudioBoardViewProps {
  executiveWall?: boolean;
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
  onToggleStandupWall?: () => void;
}

/**
 * StudioBoardView
 * The responsive 3-Column Sticky Note Kanban Wall:
 * - Executive notes scroll together inside a bounded corkboard viewport.
 * - Density Control: Toggle between "Normal" (Image 1) and "Compact Memos" (Image 2)
 * - Pinned to the warm stucco wall above the wooden desk
 */
export const StudioBoardView: React.FC<StudioBoardViewProps> = ({
  executiveWall = false,
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
  onToggleStandupWall,
}) => {
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

  // Density Mode: 'normal' (Image 1) vs 'compact' (Image 2 mini-memos)
  const [density, setDensity] = useState<'normal' | 'compact' | 'full'>(() => {
    const saved = localStorage.getItem('omnisticky_board_density');
    return saved === 'compact' || saved === 'full' ? saved : 'normal';
  });
  // The executive review always uses detailed cards; desk view keeps its own density choice.
  const noteDensity = executiveWall ? 'full' : density;

  const handleToggleDensity = (mode: 'normal' | 'compact' | 'full') => {
    setDensity(mode);
    localStorage.setItem('omnisticky_board_density', mode);
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const networkPreviewTasks = tasks.slice(0, 6);
  const networkPreviewPoints = [
    { x: 20, y: 20 }, { x: 43, y: 66 }, { x: 63, y: 12 },
    { x: 111, y: 13 }, { x: 140, y: 38 }, { x: 103, y: 67 },
  ];

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
    <div className={`w-full flex flex-col justify-start gap-3 max-w-5xl mx-auto select-none ${executiveWall ? 'executive-board-view' : ''}`}>
      
      {/* Top Workspace Bar: Corporate Digital Twin View Switcher + Note Size */}
      <div className="flex items-center justify-between px-2 gap-3 flex-wrap">
        
        {/* Left: Dual Corporate Perspective Switcher (Desk Workspace vs. Executive Standup Wall) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/25 dark:bg-black/40 backdrop-blur-md border border-white/15 text-xs font-bold shadow-xs">
          {executiveWall ? (
            <>
              <button
                type="button"
                onClick={onToggleStandupWall}
                className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 font-black shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 transition"
                title="Return to Desk Workspace"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>← Back to Desk Workspace</span>
              </button>
              <span className="px-2 text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-700" /> Executive Standup Wall
              </span>
              <span className="rounded-full bg-amber-300/80 px-2 py-1 text-[10px] font-black text-amber-950">{tasks.length} Deliverables</span>
            </>
          ) : (
            <>
          <button
            type="button"
            className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 font-black shadow-xs flex items-center gap-1.5 cursor-default"
            title="Desk Workspace (Active Daily Workstation)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desk Workspace</span>
          </button>

          {onToggleStandupWall && (
            <button
              type="button"
              onClick={onToggleStandupWall}
              className="px-3 py-1 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="Step back to review team sprint on the 3D Executive Standup Wall"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Executive Standup Wall ↗</span>
            </button>
          )}
            </>
          )}
        </div>

        {/* Corporate review locks full-size cards; the desk retains its density control. */}
        <div className="flex items-center gap-1 bg-black/25 dark:bg-black/40 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/15 text-xs text-stone-800 dark:text-stone-200 shadow-xs">
          {executiveWall ? (
            <span className="px-2 py-1 font-bold text-stone-800 dark:text-stone-100">Full-size task cards</span>
          ) : (
            <>
          <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 mr-1 hidden sm:inline">Note Size:</span>
          <button
            type="button"
            onClick={() => handleToggleDensity('normal')}
            className={`px-2.5 py-0.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              density === 'normal' 
                ? 'bg-amber-400 text-stone-950 shadow-xs' 
                : 'text-stone-700 dark:text-white/70 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Square className="w-3 h-3" />
            <span>Normal</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleDensity('full')}
            className={`px-2.5 py-0.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              density === 'full'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'text-stone-700 dark:text-white/70 hover:text-stone-950 dark:hover:text-white'
            }`}
            title="Show full task details on desk cards"
          >
            <Square className="w-3 h-3" />
            <span>Full card</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleDensity('compact')}
            className={`px-2.5 py-0.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              density === 'compact' 
                ? 'bg-amber-400 text-stone-950 shadow-xs' 
                : 'text-stone-700 dark:text-white/70 hover:text-stone-950 dark:hover:text-white'
            }`}
            title="Shorten note size to fit more tasks at once (Image 2)"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Compact</span>
          </button>
            </>
          )}
        </div>

      </div>

      {/* Executive notes scroll as one board; the surrounding page stays in normal flow. */}
      <div
        className={`${executiveWall ? 'executive-corkboard executive-board-scroll items-stretch ' : 'items-start '}w-full grid grid-cols-1 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-5 lg:gap-6`}
        role={executiveWall ? 'region' : undefined}
        aria-label={executiveWall ? 'Executive standup corkboard, scroll to see all notes' : undefined}
        tabIndex={executiveWall ? 0 : undefined}
      >
        
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
          <div className="w-full max-w-[280px] mb-3">
            <div 
              className="px-4 py-2 rounded-2xl bg-[#F8D979] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-amber-300"
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

          {/* Desk keeps its compact viewport; the corporate board shows every note in page flow. */}
          <div className={`${executiveWall ? 'w-full px-1 py-1 space-y-4' : 'w-full max-h-[350px] xl:max-h-[390px] 2xl:max-h-[440px] overflow-y-auto column-scrollbar px-1 py-1'} ${
            noteDensity === 'compact' ? 'grid grid-cols-2 gap-2' : 'space-y-3'
          }`}>
            {todoTasks.map((task, idx) => {
              const angles = [-1.4, 1.2, -1.8, 1.6, -0.8];
              const angle = angles[idx % angles.length];
              const palette = ['#F8D979', '#F1A6A6', '#D7B7EE', '#A9C9E9'];
              const bg = task.paperColor || palette[idx % palette.length];
              const dueInfo = checkDueDate(task.dueDate);
              const tagPill = task.tags[0] || (idx === 0 ? 'Research' : idx === 1 ? 'Study' : 'Project');

              if (noteDensity === 'compact') {
                // Compact square memo note matching Image 2
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative p-2.5 pt-3.5 rounded-xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 hover:z-20 select-none shadow-md paper-edge flex flex-col justify-between min-h-[90px]"
                    style={{
                      backgroundColor: bg,
                      color: '#1c1917',
                      transform: `rotate(${angle * 0.7}deg)`,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <RedPushPin size={18} color="red" />
                    </div>

                    <h4 className="text-xs font-bold leading-tight font-sans text-stone-950 line-clamp-3">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-[9px] font-bold text-stone-700/80 pt-1 mt-auto">
                      <span>{dueInfo.label || 'Todo'}</span>
                      <span className="truncate max-w-[60px] opacity-75">{tagPill}</span>
                    </div>
                  </div>
                );
              }

              // Normal Comfortable Mode matching Image 1
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-3.5 pt-4.5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:z-20 select-none shadow-[0_8px_18px_-4px_rgba(45,30,15,0.18),0_2px_5px_rgba(0,0,0,0.08)] paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={24} color={idx % 2 === 0 ? 'red' : 'blue'} />
                  </div>

                  <div className="flex items-start gap-2.5 mb-2">
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
                    <h3 className={`${noteDensity === 'full' ? 'font-handwriting text-[1.45rem] sm:text-[1.7rem] font-bold' : 'text-xs sm:text-sm font-bold font-sans'} text-stone-950 leading-snug break-words flex-1`}>
                      {task.title}
                    </h3>
                  </div>

                  {noteDensity === 'full' && task.notes?.trim() && (
                    <p className="font-handwriting text-lg sm:text-xl leading-snug text-stone-800/90 whitespace-pre-wrap break-words mb-3">
                      {task.notes}
                    </p>
                  )}
                  {noteDensity === 'full' && (task.checklists?.length ?? 0) > 0 && (
                    <ul className="mb-3 space-y-1 border-t border-stone-900/10 pt-2 text-sm text-stone-800">
                      {task.checklists?.map(item => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span aria-hidden="true" className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.completed ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-600'}`}>{item.completed ? '✓' : ''}</span>
                          <span className={item.completed ? 'line-through opacity-65' : ''}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold text-stone-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-600" />
                      <span>{dueInfo.label || 'Fri, Nov 7'}</span>
                    </div>

                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs"
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
                className="w-full max-w-[280px] mx-auto py-6 text-center rounded-2xl border-2 border-dashed border-amber-400/50 text-stone-600 hover:border-amber-500 cursor-pointer transition"
              >
                <span className="text-xl block mb-1">📝</span>
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
          <div className="w-full max-w-[280px] mb-3">
            <div 
              className="px-4 py-2 rounded-2xl bg-[#C6DF9C] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-emerald-300"
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

          <div className={`${executiveWall ? 'w-full px-1 py-1 space-y-4' : 'w-full max-h-[350px] xl:max-h-[390px] 2xl:max-h-[440px] overflow-y-auto column-scrollbar px-1 py-1'} ${
            noteDensity === 'compact' ? 'grid grid-cols-2 gap-2' : 'space-y-3'
          }`}>
            {inProgressTasks.map((task, idx) => {
              const angles = [1.2, -1.5, 1.8, -1.1];
              const angle = angles[idx % angles.length];
              const palette = ['#C6DF9C', '#A9C9E9', '#F8D979'];
              const bg = task.paperColor || palette[idx % palette.length];
              const dueInfo = checkDueDate(task.dueDate);
              const tagPill = task.tags[0] || (idx === 0 ? 'Personal' : 'Research');

              if (noteDensity === 'compact') {
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative p-2.5 pt-3.5 rounded-xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 hover:z-20 select-none shadow-md paper-edge flex flex-col justify-between min-h-[90px]"
                    style={{
                      backgroundColor: bg,
                      color: '#1c1917',
                      transform: `rotate(${angle * 0.7}deg)`,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <RedPushPin size={18} color="green" />
                    </div>

                    <h4 className="text-xs font-bold leading-tight font-sans text-stone-950 line-clamp-3">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-[9px] font-bold text-stone-700/80 pt-1 mt-auto">
                      <span>{dueInfo.label || 'Active'}</span>
                      <span className="truncate max-w-[60px] opacity-75">{tagPill}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-3.5 pt-4.5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:z-20 select-none shadow-[0_8px_18px_-4px_rgba(45,30,15,0.18),0_2px_5px_rgba(0,0,0,0.08)] paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={24} color={idx % 2 === 0 ? 'green' : 'cyan'} />
                  </div>

                  <div className="flex items-start gap-2.5 mb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTaskStatus(task.id, 'done');
                        if (audioEnabled) playCompletionSound();
                      }}
                      className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition text-[9px] font-black"
                      title="Mark task done"
                    >
                      ✓
                    </button>
                    <h3 className={`${noteDensity === 'full' ? 'font-handwriting text-[1.45rem] sm:text-[1.7rem] font-bold' : 'text-xs sm:text-sm font-bold font-sans'} text-stone-950 leading-snug break-words flex-1`}>
                      {task.title}
                    </h3>
                  </div>

                  {noteDensity === 'full' && task.notes?.trim() && (
                    <p className="font-handwriting text-lg sm:text-xl leading-snug text-stone-800/90 whitespace-pre-wrap break-words mb-3">
                      {task.notes}
                    </p>
                  )}
                  {noteDensity === 'full' && (task.checklists?.length ?? 0) > 0 && (
                    <ul className="mb-3 space-y-1 border-t border-stone-900/10 pt-2 text-sm text-stone-800">
                      {task.checklists?.map(item => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span aria-hidden="true" className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.completed ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-600'}`}>{item.completed ? '✓' : ''}</span>
                          <span className={item.completed ? 'line-through opacity-65' : ''}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold text-stone-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-600" />
                      <span>{dueInfo.label || 'Today'}</span>
                    </div>

                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs"
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
              <div className="w-full max-w-[280px] mx-auto py-6 text-center rounded-2xl border-2 border-dashed border-emerald-400/50 text-stone-600">
                <span className="text-xl block mb-1">⏳</span>
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
          {/* Header Pill matching Image 1: Purple pill ✓ Done 4 */}
          <div className="w-full max-w-[280px] mb-3">
            <div 
              className="px-4 py-2 rounded-2xl bg-[#D7B7EE] text-stone-900 shadow-md flex items-center justify-between font-bold text-sm tracking-tight border border-purple-300"
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

          <div className={`${executiveWall ? 'w-full px-1 py-1 space-y-4' : 'w-full max-h-[350px] xl:max-h-[390px] 2xl:max-h-[440px] overflow-y-auto column-scrollbar px-1 py-1'} ${
            noteDensity === 'compact' ? 'grid grid-cols-2 gap-2' : 'space-y-3'
          }`}>
            {doneTasks.map((task, idx) => {
              const angles = [-1.5, 1.4, -1.1, 1.8];
              const angle = angles[idx % angles.length];
              const palette = ['#C6DF9C', '#F1A6A6', '#F8D979', '#D7B7EE'];
              const bg = task.paperColor || palette[idx % palette.length];

              if (noteDensity === 'compact') {
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative p-2.5 pt-3.5 rounded-xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 hover:z-20 select-none shadow-md paper-edge flex flex-col justify-between min-h-[90px] opacity-90"
                    style={{
                      backgroundColor: bg,
                      color: '#1c1917',
                      transform: `rotate(${angle * 0.7}deg)`,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <RedPushPin size={18} color="purple" />
                    </div>

                    <h4 className="text-xs font-bold leading-tight font-sans text-stone-950 line-clamp-3 line-through opacity-70">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-[9px] font-bold text-stone-700/80 pt-1 mt-auto">
                      <span>✓ Done</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-600 hover:bg-rose-100 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-full max-w-[280px] mx-auto p-3.5 pt-4.5 rounded-2xl border border-black/10 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:z-20 select-none shadow-[0_8px_18px_-4px_rgba(45,30,15,0.15)] opacity-95 hover:opacity-100 paper-edge"
                  style={{
                    backgroundColor: bg,
                    color: '#1c1917',
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <RedPushPin size={24} color="purple" />
                  </div>

                  <div className="flex items-start gap-2.5 mb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTaskStatus(task.id, 'todo');
                      }}
                      className="w-4 h-4 mt-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 transition text-[9px] font-black"
                      title="Click to reopen task"
                    >
                      ✓
                    </button>
                    <h3 className={`${noteDensity === 'full' ? 'font-handwriting text-[1.45rem] sm:text-[1.7rem] font-bold' : 'text-xs sm:text-sm font-bold font-sans'} text-stone-950 leading-snug break-words flex-1 line-through opacity-75`}>
                      {task.title}
                    </h3>
                  </div>

                  {noteDensity === 'full' && task.notes?.trim() && (
                    <p className="font-handwriting text-lg sm:text-xl leading-snug text-stone-800/90 whitespace-pre-wrap break-words mb-3 line-through opacity-70">
                      {task.notes}
                    </p>
                  )}
                  {noteDensity === 'full' && (task.checklists?.length ?? 0) > 0 && (
                    <ul className="mb-3 space-y-1 border-t border-stone-900/10 pt-2 text-sm text-stone-800">
                      {task.checklists?.map(item => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span aria-hidden="true" className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.completed ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-600'}`}>{item.completed ? '✓' : ''}</span>
                          <span className={item.completed ? 'line-through opacity-65' : ''}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] font-semibold text-stone-700">
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
              <div className="w-full max-w-[280px] mx-auto py-6 text-center rounded-2xl border-2 border-dashed border-purple-400/50 text-stone-600">
                <span className="text-xl block mb-1">🎉</span>
                <span className="text-xs font-bold">Completed notes will pin here</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* =======================================================================
          BOTTOM WOODEN DESK DASHBOARD CARDS (Directly resting on Desk above fold)
          1. Productivity Overview
          2. Your Network
          3. Focus Streak
          ======================================================================= */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* Card 1: Productivity Overview */}
        <div className="p-3.5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Productivity Overview</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-lg cursor-pointer">
              <span>This Week</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-mono">78%</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <span>↑</span>
                <span>12%</span>
              </span>
            </div>
            <span className="text-[9px] text-white/60 block">Completion Rate</span>
          </div>

          <div className="w-full h-9 pt-0.5">
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
          className="p-3.5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white flex flex-col justify-between cursor-pointer hover:bg-black/55 transition group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Your Network</span>
            </div>
            <span className="text-[9px] font-bold text-white/60 group-hover:text-white flex items-center gap-0.5 transition">
              <span>View Graph</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="w-full h-16 flex items-center justify-center relative" aria-label={`Network preview: ${tasks.length} tasks and ${projects.length} projects`}>
            {networkPreviewTasks.length > 0 ? (
              <svg viewBox="0 0 160 80" role="img" aria-label="Connected task preview" className="w-full h-full">
                {networkPreviewTasks.map((task, index) => {
                  const point = networkPreviewPoints[index];
                  return <line key={`edge-${task.id}`} x1="80" y1="40" x2={point.x} y2={point.y} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />;
                })}
                {networkPreviewTasks.map((task, index) => {
                  const point = networkPreviewPoints[index];
                  const color = task.status === 'done' ? '#34d399' : task.status === 'in_progress' ? '#38bdf8' : '#fbbf24';
                  return <circle key={task.id} cx={point.x} cy={point.y} r="4" fill={color} />;
                })}
                <circle cx="80" cy="40" r="8" fill="#8b5cf6" />
                <text x="80" y="42.5" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold">✦</text>
              </svg>
            ) : (
              <p className="text-[10px] text-white/55">Add tasks to build your network</p>
            )}
            {networkPreviewTasks.length > 0 && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/50 tracking-wider">You</span>
            )}
          </div>
        </div>

        {/* Card 3: Focus Streak with 3D Golden Trophy */}
        <div className="p-3.5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white flex items-center justify-between">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-extrabold text-xs tracking-tight text-white/90">Focus Streak</span>
            </div>
            
            <div className="text-xl font-black text-white font-mono leading-none mb-1">
              12 Days
            </div>
            <span className="text-[9px] text-white/60 block mb-1.5">Keep going!</span>

            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full w-3/4" />
            </div>
          </div>

          <div className="w-14 h-14 shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md pointer-events-none" />
            <span className="text-3xl filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)]">
              🏆
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

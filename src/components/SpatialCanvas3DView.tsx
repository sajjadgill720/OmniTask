import React, { useState } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft,
  Plus,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface SpatialCanvas3DViewProps {
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
  onBack?: () => void;
}

// Subtle organic rotations for hand-placed post-it notes
const ROTATIONS = [-1.5, 1.2, -0.8, 1.8, -1.0, 0.7, -1.9, 1.4, -0.5, 1.6];

export const SpatialCanvas3DView: React.FC<SpatialCanvas3DViewProps> = ({
  title,
  subtitle,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  audioEnabled,
  onQuickAdd,
  onMoveTaskStatus,
  onBack,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  // Filter tasks into the three agile standup columns
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const workTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Handle task drop onto glass column
  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onMoveTaskStatus) {
      onMoveTaskStatus(taskId, status);
      if (audioEnabled) playCompletionSound();
    }
  };

  // Direct toggle completion from note on glass
  const handleQuickComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onToggleComplete(task.id);
    if (audioEnabled) playCompletionSound();
    if (task.status !== 'done') {
      confetti({
        particleCount: 25,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#FDE047', '#E89E38', '#10B981'],
      });
    }
  };

  // Helper to render an authentic square canary yellow sticky note
  const renderStickyNote = (task: Task, index: number) => {
    const isDone = task.status === 'done';
    const rotation = ROTATIONS[index % ROTATIONS.length];
    const project = projects.find(p => p.id === task.projectId);
    const completedChecklists = task.checklists?.filter(c => c.completed).length || 0;
    const totalChecklists = task.checklists?.length || 0;

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectTask(task);
        }}
        title="Click note to open full details"
        style={{
          transform: `rotate(${rotation}deg)`,
          backgroundColor: '#FFF275',
          backgroundImage: 'linear-gradient(135deg, #FFF98A 0%, #FEE565 65%, #F7D44C 100%)',
          boxShadow: '2px 4px 12px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12)',
        }}
        className={`group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 sm:p-3.5 rounded-xs select-none cursor-pointer flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:z-20 ${
          isDone ? 'opacity-90' : 'opacity-100'
        }`}
      >
        {/* Top Sticky Adhesive Crease & Quick Complete Checkbox */}
        <div className="flex items-center justify-between pb-1 relative z-10">
          <button
            type="button"
            onClick={(e) => handleQuickComplete(e, task)}
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition cursor-pointer ${
              isDone 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs' 
                : 'border-stone-800/40 hover:border-stone-900 bg-white/40 hover:bg-white/70'
            }`}
            title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
          >
            {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </button>

          {/* Details Expand Pill on Hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-mono text-stone-700 font-bold bg-white/60 px-1.5 py-0.5 rounded-xs backdrop-blur-xs">
            <span>Detail</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Task Note Title in Authentic Marker Handwriting */}
        <div className="my-auto px-0.5">
          <p className="font-handwriting font-bold text-stone-900 text-base sm:text-lg leading-tight line-clamp-3 select-none tracking-wide">
            {task.title}
          </p>

          {/* Optional Short Subtitle / Preview */}
          {task.notes && (
            <p className="font-handwriting text-xs text-stone-800/80 line-clamp-1 mt-1 leading-snug">
              {task.notes}
            </p>
          )}
        </div>

        {/* Diagonal Red Rubber Stamp if Completed */}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
            <span className="border-2 border-red-600/90 text-red-600 font-black text-xs sm:text-sm tracking-widest uppercase px-2 py-0.5 rounded-xs -rotate-12 bg-red-500/10 backdrop-blur-[0.5px] shadow-xs">
              DONE
            </span>
          </div>
        )}

        {/* Footer Meta: Project Pill, Checklist Counter, Due Date */}
        <div className="pt-1 flex items-center justify-between text-[10px] font-medium text-stone-800/80 border-t border-stone-800/10 relative z-10">
          <div className="flex items-center gap-1 truncate max-w-[90px]">
            {project ? (
              <span className="truncate font-sans font-bold text-[9px] text-stone-800 bg-black/10 px-1 py-0.2 rounded-xs">
                {project.title}
              </span>
            ) : task.tags && task.tags.length > 0 ? (
              <span className="truncate font-mono text-[9px] text-stone-800">
                #{task.tags[0]}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            {totalChecklists > 0 && (
              <span className="font-mono text-[9px] font-bold text-stone-800 bg-black/10 px-1 py-0.2 rounded-xs">
                {completedChecklists}/{totalChecklists}✓
              </span>
            )}
            {task.isTimerRunning && (
              <Clock className="w-3 h-3 text-blue-700 animate-spin-slow" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-2 sm:px-4 py-3 select-none font-sans">
      
      {/* Top Standup Wall Bar: Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-black/10 dark:border-white/10 gap-3">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400 hover:text-amber-400 transition mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Return to Desk Workspace</span>
            </button>
          )}

          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🏛️</span>
            <h2 className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100 drop-shadow-xs">
              {title}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#F8D979] text-[#25231F] text-xs font-bold font-mono">
              {tasks.length} Deliverables
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Viewport Zoom Suite */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-black/60 dark:bg-black/75 rounded-xl border border-white/15 text-xs font-bold text-white shadow-md">
            <button
              onClick={() => setZoom(z => Math.max(0.65, z - 0.1))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-1.5 text-amber-300 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.25, z + 0.1))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer ml-0.5"
              title="Reset Zoom to 100%"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 
        AUTHENTIC CORPORATE BOARDROOM GLASS PARTITION (Matching Reference Photo)
        - Heavy architectural black steel frame
        - Ambient sunny daylight office backdrop visible through transparent glass
        - 3 Black square sticky notes with white chalk/marker headings: "TO DO", "Work" (with Sprint 1 tape), "DONE"
        - Canary yellow square sticky notes neatly arranged on glass
        - Bottom aluminum ledge with white dry-erase whiteboard marker
      */}
      <div 
        className="relative w-full rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-[10px] sm:border-[14px] md:border-[18px] border-[#1C1917] bg-[#1E1B18]"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Sunny Office Room Behind the Glass (Hyperrealistic Depth of Field) */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(circle at 85% 15%, rgba(255, 248, 220, 0.45) 0%, rgba(255, 243, 196, 0.2) 35%, transparent 70%),
              linear-gradient(135deg, rgba(235, 228, 215, 0.88) 0%, rgba(215, 206, 192, 0.82) 40%, rgba(240, 235, 224, 0.88) 100%)
            `,
          }}
        >
          {/* Subtle Background Office Silhouettes (Computer monitor, bookshelf, desk warm blur) */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 350px 220px at 60% 65%, #8B7E74 0%, transparent 70%),
                radial-gradient(ellipse 260px 180px at 25% 55%, #7D7066 0%, transparent 70%),
                radial-gradient(circle 220px at 8% 80%, #4D6B53 0%, transparent 65%)
              `,
              filter: 'blur(35px)',
            }}
          />

          {/* Glass Specular Glare & Diagonal Reflection Line (Simulating Sun on Boardroom Window) */}
          <div 
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(125deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 30%, transparent 60%, rgba(255,255,255,0.08) 85%)',
            }}
          />
        </div>

        {/* Glass Surface Content Container */}
        <div 
          className="relative z-10 w-full min-h-[720px] p-4 sm:p-6 md:p-8 overflow-x-auto overflow-y-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Agile Standup 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start min-w-[700px]">
            
            {/* COLUMN 1: TO DO */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'todo')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'todo')}
              className={`flex flex-col items-center transition-all duration-200 rounded-2xl p-2 ${
                dragOverColumn === 'todo' ? 'bg-amber-400/15 ring-2 ring-amber-400/50' : ''
              }`}
            >
              {/* Header: Black Square Post-it "TO DO" */}
              <div 
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-xs p-3 flex flex-col justify-between items-center text-center select-none shadow-xl mb-6 relative transition-transform hover:scale-102"
                style={{
                  backgroundColor: '#1E1B18',
                  backgroundImage: 'linear-gradient(145deg, #25221F 0%, #161412 100%)',
                  boxShadow: '3px 6px 14px rgba(0,0,0,0.35)',
                  transform: 'rotate(-1deg)',
                }}
              >
                <div className="w-full flex justify-end">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-stone-300">
                    {todoTasks.length}
                  </span>
                </div>

                <h3 className="font-handwriting text-3xl font-black text-white tracking-widest">
                  TO DO
                </h3>

                <button
                  type="button"
                  onClick={() => onQuickAdd('todo')}
                  className="w-full py-1 text-[11px] font-sans font-bold text-amber-300/80 hover:text-amber-300 hover:bg-white/5 rounded-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Add note to TO DO"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add note</span>
                </button>
              </div>

              {/* Sticky Notes Grid on Glass */}
              <div className="w-full flex flex-wrap gap-4 sm:gap-5 justify-center items-start">
                {todoTasks.map((task, idx) => renderStickyNote(task, idx))}

                {/* Quick Add Placeholder Note */}
                <button
                  type="button"
                  onClick={() => onQuickAdd('todo')}
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-xs border-2 border-dashed border-stone-600/40 hover:border-amber-600/70 bg-white/10 hover:bg-amber-300/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-full bg-black/10 group-hover:bg-amber-400 group-hover:text-stone-950 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-handwriting text-base font-bold">New Post-it</span>
                </button>
              </div>
            </div>

            {/* COLUMN 2: WORK (In Progress) with SPRINT 1 TAPE */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'in_progress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'in_progress')}
              className={`flex flex-col items-center transition-all duration-200 rounded-2xl p-2 ${
                dragOverColumn === 'in_progress' ? 'bg-blue-400/15 ring-2 ring-blue-400/50' : ''
              }`}
            >
              {/* Header: Black Square Post-it "Work" with "Sprint 1" Tape */}
              <div 
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-xs p-3 flex flex-col justify-between items-center text-center select-none shadow-xl mb-6 relative transition-transform hover:scale-102"
                style={{
                  backgroundColor: '#1E1B18',
                  backgroundImage: 'linear-gradient(145deg, #25221F 0%, #161412 100%)',
                  boxShadow: '3px 6px 14px rgba(0,0,0,0.35)',
                  transform: 'rotate(0.5deg)',
                }}
              >
                {/* Authentic Yellow/Orange Masking Tape: "Sprint 1" from reference image */}
                <div 
                  className="absolute -top-3.5 -right-4 z-20 px-3.5 py-0.5 text-stone-950 font-handwriting text-sm font-black shadow-md rounded-xs border-y border-white/20 select-none pointer-events-none"
                  style={{
                    backgroundColor: '#E89E38',
                    transform: 'rotate(5deg)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  }}
                >
                  Sprint 1
                </div>

                <div className="w-full flex justify-end">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-stone-300">
                    {workTasks.length}
                  </span>
                </div>

                <h3 className="font-handwriting text-3xl font-black text-white tracking-wide">
                  Work
                </h3>

                <button
                  type="button"
                  onClick={() => onQuickAdd('in_progress')}
                  className="w-full py-1 text-[11px] font-sans font-bold text-amber-300/80 hover:text-amber-300 hover:bg-white/5 rounded-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Add note to Work"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add note</span>
                </button>
              </div>

              {/* Sticky Notes Grid on Glass */}
              <div className="w-full flex flex-wrap gap-4 sm:gap-5 justify-center items-start">
                {workTasks.map((task, idx) => renderStickyNote(task, idx))}

                {/* Quick Add Placeholder Note */}
                <button
                  type="button"
                  onClick={() => onQuickAdd('in_progress')}
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-xs border-2 border-dashed border-stone-600/40 hover:border-amber-600/70 bg-white/10 hover:bg-amber-300/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-full bg-black/10 group-hover:bg-amber-400 group-hover:text-stone-950 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-handwriting text-base font-bold">New Post-it</span>
                </button>
              </div>
            </div>

            {/* COLUMN 3: DONE */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'done')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'done')}
              className={`flex flex-col items-center transition-all duration-200 rounded-2xl p-2 ${
                dragOverColumn === 'done' ? 'bg-emerald-400/15 ring-2 ring-emerald-400/50' : ''
              }`}
            >
              {/* Header: Black Square Post-it "DONE" */}
              <div 
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-xs p-3 flex flex-col justify-between items-center text-center select-none shadow-xl mb-6 relative transition-transform hover:scale-102"
                style={{
                  backgroundColor: '#1E1B18',
                  backgroundImage: 'linear-gradient(145deg, #25221F 0%, #161412 100%)',
                  boxShadow: '3px 6px 14px rgba(0,0,0,0.35)',
                  transform: 'rotate(1deg)',
                }}
              >
                <div className="w-full flex justify-end">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-stone-300">
                    {doneTasks.length}
                  </span>
                </div>

                <h3 className="font-handwriting text-3xl font-black text-white tracking-widest">
                  DONE
                </h3>

                <button
                  type="button"
                  onClick={() => onQuickAdd('done')}
                  className="w-full py-1 text-[11px] font-sans font-bold text-amber-300/80 hover:text-amber-300 hover:bg-white/5 rounded-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Add note to DONE"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add note</span>
                </button>
              </div>

              {/* Sticky Notes Grid on Glass */}
              <div className="w-full flex flex-wrap gap-4 sm:gap-5 justify-center items-start">
                {doneTasks.map((task, idx) => renderStickyNote(task, idx))}

                {/* Quick Add Placeholder Note */}
                <button
                  type="button"
                  onClick={() => onQuickAdd('done')}
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-xs border-2 border-dashed border-stone-600/40 hover:border-amber-600/70 bg-white/10 hover:bg-amber-300/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-full bg-black/10 group-hover:bg-amber-400 group-hover:text-stone-950 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-handwriting text-base font-bold">New Post-it</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 
          BOTTOM ALUMINUM FRAME RAIL WITH WHITE DRY-ERASE MARKER (From Reference Image)
        */}
        <div className="w-full h-8 bg-gradient-to-b from-[#282420] via-[#1E1C1A] to-[#12100E] border-t border-white/10 flex items-center justify-center relative shadow-inner z-20">
          {/* White Dry-Erase Whiteboard Marker Resting on the Ledge */}
          <div 
            className="flex items-center shadow-md transition-transform hover:scale-105 cursor-pointer"
            title="White Dry-Erase Marker on Boardroom Ledge"
          >
            {/* Dark Cap */}
            <div className="w-5 h-3 bg-[#1E293B] rounded-l-xs border-r border-black/50 shadow-xs relative">
              <div className="absolute -left-1 top-0.5 bottom-0.5 w-1 bg-[#0F172A] rounded-l-xs" />
            </div>
            {/* White Marker Barrel */}
            <div className="w-24 sm:w-28 h-3.5 bg-gradient-to-b from-white via-stone-100 to-stone-300 rounded-r-xs flex items-center justify-between px-2 text-[7px] font-mono font-black text-stone-800 tracking-tighter shadow-xs border-y border-stone-300">
              <span className="opacity-80">DRY ERASE</span>
              <span className="opacity-50 text-[6px]">CHISEL</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Compass,
  CheckCircle2,
  Clock,
  CircleDot,
  ArrowLeft
} from 'lucide-react';
import { Task, Project, CanvasElement, CanvasConnection } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

interface SpatialCanvas3DViewProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  projects: Project[];
  elements?: CanvasElement[];
  onUpdateElements?: (elements: CanvasElement[]) => void;
  connections?: CanvasConnection[];
  onUpdateConnections?: (connections: CanvasConnection[]) => void;
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

// Fixed default Desk camera perspective
const DEFAULT_DESK_PITCH = 4; // degrees rotateX
const DEFAULT_DESK_YAW = 0;   // degrees rotateY
const DEFAULT_DESK_ZOOM = 0.95;

export const SpatialCanvas3DView: React.FC<SpatialCanvas3DViewProps> = ({
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
  onReorderTasks,
  onMoveTaskStatus,
  onBack,
}) => {
  const [pitch, setPitch] = useState(DEFAULT_DESK_PITCH); // Default Desk perspective: 4°
  const [yaw, setYaw] = useState(DEFAULT_DESK_YAW);       // Default Desk perspective: 0°
  const [zoom, setZoom] = useState(DEFAULT_DESK_ZOOM);   // Default Desk perspective: 95%
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [dragOverZone, setDragOverZone] = useState<Task['status'] | null>(null);

  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  // Status partitions for Pedestal mode
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Mouse drag to orbit 3D camera
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-card, button, input, textarea')) return;
    setIsOrbiting(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOrbiting || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYaw(prev => Math.min(50, Math.max(-50, prev + dx * 0.25)));
    setPitch(prev => Math.min(45, Math.max(-10, prev - dy * 0.25)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsOrbiting(false);
    lastMousePos.current = null;
  };

  // Reset camera back to default Desk perspective
  const resetCamera = () => {
    setPitch(DEFAULT_DESK_PITCH);
    setYaw(DEFAULT_DESK_YAW);
    setZoom(DEFAULT_DESK_ZOOM);
  };

  // Drag and drop onto 3D Pedestals
  const handleDragOverPedestal = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverZone !== status) setDragOverZone(status);
  };

  const handleDropOnPedestal = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverZone(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onMoveTaskStatus) {
      onMoveTaskStatus(taskId, status);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 select-none font-sans">
      
      {/* 3D Canvas Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10 gap-3">
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

        {/* 3D Controls Suite */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Zoom & Reset Suite */}
          <div className="flex items-center gap-1 p-1 bg-black/60 rounded-xl border border-white/15 text-xs font-bold text-white shadow-md">
            <button
              onClick={() => setZoom(z => Math.max(0.55, z - 0.1))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-1.5 text-amber-300 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.35, z + 0.1))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetCamera}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer ml-0.5"
              title="Reset View to Default Desk Angle"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 3D Spatial Viewport Stage */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full min-h-[720px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center p-6 ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          backgroundColor: '#1E1B18',
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.08) 0%, transparent 65%),
            linear-gradient(135deg, #181512 0%, #25211D 100%)
          `,
          perspective: '1800px',
          perspectiveOrigin: '50% 36%',
        }}
      >
        {/* Spatial Axis Indicator Overlay */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/15 text-[10px] font-mono text-white/70">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>Pitch: {Math.round(pitch)}° | Yaw: {Math.round(yaw)}° | Zoom: {Math.round(zoom * 100)}%</span>
        </div>

        {/* 3D Transformed World Plane */}
        <div
          className="canvas-3d-board w-full max-w-7xl transition-transform duration-75 ease-out relative"
          style={{
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3D STATUS PEDESTALS (Realistic Sticky Note Kanban Wall in 3D Space) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* PEDESTAL 1: TO DO */}
            <div
              onDragOver={(e) => handleDragOverPedestal(e, 'todo')}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={(e) => handleDropOnPedestal(e, 'todo')}
              className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                dragOverZone === 'todo'
                  ? 'bg-amber-500/20 border-amber-400 ring-4 ring-amber-400/30'
                  : 'bg-[#2B2723]/95 border-white/10'
              } backdrop-blur-md shadow-2xl`}
              style={{
                transform: 'translateZ(15px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold text-white">To Do</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold">
                    {todoTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-[660px] overflow-y-auto pr-1 column-scrollbar">
                {todoTasks.map((task, idx) => (
                  <div key={task.id} style={{ transform: `translateZ(${idx * 4}px)` }}>
                    <StickyNoteCard
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
                  </div>
                ))}
              </div>
            </div>

            {/* PEDESTAL 2: IN PROGRESS */}
            <div
              onDragOver={(e) => handleDragOverPedestal(e, 'in_progress')}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={(e) => handleDropOnPedestal(e, 'in_progress')}
              className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                dragOverZone === 'in_progress'
                  ? 'bg-blue-500/20 border-blue-400 ring-4 ring-blue-400/30'
                  : 'bg-[#2B2723]/95 border-white/10'
              } backdrop-blur-md shadow-2xl`}
              style={{
                transform: 'translateZ(25px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-extrabold text-white">In Progress</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-xs font-mono font-bold">
                    {doingTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-[660px] overflow-y-auto pr-1 column-scrollbar">
                {doingTasks.map((task, idx) => (
                  <div key={task.id} style={{ transform: `translateZ(${idx * 4}px)` }}>
                    <StickyNoteCard
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
                  </div>
                ))}
              </div>
            </div>

            {/* PEDESTAL 3: DONE */}
            <div
              onDragOver={(e) => handleDragOverPedestal(e, 'done')}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={(e) => handleDropOnPedestal(e, 'done')}
              className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                dragOverZone === 'done'
                  ? 'bg-emerald-500/20 border-emerald-400 ring-4 ring-emerald-400/30'
                  : 'bg-[#2B2723]/95 border-white/10'
              } backdrop-blur-md shadow-2xl`}
              style={{
                transform: 'translateZ(10px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">Completed</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-mono font-bold">
                    {doneTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-[660px] overflow-y-auto pr-1 column-scrollbar">
                {doneTasks.map((task, idx) => (
                  <div key={task.id} style={{ transform: `translateZ(${idx * 4}px)` }}>
                    <StickyNoteCard
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
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

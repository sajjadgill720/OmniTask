import React, { useState, useRef } from 'react';
import { 
  Box, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Sparkles, 
  Plus, 
  Eye, 
  Layers, 
  Compass,
  Pin,
  CheckCircle2,
  Clock,
  CircleDot,
  LayoutGrid
} from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

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
}

export type Preset3D = 'isometric' | 'gyro' | 'flat';
export type SpatialArrangement = 'pedestals' | 'layers';

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
  onQuickAdd,
  onReorderTasks,
  onMoveTaskStatus,
}) => {
  const [arrangement, setArrangement] = useState<SpatialArrangement>('pedestals');
  const [preset, setPreset] = useState<Preset3D>('isometric');
  const [pitch, setPitch] = useState(16); // degrees rotateX
  const [yaw, setYaw] = useState(-8);    // degrees rotateY
  const [zoom, setZoom] = useState(0.92);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [dragOverZone, setDragOverZone] = useState<Task['status'] | null>(null);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Status partitions for 3D Pedestals
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Mouse drag to orbit 3D camera
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background, not when clicking notes/buttons/inputs
    if ((e.target as HTMLElement).closest('.realistic-postit, button, input, .no-orbit')) return;
    setIsOrbiting(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOrbiting || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYaw(prev => Math.min(45, Math.max(-45, prev + dx * 0.3)));
    setPitch(prev => Math.min(40, Math.max(-10, prev - dy * 0.3)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsOrbiting(false);
    lastMousePos.current = null;
  };

  const setPresetAngle = (mode: Preset3D) => {
    setPreset(mode);
    if (mode === 'isometric') {
      setPitch(18);
      setYaw(-12);
      setZoom(0.92);
    } else if (mode === 'flat') {
      setPitch(0);
      setYaw(0);
      setZoom(1.0);
    } else {
      // Gyro
      setPitch(8);
      setYaw(-4);
      setZoom(0.96);
    }
  };

  const resetCamera = () => {
    setPresetAngle('isometric');
  };

  // Drag and drop onto 3D Pedestals to change status
  const handleDragOverPedestal = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverZone !== status) {
      setDragOverZone(status);
    }
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
    <div className="w-full px-4 sm:px-6 py-4 select-none">
      
      {/* 3D Canvas Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🪐</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {title} — 3D Spatial Canvas
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono">
              {tasks.length} Notes
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
            <span>{subtitle}</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Drag notes across 3D pedestals to change status • Click & drag space to orbit
            </span>
          </p>
        </div>

        {/* 3D Controls Suite */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Spatial Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setArrangement('pedestals')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                arrangement === 'pedestals'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Interactive 3D Status Pedestals (Manipulate Status Directly)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>3D Pedestals</span>
            </button>
            <button
              onClick={() => setArrangement('layers')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                arrangement === 'layers'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Z-Axis Elevation Depth Layers"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Z-Layers</span>
            </button>
          </div>

          {/* Perspective Preset Buttons */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setPresetAngle('isometric')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                preset === 'isometric'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Cinematic Isometric 3D Perspective"
            >
              <Eye className="w-3 h-3" />
              <span>Isometric</span>
            </button>

            <button
              onClick={() => setPresetAngle('flat')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                preset === 'flat'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Desk Top-Down Projection"
            >
              <span>Desk</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setZoom(z => Math.max(0.60, z - 0.1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-500">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetCamera}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Reset 3D Camera"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Post-it */}
          <button
            onClick={() => onQuickAdd()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Post-it</span>
          </button>
        </div>
      </div>

      {/* 3D Spatial Viewport Stage */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full min-h-[700px] rounded-3xl overflow-hidden clean-canvas-surface border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-6 ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1600px',
          perspectiveOrigin: '50% 32%',
        }}
      >
        {/* Spatial Axis Indicator Overlay */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 p-2 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-xl border border-black/5 dark:border-white/10 text-[10px] font-mono text-slate-500">
          <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>Pitch: {Math.round(pitch)}° | Yaw: {Math.round(yaw)}° | Scale: {Math.round(zoom * 100)}%</span>
        </div>

        {/* 3D Transformed World Plane */}
        <div
          className="canvas-3d-board w-full max-w-7xl transition-transform duration-75 ease-out"
          style={{
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >

          {/* MODE A: 3D STATUS PEDESTALS (DIRECT STATUS MANIPULATION) */}
          {arrangement === 'pedestals' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* PEDESTAL 1: BACKLOG / TO DO */}
              <div
                onDragOver={(e) => handleDragOverPedestal(e, 'todo')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnPedestal(e, 'todo')}
                className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                  dragOverZone === 'todo'
                    ? 'bg-blue-500/10 border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/10'
                } backdrop-blur-md shadow-xl`}
                style={{
                  transform: 'translateZ(15px)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {/* Pedestal Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                      Backlog & Ideation
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
                      {todoTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onQuickAdd('todo')}
                    className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                    title="Add to Backlog"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Pedestal Notes Stack */}
                <div className="flex flex-col gap-5 min-h-[320px]">
                  {todoTasks.map((task, idx) => (
                    <div 
                      key={task.id} 
                      className="transition-transform duration-200 hover:translate-z-8"
                      style={{ transform: `translateZ(${idx * 4}px)` }}
                    >
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
                  {todoTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 text-xs text-center">
                      <p>Drop tasks here to set status to Backlog</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PEDESTAL 2: IN PROGRESS / SPRINT */}
              <div
                onDragOver={(e) => handleDragOverPedestal(e, 'in_progress')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnPedestal(e, 'in_progress')}
                className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                  dragOverZone === 'in_progress'
                    ? 'bg-amber-500/10 border-amber-500 ring-4 ring-amber-500/20 scale-[1.02]'
                    : 'bg-white/40 dark:bg-slate-900/40 border-amber-300/40 dark:border-amber-700/30'
                } backdrop-blur-md shadow-xl`}
                style={{
                  transform: 'translateZ(30px)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {/* Pedestal Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                      In-Flight / Doing
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                      {doingTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onQuickAdd('in_progress')}
                    className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 transition cursor-pointer"
                    title="Add to In Progress"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Pedestal Notes Stack */}
                <div className="flex flex-col gap-5 min-h-[320px]">
                  {doingTasks.map((task, idx) => (
                    <div 
                      key={task.id} 
                      className="transition-transform duration-200 hover:translate-z-8"
                      style={{ transform: `translateZ(${idx * 4}px)` }}
                    >
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
                  {doingTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-200 dark:border-amber-800/40 rounded-2xl text-slate-400 text-xs text-center">
                      <p>Drag active work here to track in-flight progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PEDESTAL 3: DELIVERED / SHIPPED */}
              <div
                onDragOver={(e) => handleDragOverPedestal(e, 'done')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnPedestal(e, 'done')}
                className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                  dragOverZone === 'done'
                    ? 'bg-emerald-500/10 border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-white/40 dark:bg-slate-900/40 border-emerald-300/40 dark:border-emerald-700/30'
                } backdrop-blur-md shadow-xl`}
                style={{
                  transform: 'translateZ(15px)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {/* Pedestal Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                      Delivered / Shipped
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                      {doneTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onQuickAdd('done')}
                    className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                    title="Add Completed Note"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Pedestal Notes Stack */}
                <div className="flex flex-col gap-5 min-h-[320px]">
                  {doneTasks.map((task, idx) => (
                    <div 
                      key={task.id} 
                      className="transition-transform duration-200 hover:translate-z-8 opacity-80 hover:opacity-100"
                      style={{ transform: `translateZ(${idx * 4}px)` }}
                    >
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
                  {doneTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-slate-400 text-xs text-center">
                      <p>Drop completed notes here to celebrate completion 🎉</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* MODE B: Z-AXIS DEPTH LAYERS */
            <div>
              {/* Pinned Notes: Floating High in Z-space */}
              {pinnedTasks.length > 0 && (
                <div className="mb-10" style={{ transform: 'translateZ(45px)', transformStyle: 'preserve-3d' }}>
                  <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-xl w-fit backdrop-blur-md shadow-lg border border-amber-300/40 dark:border-amber-700/40">
                    <Pin className="w-3.5 h-3.5 fill-amber-500" />
                    <span>📌 Pinned Priority Layer (+45px Z-Space)</span>
                  </div>
                  <div className="flex flex-wrap gap-6 items-start">
                    {pinnedTasks.map((task, idx) => (
                      <div key={task.id} className="transition-transform duration-200 hover:translate-z-8">
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
              )}

              {/* Standard Notes: Base Plane */}
              {otherTasks.length > 0 && (
                <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
                  {pinnedTasks.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-xl w-fit backdrop-blur-md shadow-md border border-slate-200/60 dark:border-white/10">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Standard Canvas Plane (+10px Z-Space)</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-6 items-start">
                    {otherTasks.map((task, idx) => (
                      <div key={task.id} className="transition-transform duration-200 hover:translate-z-8">
                        <StickyNoteCard
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="text-center py-24 text-slate-400">
                  <span className="text-4xl block mb-2">🪐</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">3D Spatial Canvas is Empty</p>
                  <p className="text-xs text-slate-400 mt-1">Peel a new sticky note to see it materialize in 3D space.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

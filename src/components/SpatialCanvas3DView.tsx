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
  Pin
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
  onQuickAdd: () => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
}

export type Preset3D = 'isometric' | 'gyro' | 'flat';

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
}) => {
  const [preset, setPreset] = useState<Preset3D>('isometric');
  const [pitch, setPitch] = useState(16); // degrees rotateX
  const [yaw, setYaw] = useState(-8);    // degrees rotateY
  const [zoom, setZoom] = useState(0.95);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Mouse drag to orbit 3D camera
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background, not when clicking notes/buttons
    if ((e.target as HTMLElement).closest('.realistic-postit, button, input')) return;
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
      setZoom(0.94);
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
              Click & drag background to orbit 3D space • Pinned notes float on Z-axis
            </span>
          </p>
        </div>

        {/* 3D Camera Controls & New Post-it */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Preset Buttons */}
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
              onClick={() => setZoom(z => Math.max(0.65, z - 0.1))}
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
            onClick={onQuickAdd}
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
        className={`relative w-full min-h-[640px] rounded-3xl overflow-hidden clean-canvas-surface border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-6 ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 35%',
        }}
      >
        {/* Spatial Axis Indicator Overlay */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 p-2 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-xl border border-black/5 dark:border-white/10 text-[10px] font-mono text-slate-500">
          <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>Pitch: {Math.round(pitch)}° | Yaw: {Math.round(yaw)}°</span>
        </div>

        {/* 3D Transformed Plane */}
        <div
          className="canvas-3d-board w-full max-w-6xl transition-transform duration-75 ease-out"
          style={{
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Pinned Notes: Floating High in Z-space */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
              <div className="flex items-center gap-1.5 mb-5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-xl w-fit backdrop-blur-md shadow-lg border border-amber-300/40 dark:border-amber-700/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Elevate Layer (+40px Z-Space)</span>
              </div>
              <div className="flex flex-wrap gap-6 items-start">
                {pinnedTasks.map((task, idx) => (
                  <div key={task.id} className="transition-transform duration-200 hover:translate-z-6">
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

          {/* Standard Notes: Medium Plane */}
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
                  <div key={task.id} className="transition-transform duration-200 hover:translate-z-6">
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
      </div>

    </div>
  );
};

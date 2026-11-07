import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Sliders, 
  Pin, 
  Sparkles, 
  RotateCw, 
  Layers, 
  Compass,
  CheckCircle2,
  Clock,
  CircleDot
} from 'lucide-react';
import { Task, Project, WallTexture } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

interface CanvasViewProps {
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
  debugMode?: boolean;
}

const WALL_TEXTURES: { id: WallTexture; label: string; icon: string }[] = [
  { id: 'cork', label: 'Corkboard', icon: '🪵' },
  { id: 'plaster', label: 'Plaster Wall', icon: '🧱' },
  { id: 'pegboard', label: 'Matte Pegboard', icon: '🕳️' },
];

export const CanvasView: React.FC<CanvasViewProps> = ({
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
  debugMode = false,
}) => {
  // Tactile Wall Texture State persisted in localStorage
  const [wallTexture, setWallTexture] = useState<WallTexture>(() => {
    return (localStorage.getItem('omnisticky_wall_texture') as WallTexture) || 'cork';
  });

  const handleSelectWallTexture = (texture: WallTexture) => {
    setWallTexture(texture);
    localStorage.setItem('omnisticky_wall_texture', texture);
  };

  // Single subtle tilt slider (0 = flat, 25 = maximum isometric depth)
  const [tiltAngle, setTiltAngle] = useState(10);
  const [yawAngle, setYawAngle] = useState(-5);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.realistic-postit, button, input, textarea, select')) return;
    setIsOrbiting(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOrbiting || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYawAngle(prev => Math.min(30, Math.max(-30, prev + dx * 0.2)));
    setTiltAngle(prev => Math.min(25, Math.max(0, prev - dy * 0.2)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsOrbiting(false);
    lastMousePos.current = null;
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 select-none">
      
      {/* Purpose Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🪐</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Canvas
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
              {tasks.length} {tasks.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Freeform spatial board for visual ideation and flexible note placement.
          </p>
        </div>

        {/* Controls Suite */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          
          {/* Tactile Wall Texture Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            {WALL_TEXTURES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectWallTexture(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  wallTexture === t.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={`Wall surface: ${t.label}`}
              >
                <span>{t.icon}</span>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Single Tilt Slider */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tilt:</span>
            <input
              type="range"
              min="0"
              max="25"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-16 accent-blue-600 cursor-pointer"
              title={`Tilt angle: ${tiltAngle}°`}
            />
            <span className="text-[10px] font-mono text-slate-400 w-5">{tiltAngle}°</span>
          </div>

          {/* Reset button if tilted */}
          {tiltAngle > 0 && (
            <button
              onClick={() => {
                setTiltAngle(0);
                setYawAngle(0);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer text-xs flex items-center gap-1"
              title="Reset to flat perspective"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flat</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New note</span>
          </button>
        </div>
      </div>

      {/* Freeform Spatial Surface on Real Wall */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full min-h-[680px] rounded-3xl overflow-hidden border border-black/15 dark:border-white/10 flex items-center justify-center p-6 md:p-10 ${
          wallTexture === 'cork' ? 'wall-cork' : wallTexture === 'pegboard' ? 'wall-pegboard' : 'wall-plaster'
        } wall-ambient-lighting wall-vignette ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        {/* Hidden debug readout (shown only if debugMode is true) */}
        {debugMode && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 p-2 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-xl border border-black/5 dark:border-white/10 text-[10px] font-mono text-slate-500">
            <Compass className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
            <span>Pitch: {Math.round(tiltAngle)}° | Yaw: {Math.round(yawAngle)}°</span>
          </div>
        )}

        {/* 3D Rotated Board */}
        <div
          className="w-full max-w-6xl transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${tiltAngle}deg) rotateY(${yawAngle}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top Priorities Rail (Pinned Notes) */}
          {pinnedTasks.length > 0 && (
            <div className="mb-8" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/60 px-3 py-1 rounded-xl w-fit backdrop-blur-md border border-amber-200/70 dark:border-amber-900/50">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Top priorities ({pinnedTasks.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {pinnedTasks.map((task, idx) => {
                  const staggerClasses = ['sm:mt-0', 'sm:mt-3', 'sm:mt-1', 'sm:mt-4'];
                  const stagger = staggerClasses[idx % staggerClasses.length];
                  return (
                    <div key={task.id} className={`transition-transform duration-200 hover:scale-[1.02] ${stagger}`}>
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard Canvas Notes (Organic Wall Placement) */}
          {otherTasks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {otherTasks.map((task, idx) => {
                const staggerClasses = ['sm:mt-0', 'sm:mt-5', 'sm:mt-2', 'sm:mt-6', 'sm:mt-1', 'sm:mt-4'];
                const stagger = staggerClasses[idx % staggerClasses.length];
                return (
                  <div key={task.id} className={`transition-transform duration-200 hover:scale-[1.02] ${stagger}`}>
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
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-24 text-slate-400">
              <span className="text-4xl block mb-2">📝</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Canvas is empty</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Click "New note" to capture your first idea on this board.</p>
              <button
                onClick={onQuickAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Create note
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};


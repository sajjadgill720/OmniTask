import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Sliders, 
  Pin, 
  RotateCw, 
  Compass,
  Layers
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
  { id: 'plaster', label: 'Plaster', icon: '🧱' },
  { id: 'pegboard', label: 'Pegboard', icon: '🕳️' },
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

  // Single subtle tilt slider
  const [tiltAngle, setTiltAngle] = useState(6);
  const [yawAngle, setYawAngle] = useState(-3);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  // Group by projects for visual clustering
  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Group other tasks by project for organic clustering
  const projectGroups = new Map<string, { project: Project | undefined; tasks: Task[] }>();
  const ungrouped: Task[] = [];

  otherTasks.forEach(t => {
    if (t.projectId) {
      const existing = projectGroups.get(t.projectId);
      if (existing) {
        existing.tasks.push(t);
      } else {
        projectGroups.set(t.projectId, {
          project: projects.find(p => p.id === t.projectId),
          tasks: [t],
        });
      }
    } else {
      ungrouped.push(t);
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.realistic-postit, button, input, textarea, select')) return;
    setIsOrbiting(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOrbiting || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYawAngle(prev => Math.min(20, Math.max(-20, prev + dx * 0.15)));
    setTiltAngle(prev => Math.min(18, Math.max(0, prev - dy * 0.15)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsOrbiting(false);
    lastMousePos.current = null;
  };

  // Organic stagger offsets for a natural wall feel
  const staggerOffset = (idx: number) => {
    const offsets = [0, 12, -8, 20, -4, 16, -12, 8, 4, -16];
    return offsets[idx % offsets.length];
  };

  return (
    <div className="w-full px-3 sm:px-5 py-4 select-none">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-lg">🖼️</span>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Canvas
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-mono font-bold">
              {tasks.length} {tasks.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Pin sticky notes to a physical wall. Drag the wall to orbit, or tilt with the slider.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Wall Texture Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            {WALL_TEXTURES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectWallTexture(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  wallTexture === t.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={t.label}
              >
                <span>{t.icon}</span>
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tilt Slider */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px]">
            <Sliders className="w-3 h-3 text-slate-400" />
            <input
              type="range"
              min="0"
              max="18"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-14 accent-blue-600 cursor-pointer"
              title={`Tilt: ${tiltAngle}°`}
            />
            <span className="font-mono text-slate-400 w-4">{tiltAngle}°</span>
          </div>

          {tiltAngle > 0 && (
            <button
              onClick={() => { setTiltAngle(0); setYawAngle(0); }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              title="Reset flat"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New note</span>
          </button>
        </div>
      </div>

      {/* Physical Wall Surface */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full min-h-[700px] rounded-2xl overflow-hidden border border-black/15 dark:border-white/10 p-5 md:p-8 ${
          wallTexture === 'cork' ? 'wall-cork' : wallTexture === 'pegboard' ? 'wall-pegboard' : 'wall-plaster'
        } wall-ambient-lighting wall-vignette ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1800px',
          perspectiveOrigin: '50% 35%',
        }}
      >
        {/* Debug overlay */}
        {debugMode && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2 p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-lg border border-black/5 dark:border-white/10 text-[9px] font-mono text-slate-500">
            <Compass className="w-3 h-3 text-blue-500" />
            <span>Pitch: {Math.round(tiltAngle)}° | Yaw: {Math.round(yawAngle)}°</span>
          </div>
        )}

        {/* 3D Tilted Content Board */}
        <div
          className="w-full transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${tiltAngle}deg) rotateY(${yawAngle}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Pinned / Top Priorities Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-8" style={{ transform: 'translateZ(16px)', transformStyle: 'preserve-3d' }}>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 px-3 py-1 rounded-lg w-fit backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Pinned ({pinnedTasks.length})</span>
              </div>
              <div className="flex flex-wrap gap-5 items-start justify-start">
                {pinnedTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="transition-transform duration-200 hover:scale-[1.02] shrink-0"
                    style={{ marginTop: `${staggerOffset(idx)}px` }}
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
              </div>
            </div>
          )}

          {/* Project-Clustered Groups */}
          {Array.from(projectGroups.entries()).map(([projId, group]) => (
            <div key={projId} className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-white/90 bg-black/30 dark:bg-white/10 px-3 py-1 rounded-lg w-fit backdrop-blur-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: group.project?.colorHex || '#6366f1' }}
                />
                <span>{group.project?.title || 'Project'}</span>
                <span className="text-white/50 font-mono">{group.tasks.length}</span>
              </div>
              <div className="flex flex-wrap gap-5 items-start justify-start">
                {group.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="transition-transform duration-200 hover:scale-[1.02] shrink-0"
                    style={{ marginTop: `${staggerOffset(idx + 2)}px` }}
                  >
                    <StickyNoteCard
                      task={task}
                      index={idx + pinnedTasks.length}
                      project={group.project}
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
          ))}

          {/* Ungrouped Notes */}
          {ungrouped.length > 0 && (
            <div className="mb-6">
              {projectGroups.size > 0 && (
                <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-white/70 bg-black/20 dark:bg-white/8 px-3 py-1 rounded-lg w-fit backdrop-blur-sm">
                  <Layers className="w-3 h-3" />
                  <span>Loose Notes</span>
                  <span className="text-white/40 font-mono">{ungrouped.length}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-5 items-start justify-start">
                {ungrouped.map((task, idx) => (
                  <div
                    key={task.id}
                    className="transition-transform duration-200 hover:scale-[1.02] shrink-0"
                    style={{ marginTop: `${staggerOffset(idx + 5)}px` }}
                  >
                    <StickyNoteCard
                      task={task}
                      index={idx + pinnedTasks.length + Array.from(projectGroups.values()).reduce((a, g) => a + g.tasks.length, 0)}
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

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-24">
              <span className="text-5xl block mb-3">📌</span>
              <p className="text-sm font-bold text-white/80 dark:text-white/70">This wall is empty</p>
              <p className="text-xs text-white/50 mt-1 mb-5">Pin your first sticky note to the wall.</p>
              <button
                onClick={onQuickAdd}
                className="px-5 py-2.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                📝 Create first note
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

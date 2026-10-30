import React, { useState, useRef } from 'react';
import { Pin, Sparkles, Plus, Layers, Box, Eye, Sliders, Move } from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

export type Canvas3DTheme = 'corkboard' | 'grid' | 'minimal';
export type View3DAngle = 'interactive' | 'isometric' | 'flat';

interface StickyWallViewProps {
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

export const StickyWallView: React.FC<StickyWallViewProps> = ({
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
  const [view3DAngle, setView3DAngle] = useState<View3DAngle>('interactive');
  const [canvasTheme, setCanvasTheme] = useState<Canvas3DTheme>('corkboard');
  const [canvasTilt, setCanvasTilt] = useState({ x: 0, y: 0 });
  const [tiltStrength, setTiltStrength] = useState<number>(1);
  const [isBoardHovered, setIsBoardHovered] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Mouse Move over 3D Stage (tilts spatial canvas board based on mouse position)
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (view3DAngle !== 'interactive') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Responsive 3D tilt
    const tiltX = -((y - centerY) / centerY) * 5.5 * tiltStrength;
    const tiltY = ((x - centerX) / centerX) * 6.5 * tiltStrength;

    setCanvasTilt({ x: tiltX, y: tiltY });
    setIsBoardHovered(true);
  };

  const handleStageMouseLeave = () => {
    setIsBoardHovered(false);
    setCanvasTilt({ x: 0, y: 0 });
  };

  // Compute 3D Board transform based on selected mode
  const getBoard3DTransform = () => {
    if (view3DAngle === 'flat') {
      return 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
    if (view3DAngle === 'isometric') {
      return 'rotateX(18deg) rotateY(-8deg) rotateZ(1deg) scale(0.96)';
    }
    // 'interactive'
    if (isBoardHovered) {
      return `rotateX(${canvasTilt.x}deg) rotateY(${canvasTilt.y}deg) scale(0.99)`;
    }
    return 'rotateX(4deg) rotateY(-2deg) scale(0.99)';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Wall Header with 3D Canvas Switcher & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {tasks.length} Notes
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>{subtitle}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Drag notes to reorder • 3D Canvas active
            </span>
          </p>
        </div>

        {/* 3D Scene Controls & Add Note */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          
          {/* 3D Mode Selector Buttons */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl border border-slate-300/50 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setView3DAngle('interactive')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                view3DAngle === 'interactive'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Interactive 3D: Tilts smoothly with your mouse cursor"
            >
              <Box className="w-3 h-3" />
              <span>3D Gyro</span>
            </button>

            <button
              type="button"
              onClick={() => setView3DAngle('isometric')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                view3DAngle === 'isometric'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Cinematic Isometric 3D Angle"
            >
              <Eye className="w-3 h-3" />
              <span>Isometric</span>
            </button>

            <button
              type="button"
              onClick={() => setView3DAngle('flat')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                view3DAngle === 'flat'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Classic Flat 2D Wall"
            >
              <span>Flat</span>
            </button>
          </div>

          {/* Canvas Board Surface Texture (Corkboard vs Studio Grid) */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl border border-slate-300/50 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCanvasTheme('corkboard')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                canvasTheme === 'corkboard'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Real Corkboard Texture"
            >
              📌 Corkboard
            </button>
            <button
              type="button"
              onClick={() => setCanvasTheme('grid')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                canvasTheme === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="3D Dot Grid Studio"
            >
              📐 Grid
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Post-it</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            📝
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Your Sticky Wall is Fresh & Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Pin ideas, checklists, and tasks with tactile washi tape, color palettes, and focus timers.
          </p>
          <button
            onClick={onQuickAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Create First Post-it Note
          </button>
        </div>
      )}

      {/* 3D Spatial Canvas Stage */}
      <div 
        className={`canvas-3d-stage ${
          canvasTheme === 'corkboard' 
            ? 'corkboard-bg rounded-3xl p-5 sm:p-8 shadow-2xl' 
            : canvasTheme === 'grid'
            ? 'canvas-grid-bg rounded-3xl p-5 sm:p-8 border border-slate-200/50 dark:border-white/10'
            : 'p-2'
        }`}
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
      >
        <div 
          ref={boardRef}
          className="canvas-3d-board"
          style={{
            transform: getBoard3DTransform(),
          }}
        >
          {/* Pinned Notes Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-white/70 dark:bg-black/50 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-amber-300/40 dark:border-amber-700/40">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Post-its ({pinnedTasks.length}) — Drag to Reorder</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {pinnedTasks.map((task, idx) => (
                  <StickyNoteCard
                    key={task.id}
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
                ))}
              </div>
            </div>
          )}

          {/* Other / Unpinned Notes Section */}
          {otherTasks.length > 0 && (
            <div>
              {pinnedTasks.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-black/50 px-3 py-1 rounded-xl w-fit backdrop-blur-xs shadow-xs border border-black/10 dark:border-white/10">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Other Notes ({otherTasks.length}) — Drag to Reorder</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {otherTasks.map((task, idx) => (
                  <StickyNoteCard
                    key={task.id}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

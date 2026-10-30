import React, { useState, useRef } from 'react';
import { Pin, Sparkles, Plus, Layers, Box, Eye } from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

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
}) => {
  const [is3DMode, setIs3DMode] = useState(true);
  const [canvasTilt, setCanvasTilt] = useState({ x: 0, y: 0 });
  const [isBoardHovered, setIsBoardHovered] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const pinnedTasks = tasks.filter(t => t.isPinned);
  const otherTasks = tasks.filter(t => !t.isPinned);

  // Mouse Move over 3D Stage (tilts the entire spatial pinboard in perspective!)
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle, elegant board tilt (-5deg to +5deg)
    const tiltX = -((y - centerY) / centerY) * 4.5;
    const tiltY = ((x - centerX) / centerX) * 5.5;

    setCanvasTilt({ x: tiltX, y: tiltY });
    setIsBoardHovered(true);
  };

  const handleStageMouseLeave = () => {
    setIsBoardHovered(false);
    setCanvasTilt({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Wall Header with 3D Canvas Switcher */}
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
          <p className="text-xs text-slate-400 font-medium">
            {subtitle} • {is3DMode ? 'Interactive 3D Spatial Canvas (Hover Parallax Active)' : 'Flat Grid Mode'}
          </p>
        </div>

        {/* Right Tools: 3D Canvas Toggle & Add Note */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* 3D Canvas Perspective Toggle */}
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              is3DMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-blue-500/25 scale-102'
                : 'bg-white dark:bg-[#1a1c24] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Toggle interactive 3D spatial canvas with cursor tilt physics"
          >
            <Box className={`w-3.5 h-3.5 ${is3DMode ? 'animate-pulse' : ''}`} />
            <span>{is3DMode ? '3D Canvas Active' : 'Enable 3D Canvas'}</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
        className={`canvas-3d-stage ${is3DMode ? 'canvas-grid-bg rounded-3xl p-4 sm:p-6 border border-slate-200/50 dark:border-white/5' : ''}`}
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
      >
        <div 
          ref={boardRef}
          className="canvas-3d-board"
          style={{
            transform: is3DMode && isBoardHovered
              ? `rotateX(${canvasTilt.x}deg) rotateY(${canvasTilt.y}deg) scale(0.99)`
              : 'rotateX(0deg) rotateY(0deg) scale(1)',
          }}
        >
          {/* Pinned Notes Section */}
          {pinnedTasks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                <span>📌 Pinned Post-its ({pinnedTasks.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other / Unpinned Notes Section */}
          {otherTasks.length > 0 && (
            <div>
              {pinnedTasks.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Other Notes ({otherTasks.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
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

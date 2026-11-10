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
  LayoutGrid,
  ArrowLeft,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import { Task, Project, CanvasElement, CanvasConnection } from '../types';
import { StickyNoteCard } from './StickyNoteCard';
import { RedPushPin } from './RedPushPin';

interface SpatialCanvas3DViewProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  projects: Project[];
  elements: CanvasElement[];
  onUpdateElements: (elements: CanvasElement[]) => void;
  connections: CanvasConnection[];
  onUpdateConnections: (connections: CanvasConnection[]) => void;
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

export type Preset3D = 'isometric' | 'gyro' | 'desk';
export type SpatialArrangement = 'canvas_projection' | 'pedestals';

export const SpatialCanvas3DView: React.FC<SpatialCanvas3DViewProps> = ({
  title,
  subtitle,
  tasks,
  projects,
  elements,
  onUpdateElements,
  connections,
  onUpdateConnections,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  audioEnabled,
  onQuickAdd,
  onReorderTasks,
  onMoveTaskStatus,
  onBack,
}) => {
  const [arrangement, setArrangement] = useState<SpatialArrangement>('canvas_projection');
  const [preset, setPreset] = useState<Preset3D>('isometric');
  const [pitch, setPitch] = useState(20); // degrees rotateX
  const [yaw, setYaw] = useState(-14);   // degrees rotateY
  const [zoom, setZoom] = useState(0.88);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [dragOverZone, setDragOverZone] = useState<Task['status'] | null>(null);
  const [selected3DElementId, setSelected3DElementId] = useState<string | null>(null);

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

  const setPresetAngle = (mode: Preset3D) => {
    setPreset(mode);
    if (mode === 'isometric') {
      setPitch(22);
      setYaw(-15);
      setZoom(0.88);
    } else if (mode === 'desk') {
      setPitch(4);
      setYaw(0);
      setZoom(0.95);
    } else {
      // Gyro mode
      setPitch(12);
      setYaw(-6);
      setZoom(0.92);
    }
  };

  const resetCamera = () => {
    setPresetAngle('isometric');
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

  // Selected 3D Element Details
  const activeSelected3D = elements.find(el => el.id === selected3DElementId);

  return (
    <div className="w-full px-2 sm:px-4 py-4 select-none font-sans">
      
      {/* 3D Canvas Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-white/10 gap-3">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>‹ Back to 2D Canvas Wall</span>
            </button>
          )}

          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🪐</span>
            <h2 className="text-xl font-black tracking-tight text-white drop-shadow-xs">
              {title} — 3D Spatial Canvas
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold font-mono">
              {elements.length} Items
            </span>
          </div>
          <p className="text-xs text-white/60 font-medium">
            {subtitle} • Click & drag space to orbit 3D camera. Content remains perfectly synchronized with 2D.
          </p>
        </div>

        {/* 3D Controls Suite */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Spatial Mode Switcher */}
          <div className="flex items-center p-1 bg-black/50 rounded-xl border border-white/15 text-xs font-bold text-white">
            <button
              onClick={() => setArrangement('canvas_projection')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                arrangement === 'canvas_projection'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="3D Canvas Projection (Synchronized with 2D Notes & Photos)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>3D Ideas Space</span>
            </button>

            <button
              onClick={() => setArrangement('pedestals')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                arrangement === 'pedestals'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Interactive 3D Status Pedestals"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Status Pedestals</span>
            </button>
          </div>

          {/* Perspective Preset Buttons */}
          <div className="flex items-center p-1 bg-black/50 rounded-xl border border-white/15 text-xs font-bold text-white">
            <button
              onClick={() => setPresetAngle('isometric')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                preset === 'isometric'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Cinematic Isometric 3D Perspective"
            >
              <Eye className="w-3 h-3" />
              <span>Isometric</span>
            </button>

            <button
              onClick={() => setPresetAngle('gyro')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                preset === 'gyro'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Soft Angle Perspective"
            >
              <span>Angle</span>
            </button>

            <button
              onClick={() => setPresetAngle('desk')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                preset === 'desk'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Desk Top-Down Projection"
            >
              <span>Desk</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 p-1 bg-black/50 rounded-xl border border-white/15 text-xs font-bold text-white">
            <button
              onClick={() => setZoom(z => Math.max(0.55, z - 0.1))}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-amber-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.35, z + 0.1))}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetCamera}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer ml-1"
              title="Reset 3D Camera"
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
          {/* MODE A: 3D CANVAS PROJECTION (Synchronized with 2D Elements and Photos) */}
          {arrangement === 'canvas_projection' ? (
            <div 
              className="relative w-full min-h-[640px] rounded-3xl p-8 border border-white/10 shadow-2xl"
              style={{
                backgroundColor: '#F6EBDD',
                backgroundImage: 'radial-gradient(circle, rgba(105, 87, 71, 0.15) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
                transformStyle: 'preserve-3d',
                boxShadow: '0 30px 70px -15px rgba(0,0,0,0.5), inset 0 0 60px rgba(70,45,20,0.15)',
              }}
            >
              {/* SVG 3D Connections in projected ground plane */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                {connections.map(conn => {
                  const nodeA = elements.find(n => n.id === conn.fromId);
                  const nodeB = elements.find(n => n.id === conn.toId);
                  if (!nodeA || !nodeB) return null;

                  const ax = nodeA.x + 65;
                  const ay = nodeA.y + 65;
                  const bx = nodeB.x + 65;
                  const by = nodeB.y + 65;

                  return (
                    <g key={conn.id}>
                      <line
                        x1={ax}
                        y1={ay}
                        x2={bx}
                        y2={by}
                        stroke="#695747"
                        strokeWidth="2.5"
                        strokeDasharray={conn.style === 'dashed' ? '5 5' : 'none'}
                        opacity="0.65"
                      />
                      {/* Firefly energy beam */}
                      <circle cx={(ax + bx) / 2} cy={(ay + by) / 2} r="3" fill="#f59e0b" className="animate-ping" />
                    </g>
                  );
                })}
              </svg>

              {/* Render 3D Floating Elements */}
              {elements.map((el, idx) => {
                const isSelected = selected3DElementId === el.id;
                const elevationZ = isSelected ? 40 : 18;

                if (el.type === 'photo') {
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelected3DElementId(el.id)}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width || 140}px`,
                        height: `${el.height || 180}px`,
                        transform: `translateZ(${elevationZ}px) rotate(${el.rotation || 0}deg)`,
                        transformStyle: 'preserve-3d',
                      }}
                      className={`interactive-card absolute z-20 p-2.5 pb-4 rounded-xl bg-white border border-black/15 shadow-2xl flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected ? 'ring-4 ring-amber-400 scale-105' : 'hover:scale-102 hover:translate-z-10'
                      }`}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-amber-100/90 border-t border-b border-amber-300/40 pointer-events-none" />
                      <div className="w-full flex-1 rounded-sm overflow-hidden bg-stone-100 mb-1.5">
                        <img 
                          src={el.imageUrl || el.thumbnailUrl} 
                          alt={el.caption || el.title}
                          className="w-full h-full object-cover pointer-events-none" 
                        />
                      </div>
                      <span className="block text-center font-handwriting text-xs font-bold text-stone-800 truncate">
                        {el.caption || el.title}
                      </span>
                    </div>
                  );
                }

                if (el.type === 'hub') {
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelected3DElementId(el.id)}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width || 144}px`,
                        height: `${el.height || 96}px`,
                        transform: `translateZ(${elevationZ}px)`,
                        transformStyle: 'preserve-3d',
                      }}
                      className={`interactive-card absolute z-20 rounded-[36px] bg-[#F8D979] border-2 border-dashed border-[#695747] shadow-2xl flex items-center justify-center p-3 text-center transition-all cursor-pointer ${
                        isSelected ? 'ring-4 ring-amber-400 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div>
                        <h4 className="font-handwriting font-extrabold text-sm text-stone-900 leading-tight">
                          {el.title}
                        </h4>
                        {el.category && (
                          <span className="text-[9px] font-mono text-stone-700 uppercase tracking-widest font-bold">
                            {el.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Sticky Note in 3D
                return (
                  <div
                    key={el.id}
                    onClick={() => setSelected3DElementId(el.id)}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width || 130}px`,
                      height: `${el.height || 130}px`,
                      backgroundColor: el.colorHex || '#F8D979',
                      transform: `translateZ(${elevationZ}px) rotate(${el.rotation || 0}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                    className={`interactive-card absolute z-20 p-3 pt-5 rounded-2xl border border-black/10 shadow-2xl flex flex-col justify-between transition-all paper-ruling-lines cursor-pointer ${
                      isSelected ? 'ring-4 ring-amber-400 scale-105' : 'hover:scale-102 hover:translate-z-8'
                    }`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <RedPushPin size={22} color="cyan" />
                    </div>
                    <p className="font-handwriting text-sm font-bold text-stone-900 leading-snug whitespace-pre-line pointer-events-none">
                      {el.title}
                    </p>
                    <span className="text-[9px] font-mono text-stone-700 font-bold">
                      {el.category || 'Idea'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* MODE B: 3D STATUS PEDESTALS (Kanban Columns in 3D space) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* PEDESTAL 1: TO DO */}
              <div
                onDragOver={(e) => handleDragOverPedestal(e, 'todo')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnPedestal(e, 'todo')}
                className={`relative rounded-3xl p-5 transition-all duration-300 border ${
                  dragOverZone === 'todo'
                    ? 'bg-amber-500/20 border-amber-400 ring-4 ring-amber-400/30'
                    : 'bg-white/40 dark:bg-stone-900/60 border-white/15'
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

                <div className="flex flex-col gap-4">
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
                    : 'bg-white/40 dark:bg-stone-900/60 border-white/15'
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

                <div className="flex flex-col gap-4">
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
                    : 'bg-white/40 dark:bg-stone-900/60 border-white/15'
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

                <div className="flex flex-col gap-4">
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
          )}
        </div>

        {/* Selected 3D Element Floating Inspector */}
        {activeSelected3D && (
          <div className="absolute bottom-6 left-6 z-40 p-4 rounded-2xl bg-[#25231F]/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white max-w-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/15">
              <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                {activeSelected3D.type.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setSelected3DElementId(null)}
                className="text-white/50 hover:text-white p-0.5"
              >
                ×
              </button>
            </div>
            <h4 className="font-bold text-sm leading-snug mb-1">
              {activeSelected3D.caption || activeSelected3D.title}
            </h4>
            {activeSelected3D.category && (
              <p className="text-xs text-white/60">Category: {activeSelected3D.category}</p>
            )}
            <p className="text-[10px] font-mono text-white/40 mt-2">
              Position: ({activeSelected3D.x}, {activeSelected3D.y})
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

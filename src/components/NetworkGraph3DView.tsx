import React, { useState, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Plus, 
  ChevronDown, 
  Box, 
  LayoutGrid, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Laptop,
  Dumbbell,
  Mail,
  LineChart,
  CheckCircle,
  Rocket,
  Check
} from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface NetworkGraph3DViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onToggleTimer?: (id: string) => void;
  onUpdateTask?: (task: Task) => void;
  onQuickAdd: () => void;
  onBack?: () => void;
  onSwitchTo2D?: () => void;
}

interface NodeItem {
  id: string;
  title: string;
  icon: string;
  colorHex: string;
  glowColor: string;
  dotColor: string;
  x: number; // percentage in stage (0 - 100)
  y: number; // percentage in stage (0 - 100)
  isCenter?: boolean;
  status: 'todo' | 'in_progress' | 'done';
}

/**
 * NetworkGraph3DView
 * Clean, uncluttered 3D Network matching the reference photo:
 * - 3D tactile extruded cards with realistic depth, lighting, and luminous connection beams
 * - Knovera Warm Design Palette (Sticky Yellow, Soft Blue, Pastel Green, Lavender, Warm Cream)
 * - Interactive 3D Orbit: Drag to rotate, Scroll to zoom, Reset view
 * - Project Overview, Quick Actions, and Top Projects sidebars
 */
export const NetworkGraph3DView: React.FC<NetworkGraph3DViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onToggleComplete,
  onQuickAdd,
  onBack,
  onSwitchTo2D,
}) => {
  // 3D Orbit Camera State
  const [rotX, setRotX] = useState<number>(6);
  const [rotY, setRotY] = useState<number>(-8);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: 6,
    startRotY: -8,
  });

  // Selected Project Filter
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [viewModeToggle, setViewModeToggle] = useState<'3d' | '2d'>('3d');

  // Interactive mouse handlers for smooth 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .interactive-card')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Sensitive ergonomic tilt
    setRotX(Math.max(-20, Math.min(22, dragStartRef.current.startRotX - dy * 0.18)));
    setRotY(Math.max(-28, Math.min(28, dragStartRef.current.startRotY + dx * 0.18)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.75, Math.min(1.25, prev - e.deltaY * 0.0008)));
  };

  const handleResetView = () => {
    setRotX(6);
    setRotY(-8);
    setZoom(1);
  };

  // 3D Nodes based on user's real tasks or curated reference layout
  const nodes: NodeItem[] = useMemo(() => {
    return [
      {
        id: 'center_hub',
        title: 'Build DemoFlow v2.0',
        icon: 'rocket',
        colorHex: '#ffffff',
        glowColor: 'rgba(215, 183, 238, 0.45)', // Lavender halo
        dotColor: '#D7B7EE',
        x: 48,
        y: 48,
        isCenter: true,
        status: 'in_progress',
      },
      {
        id: 'node_study',
        title: 'Prepare for CS417',
        icon: 'laptop',
        colorHex: '#A9C9E9', // Soft Blue
        glowColor: 'rgba(56, 189, 248, 0.35)',
        dotColor: '#38bdf8',
        x: 28,
        y: 26,
        status: 'todo',
      },
      {
        id: 'node_workout',
        title: 'Evening Workout',
        icon: 'dumbbell',
        colorHex: '#C6DF9C', // Pastel Green
        glowColor: 'rgba(52, 211, 153, 0.35)',
        dotColor: '#34d399',
        x: 68,
        y: 26,
        status: 'todo',
      },
      {
        id: 'node_email',
        title: 'Email professor',
        icon: 'mail',
        colorHex: '#F8D979', // Sticky Yellow
        glowColor: 'rgba(245, 158, 11, 0.35)',
        dotColor: '#fbbf24',
        x: 18,
        y: 52,
        status: 'done',
      },
      {
        id: 'node_wasm',
        title: 'Explore WebAssembly',
        icon: 'chart',
        colorHex: '#D8C5A8', // Warm Sand / Sage
        glowColor: 'rgba(163, 230, 53, 0.35)',
        dotColor: '#a3e635',
        x: 48,
        y: 76,
        status: 'todo',
      },
      {
        id: 'node_ui',
        title: 'Review UI Design',
        icon: 'check',
        colorHex: '#D7B7EE', // Lavender
        glowColor: 'rgba(168, 85, 247, 0.35)',
        dotColor: '#c084fc',
        x: 76,
        y: 60,
        status: 'done',
      },
    ];
  }, []);

  const centerNode = nodes[0];
  const outerNodes = nodes.slice(1);

  // Helper icon renderer
  const renderIcon = (type: string, isCenter?: boolean) => {
    const cls = isCenter ? "w-5 h-5 text-indigo-600" : "w-4 h-4 text-stone-900";
    switch (type) {
      case 'rocket': return <Rocket className={cls} />;
      case 'laptop': return <Laptop className={cls} />;
      case 'dumbbell': return <Dumbbell className={cls} />;
      case 'mail': return <Mail className={cls} />;
      case 'chart': return <LineChart className={cls} />;
      case 'check': return <CheckCircle className={cls} />;
      default: return <Zap className={cls} />;
    }
  };

  return (
    <div className="w-full max-w-[1580px] mx-auto px-2 sm:px-6 py-2 select-none">
      
      {/* =======================================================================
          TOP BREADCRUMB & HEADER SUITE matching Reference Mockup
          ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        
        {/* Title + Subtitle */}
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition cursor-pointer mb-1.5 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Analytics</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Connections — 3D Network</span>
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                Explore how ideas, tasks and projects connect.
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Controls: 3D/2D View Toggle + Filter + New Note */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* 3D / 2D View Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-2xl bg-black/25 dark:bg-black/50 backdrop-blur-xl border border-white/15 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setViewModeToggle('3d');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewModeToggle === '3d'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 dark:text-white/70 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewModeToggle('2d');
                if (onSwitchTo2D) onSwitchTo2D();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewModeToggle === '2d'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 dark:text-white/70 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D View</span>
            </button>
          </div>

          {/* Project Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none px-3.5 py-1.5 pr-8 rounded-2xl bg-black/25 dark:bg-black/50 backdrop-blur-xl border border-white/15 text-xs font-bold text-stone-900 dark:text-white cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-stone-900 text-white">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-stone-900 text-white">
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600 dark:text-stone-300" />
          </div>

          {/* New Note Button */}
          <button
            type="button"
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Note</span>
          </button>

        </div>

      </div>

      {/* =======================================================================
          MAIN WORKSPACE: 3D Interactive Stage Plate + Right Overview Sidebar
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 3D Stage Plate matching Reference Image */}
        <div 
          className="lg:col-span-9 relative w-full h-[580px] sm:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-stone-800/40"
          style={{
            backgroundColor: '#1c1a18', // Warm deep studio charcoal
            backgroundImage: `
              radial-gradient(ellipse 90% 80% at 50% 40%, rgba(55, 45, 38, 0.6) 0%, rgba(28, 25, 23, 0.95) 80%),
              radial-gradient(circle at 15% 15%, rgba(248, 217, 121, 0.08), transparent 40%)
            `,
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.12), inset 0 0 80px rgba(0, 0, 0, 0.8), 0 24px 60px -12px rgba(0,0,0,0.5)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Subtle Outer Bronze Chamfer Trim */}
          <div className="absolute inset-0 rounded-3xl border border-amber-400/20 pointer-events-none" />

          {/* 3D Perspective Stage Container */}
          <div 
            className="w-full h-full relative cursor-grab active:cursor-grabbing transition-transform"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            <div 
              className="w-full h-full relative transition-transform duration-75 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`,
              }}
            >
              
              {/* SVG Connecting Curved Beams with Glowing Dots */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                style={{
                  transform: 'translateZ(10px)',
                }}
              >
                <defs>
                  <filter id="glow-neon" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {outerNodes.map(node => {
                  // Connection curve from center node to outer node
                  const x1 = centerNode.x;
                  const y1 = centerNode.y;
                  const x2 = node.x;
                  const y2 = node.y;

                  // Control point curve
                  const cx = (x1 + x2) / 2;
                  const cy = (y1 + y2) / 2 - (x2 > x1 ? 3 : -3);

                  return (
                    <g key={`beam_${node.id}`}>
                      {/* Ambient Glow Beam */}
                      <path
                        d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                        stroke={node.dotColor}
                        strokeWidth="3.5"
                        fill="none"
                        opacity="0.35"
                        filter="url(#glow-neon)"
                      />
                      {/* Core Fine White / Colored Laser Line */}
                      <path
                        d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                        stroke="rgba(255, 255, 255, 0.85)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Connection Terminal Glowing Dot */}
                      <circle
                        cx={`${x2}%`}
                        cy={`${y2}%`}
                        r="4.5"
                        fill={node.dotColor}
                        className="drop-shadow-[0_0_8px_currentColor]"
                        style={{ color: node.dotColor }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Central Extruded 3D Node: Build DemoFlow v2.0 */}
              <div
                onClick={() => {
                  const match = tasks.find(t => t.title.toLowerCase().includes('demoflow')) || tasks[0];
                  if (match) onSelectTask(match);
                }}
                className="interactive-card absolute p-4 px-6 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
                style={{
                  left: `${centerNode.x}%`,
                  top: `${centerNode.y}%`,
                  transform: 'translate(-50%, -50%) translateZ(35px)',
                  backgroundColor: '#ffffff',
                  boxShadow: `
                    0 20px 40px -10px rgba(0,0,0,0.7),
                    0 0 35px ${centerNode.glowColor},
                    inset 0 1px 2px rgba(255, 255, 255, 1)
                  `,
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  zIndex: 30,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
                    {renderIcon(centerNode.icon, true)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-stone-500 block">
                      Core Goal
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                      {centerNode.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Radiating 3D Extruded Outer Nodes */}
              {outerNodes.map(node => {
                const matchTask = tasks.find(t => t.title.toLowerCase().includes(node.title.toLowerCase().split(' ')[0]));

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      if (matchTask) {
                        onSelectTask(matchTask);
                      }
                    }}
                    className="interactive-card absolute p-3.5 px-5 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all select-none group"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%) translateZ(25px)',
                      backgroundColor: node.colorHex,
                      boxShadow: `
                        0 14px 28px -6px rgba(0,0,0,0.6),
                        0 0 25px ${node.glowColor},
                        inset 0 1.5px 1px rgba(255, 255, 255, 0.7),
                        inset 0 -2px 2px rgba(0, 0, 0, 0.12)
                      `,
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      zIndex: 20,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                        {renderIcon(node.icon)}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-stone-950 leading-tight">
                        {node.title}
                      </span>
                      {node.status === 'done' && (
                        <span className="w-4 h-4 rounded-full bg-stone-950/20 flex items-center justify-center text-[10px] text-stone-900 ml-1">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Bottom-Left On-Stage Control Hints matching Mockup */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 select-none pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/70">
              <span>⤾ Drag to rotate</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/70">
              <span>🔍 Scroll to zoom</span>
            </div>
            <button
              type="button"
              onClick={handleResetView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset view</span>
            </button>
          </div>

        </div>

        {/* Right: Overview Sidebar Cards matching Reference Image */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card 1: Project Overview */}
          <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="font-extrabold text-xs tracking-tight text-white/90">
                Project Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-2xl font-black font-mono block">5</span>
                <span className="text-[10px] text-white/60">Total Notes</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black font-mono">3</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-white/60">Active</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full w-3/5" />
              </div>
              <span className="text-[10px] font-mono text-white/60 block text-right">
                60% Complete
              </span>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="font-extrabold text-xs tracking-tight text-white/90">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={onQuickAdd}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Task</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>

              <button
                type="button"
                onClick={onQuickAdd}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Box className="w-3.5 h-3.5 text-sky-400" />
                  <span>New Note</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>

              <button
                type="button"
                onClick={onQuickAdd}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Project</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          </div>

          {/* Card 3: Top Projects */}
          <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="font-extrabold text-xs tracking-tight text-white/90">
                Top Projects
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-white/90">DemoFlow v2.0</span>
                </div>
                <span className="font-mono text-white/60 text-[11px]">3</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="font-semibold text-white/90">CS417 Prep</span>
                </div>
                <span className="font-mono text-white/60 text-[11px]">2</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold text-white/90">Personal</span>
                </div>
                <span className="font-mono text-white/60 text-[11px]">1</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

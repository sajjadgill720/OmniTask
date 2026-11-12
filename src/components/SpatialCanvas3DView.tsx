import React, { useState, useRef, useMemo } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft,
  Plus,
  Check,
  Clock,
  ExternalLink,
  Box,
  Maximize2,
  Calendar,
  Sparkles,
  Zap,
  FolderPlus,
  FilePlus,
  Smile,
  Layers
} from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import { RedPushPin, PinColor } from './RedPushPin';
import { checkDueDate } from '../utils/storage';
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
  onOpenNewProject?: () => void;
}

// Authentic Milanote & Pinterest Corkboard Note Styles
const PIN_PALETTES: { bg: string; border: string; pin: PinColor; tag: string }[] = [
  { bg: '#FEE575', border: '#D4B830', pin: 'yellow', tag: 'Work' },
  { bg: '#BAEBC7', border: '#78B88A', pin: 'green', tag: 'Personal' },
  { bg: '#FFAFA8', border: '#D97A72', pin: 'red', tag: 'Work' },
  { bg: '#DDBDF5', border: '#A680C5', pin: 'blue', tag: 'Research' },
  { bg: '#DCF0B9', border: '#9CB875', pin: 'green', tag: 'Health' },
  { bg: '#BDE3F5', border: '#7AB0C7', pin: 'blue', tag: 'Study' },
  { bg: '#F5DCBD', border: '#C79D75', pin: 'yellow', tag: 'Mindset' },
];

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
  onOpenNewProject,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isLampOn, setIsLampOn] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('Keep going! 😊');
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  // 3D Perspective Controls
  const [pitch, setPitch] = useState(4); // degrees
  const [yaw, setYaw] = useState(-1);    // degrees
  const [isOrbiting, setIsOrbiting] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  // Active / Upcoming tasks
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .slice(0, 3);
  }, [tasks]);

  // Handle 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!is3DMode) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, a, .interactive-item')) return;
    setIsOrbiting(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOrbiting || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYaw(prev => Math.min(20, Math.max(-20, prev + dx * 0.18)));
    setPitch(prev => Math.min(18, Math.max(-5, prev - dy * 0.18)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsOrbiting(false);
    lastMousePos.current = null;
  };

  const resetPerspective = () => {
    setPitch(4);
    setYaw(-1);
    setZoom(1.0);
  };

  // Toggle complete with sound & confetti
  const handleCheckTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onToggleComplete(task.id);
    if (audioEnabled) playCompletionSound();
    if (task.status !== 'done') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FEE575', '#BAEBC7', '#FFAFA8', '#3B82F6'],
      });
    }
  };

  // Pinned Polaroid Photos (Inspiration Images matching Milanote setup)
  const mountainPhotoUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";
  const cityPhotoUrl = "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80";

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full min-h-[920px] lg:h-[calc(100vh-90px)] relative select-none font-sans overflow-hidden flex flex-col justify-between ${
        isOrbiting ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundColor: '#EADFC9',
        backgroundImage: `
          radial-gradient(circle at 85% 20%, rgba(255, 246, 210, 0.6) 0%, rgba(255, 230, 170, 0.25) 45%, transparent 75%),
          linear-gradient(135deg, #F0E8D7 0%, #E3D4BC 50%, #DAC7AA 100%)
        `,
      }}
    >
      {/* SVG Filters for Plaster Imperfections & Amorim Cork Granulation */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Subtle Plaster Wall Micro-Texture Filter */}
          <filter id="plaster-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0.33 0 0 0 0  0 0.33 0 0 0  0 0 0.33 0 0  0 0 0 0.06 0" />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>

          {/* Granulated Amorim Natural Cork Texture */}
          <filter id="cork-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.48" numOctaves="4" result="corkNoise" />
            <feColorMatrix type="matrix" values="0.45 0 0 0 0  0 0.32 0 0 0  0 0 0.18 0 0  0 0 0 0.28 0" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* 
        DIRECTIONAL AFTERNOON SUNLIGHT & NATURAL WINDOW MULLION SHADOWS
        Simulates natural warm sunlight streaming from the upper right across the wall
      */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(120deg, rgba(255,255,255,0.45) 0%, rgba(255,248,220,0.2) 30%, transparent 65%),
            linear-gradient(170deg, transparent 40%, rgba(0,0,0,0.06) 100%)
          `,
        }}
      >
        {/* Soft Window Pane & Leaf Shadows cast across wall */}
        <div 
          className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{
            backgroundImage: `
              linear-gradient(135deg, transparent 45%, rgba(60, 40, 20, 0.4) 47%, rgba(60, 40, 20, 0.4) 53%, transparent 55%),
              linear-gradient(45deg, transparent 40%, rgba(50, 35, 15, 0.3) 42%, rgba(50, 35, 15, 0.3) 46%, transparent 48%),
              radial-gradient(ellipse at 15% 45%, rgba(30, 60, 20, 0.25) 0%, transparent 55%)
            `,
            filter: 'blur(16px)',
          }}
        />

        {/* Warm Golden Glow from Brass Desk Lamp when turned on */}
        {isLampOn && (
          <div 
            className="absolute right-0 bottom-12 w-[650px] h-[550px] pointer-events-none transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 75% 70%, rgba(255, 225, 140, 0.42) 0%, rgba(251, 191, 36, 0.16) 40%, transparent 75%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </div>

      {/* TOP WALL MURAL: Handwritten Abraham Lincoln Quote Painted Directly on Plaster */}
      <div className="relative z-10 w-full pt-3 px-4 sm:px-8 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 
            className="text-xl sm:text-2xl md:text-3xl text-stone-900/90 font-serif italic font-medium tracking-tight select-none"
            style={{
              fontFamily: "'Homemade Apple', 'Caveat', 'Playfair Display', Georgia, cursive, serif",
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(0,0,0,0.14), 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            “Discipline is choosing between what you want now and what you want most.”
          </h1>
          <p 
            className="text-xs sm:text-sm text-stone-700/80 font-serif italic tracking-wide mt-0.5 text-right pr-6"
            style={{ fontFamily: "'Caveat', cursive, serif" }}
          >
            — Abraham Lincoln
          </p>
        </div>
      </div>

      {/* MAIN CORKBOARD WORKSPACE ROW (Corkboard Center + Upcoming/QuickActions Right) */}
      <div className="relative z-10 flex-1 min-h-0 w-full px-3 sm:px-6 md:px-8 py-2 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6 overflow-hidden">
        
        {/* 
          AMORIM-INSPIRED BEVELED NATURAL WOOD CORKBOARD
          Rich solid walnut/oak wood frame with physical depth, natural cork granules,
          pinned Milanote photos, crumpled notes, and connected tasks!
        */}
        <div 
          className="flex-1 min-h-0 w-full max-w-5xl h-full flex flex-col transition-transform duration-100 ease-out"
          style={{
            transform: is3DMode 
              ? `perspective(1600px) rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})` 
              : `scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Frosted Glass Header Capsule Pinned Above the Corkboard */}
          <div className="shrink-0 flex items-center justify-between p-2 mb-2 bg-white/40 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm gap-2">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Return to Desk Workspace"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Desk</span>
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <span className="text-base">🏛️</span>
                <span className="font-bold text-sm text-stone-900 tracking-tight">Executive Standup Wall</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 text-[11px] font-mono font-bold">
                  {tasks.length} Deliverables
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 font-medium hidden md:block">
              Corporate Sprint Review • Live physical digital twin of your team workspace.
            </p>

            {/* 3D / Zoom Suite */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIs3DMode(!is3DMode)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  is3DMode 
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'bg-white/60 text-stone-700 hover:bg-white'
                }`}
                title="Toggle 3D Perspective Orbit"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D</span>
              </button>

              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.75, z - 0.1))}
                className="p-1 rounded-lg bg-white/60 text-stone-700 hover:bg-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(1.25, z + 0.1))}
                className="p-1 rounded-lg bg-white/60 text-stone-700 hover:bg-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetPerspective}
                className="p-1 rounded-lg bg-white/60 text-stone-700 hover:bg-white cursor-pointer"
                title="Reset Camera"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 
            THE SOLID WOODEN BEVELED CORK PINBOARD FRAME
            Beveled solid oak/walnut with deep shadow and authentic granular corkboard
          */}
          <div 
            className="flex-1 min-h-[500px] w-full rounded-2xl md:rounded-3xl relative overflow-hidden border-[12px] sm:border-[16px] md:border-[18px] border-[#7D4F27]"
            style={{
              backgroundColor: '#B58249',
              backgroundImage: `
                radial-gradient(circle at 60% 40%, rgba(220, 165, 100, 0.45) 0%, rgba(160, 105, 55, 0.35) 60%),
                radial-gradient(circle at 20% 80%, rgba(140, 85, 40, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #C28F54 0%, #A67038 50%, #8C5524 100%)
              `,
              boxShadow: `
                0 30px 60px -15px rgba(45, 25, 10, 0.45),
                0 15px 25px -5px rgba(0, 0, 0, 0.2),
                inset 0 4px 12px rgba(0, 0, 0, 0.4),
                inset 0 1px 3px rgba(255, 255, 255, 0.2)
              `,
            }}
          >
            {/* Amorim Cork Granular Texture Speckle Layer */}
            <div 
              className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 30%, #5E3814 1.5px, transparent 2px),
                  radial-gradient(circle at 75% 65%, #3E240D 1.5px, transparent 2px),
                  radial-gradient(circle at 45% 85%, #8B5827 2px, transparent 2.5px),
                  radial-gradient(circle at 85% 20%, #F5CE98 1.5px, transparent 2px),
                  radial-gradient(circle at 10% 70%, #4A280B 2px, transparent 2.5px)
                `,
                backgroundSize: '40px 40px, 35px 35px, 50px 50px, 45px 45px, 60px 60px',
              }}
            />

            {/* Hand-Drawn Workflow SVG Connection Arrows (Milanote Visual Board) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" aria-hidden="true">
              {/* Arrow 1: Note 1 -> Note 2 */}
              <path
                d="M 230 140 C 270 120, 310 130, 340 145"
                fill="none"
                stroke="#4A2E16"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.65"
                markerEnd="url(#arrowhead)"
              />
              {/* Arrow 2: Note 2 -> Note 3 */}
              <path
                d="M 485 145 C 520 135, 545 130, 565 140"
                fill="none"
                stroke="#4A2E16"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              {/* Arrow 3: Note 2 curving down to Note 4 */}
              <path
                d="M 420 230 C 420 280, 400 300, 400 320"
                fill="none"
                stroke="#4A2E16"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              {/* Arrow 4: Note 4 -> Note 5 */}
              <path
                d="M 470 370 C 500 360, 520 365, 540 370"
                fill="none"
                stroke="#4A2E16"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              {/* Arrow 5: Note 5 curving to Keep Going memo */}
              <path
                d="M 645 370 C 670 350, 680 355, 690 365"
                fill="none"
                stroke="#4A2E16"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />

              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#4A2E16" opacity="0.75" />
                </marker>
              </defs>
            </svg>

            {/* 
              PINNED BOARD CONTENT: Sticky Notes, Photographs, and Memos
              Grid & Flex layout accommodating realistic physical arrangement
            */}
            <div className="relative z-20 w-full h-full p-4 sm:p-6 overflow-y-auto column-scrollbar flex flex-wrap items-start justify-center gap-4 sm:gap-6 content-start">
              
              {/* DYNAMIC STICKY NOTES ON CORKBOARD */}
              {tasks.slice(0, 6).map((task, idx) => {
                const isDone = task.status === 'done';
                const palette = PIN_PALETTES[idx % PIN_PALETTES.length];
                const rotation = idx % 2 === 0 ? (idx === 0 ? -1.5 : 1.2) : (idx === 1 ? 0.8 : -2.0);
                const dueInfo = checkDueDate(task.dueDate);
                const project = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group interactive-item relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-pointer shadow-lg select-none"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: palette.bg,
                      boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                    }}
                    title="Click sticky note to open in full detail"
                  >
                    {/* Realistic 3D Push-Pin at Top Center */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                      <RedPushPin size={30} color={palette.pin} />
                    </div>

                    {/* Top Row: Circular Checkbox + Expand Hint */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleCheckTask(e, task)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-700 text-white' 
                            : 'border-stone-800/40 hover:border-stone-900 bg-black/5 hover:bg-black/10'
                        }`}
                        title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                      >
                        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono font-bold text-stone-700 bg-white/60 px-1 py-0.2 rounded-xs">
                        Open ↗
                      </div>
                    </div>

                    {/* Note Title in Authentic Handwriting */}
                    <div className="my-auto px-0.5">
                      <p className={`font-handwriting font-bold text-stone-900 text-base sm:text-lg leading-tight line-clamp-3 ${
                        isDone ? 'line-through opacity-55' : ''
                      }`}>
                        {task.title}
                      </p>
                    </div>

                    {/* Bottom Meta: Date & Tag Badge */}
                    <div className="pt-1 flex items-center justify-between text-[10px] font-bold border-t border-black/10">
                      <span className="text-stone-700/80 truncate max-w-[80px]">
                        {dueInfo.label || 'Today'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                        {project ? project.title : palette.tag}
                      </span>
                    </div>

                    {/* Paper Dog-Ear Curl at Bottom Right */}
                    <div className="paper-dogear-curl" />
                  </div>
                );
              })}

              {/* 
                PINNED PHOTOGRAPH 1: Mountain Alpine Landscape (Milanote Style)
                Pinned with a realistic black metal binder clip at the top!
              */}
              <div 
                onClick={() => setSelectedPhoto(mountainPhotoUrl)}
                className="interactive-item relative w-36 sm:w-40 md:w-44 bg-white p-2.5 pb-5 rounded-xs shadow-xl rotate-[1.5deg] hover:scale-105 hover:z-30 transition-all cursor-pointer group"
                style={{
                  boxShadow: '0 15px 30px -5px rgba(45, 25, 10, 0.38), 0 4px 8px rgba(0,0,0,0.15)',
                }}
                title="Mountain Alpine Inspiration (Click to view full photo)"
              >
                {/* Black Metal Binder Clip Fastener */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
                  {/* Silver Wire Loop Handle */}
                  <div className="w-5 h-4 border-2 border-stone-300 rounded-t-sm mb-[-2px]" />
                  {/* Black Triangular Metal Clip Body */}
                  <div className="w-7 h-3.5 bg-stone-900 rounded-xs shadow-xs border border-stone-800" />
                </div>

                {/* Photo Image */}
                <div className="w-full aspect-4/3 overflow-hidden rounded-2xs bg-stone-100">
                  <img 
                    src={mountainPhotoUrl} 
                    alt="Mountain Alpine Summit" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="text-center text-[10px] font-serif italic text-stone-500 pt-1.5">
                  Alpine Vision
                </div>
              </div>

              {/* 
                PINNED PHOTOGRAPH 2: City Sunset Skyline (Milanote Style)
                Fastened with semi-translucent masking tape at the top!
              */}
              <div 
                onClick={() => setSelectedPhoto(cityPhotoUrl)}
                className="interactive-item relative w-36 sm:w-40 md:w-44 bg-white p-2.5 pb-5 rounded-xs shadow-xl rotate-[-2deg] hover:scale-105 hover:z-30 transition-all cursor-pointer group"
                style={{
                  boxShadow: '0 15px 30px -5px rgba(45, 25, 10, 0.38), 0 4px 8px rgba(0,0,0,0.15)',
                }}
                title="City Sunset Skyline (Click to view full photo)"
              >
                {/* Semi-translucent Washi Masking Tape with Jagged Edges */}
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-16 h-5 shadow-xs border-y border-white/20 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(235, 185, 120, 0.85)',
                    transform: 'rotate(-1deg)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />

                {/* Photo Image */}
                <div className="w-full aspect-4/3 overflow-hidden rounded-2xs bg-stone-100">
                  <img 
                    src={cityPhotoUrl} 
                    alt="City Skyline Sunset" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="text-center text-[10px] font-serif italic text-stone-500 pt-1.5">
                  Metropolitan Focus
                </div>
              </div>

              {/* 
                CRUMPLED CRAFT PAPER MOTIVATIONAL MEMO: "Keep going! 😊"
                Torn paper edges with ballpoint ink handwriting, fastened with tape!
              */}
              <div 
                onClick={() => setIsEditingMemo(true)}
                className="interactive-item relative w-36 sm:w-40 md:w-44 p-3.5 pt-5 rounded-xs rotate-[1.5deg] shadow-lg hover:scale-105 hover:z-30 transition-all cursor-pointer select-none"
                style={{
                  backgroundColor: '#F5EBE1',
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF5EE 0%, #E8D9C8 100%)',
                  boxShadow: '0 10px 20px -3px rgba(45, 25, 10, 0.28), 0 2px 5px rgba(0,0,0,0.1)',
                }}
                title="Click to edit personal memo"
              >
                {/* Washi Masking Tape Tab */}
                <div 
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 w-14 h-4 shadow-xs border-y border-white/20 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(225, 175, 110, 0.85)',
                    transform: 'rotate(2deg)',
                  }}
                />

                {/* Memo Text in Ballpoint Handwriting */}
                {isEditingMemo ? (
                  <input
                    type="text"
                    autoFocus
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    onBlur={() => setIsEditingMemo(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingMemo(false); }}
                    className="w-full font-handwriting text-xl font-black text-stone-900 bg-transparent border-b border-black/20 outline-none text-center"
                  />
                ) : (
                  <div className="text-center py-2">
                    <p className="font-handwriting font-black text-2xl text-stone-900 leading-tight">
                      {memoText}
                    </p>
                  </div>
                )}
                <div className="text-center text-[9px] font-mono text-stone-500 opacity-60">
                  daily reflection
                </div>
              </div>

              {/* "+ Add Sticky Note" Pinboard Trigger Button */}
              <button
                type="button"
                onClick={() => onQuickAdd('todo')}
                className="interactive-item w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-xs border-2 border-dashed border-stone-800/40 hover:border-amber-900/80 bg-black/5 hover:bg-black/10 flex flex-col items-center justify-center gap-2 text-stone-800 transition-all cursor-pointer group shadow-sm"
                title="Pin a new sticky note to the corkboard"
              >
                <div className="p-2 rounded-full bg-stone-900 text-white group-hover:scale-110 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-handwriting text-base font-bold">Add Note</span>
              </button>

            </div>
          </div>
        </div>

        {/* 
          RIGHT SIDEBAR WORKSPACE PANELS & BRASS DESK LAMP
          - Upcoming panel
          - Quick Actions panel
          - Motivation Streak Card
          - Vintage Brass Desk Lamp
        */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3.5 z-20 shrink-0">
          
          {/* 1. UPCOMING PANEL */}
          <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 shadow-xl text-white">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </div>
              <span className="text-[10px] font-bold text-stone-300 opacity-75 hover:opacity-100 cursor-pointer">
                View all →
              </span>
            </div>

            <div className="space-y-2">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((t, idx) => (
                  <div 
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        idx === 0 ? 'bg-emerald-400' : idx === 1 ? 'bg-purple-400' : 'bg-blue-400'
                      }`} />
                      <span className="text-xs font-medium truncate text-stone-100">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {checkDueDate(t.dueDate).label}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-stone-100">CS251 DAA Assignment</span>
                    </div>
                    <span className="text-[10px] text-stone-400">Tomorrow</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-xs font-medium text-stone-100">NTAC Planning Meeting</span>
                    </div>
                    <span className="text-[10px] text-stone-400">Fri, 4:00 PM</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-medium text-stone-100">SemEval RETECO Review</span>
                    </div>
                    <span className="text-[10px] text-stone-400">Sat, 6:00 PM</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. QUICK ACTIONS PANEL */}
          <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 shadow-xl text-white">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 pb-2 mb-2 border-b border-white/10">
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Actions</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onQuickAdd('todo')}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold text-stone-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Add Task</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickAdd('todo')}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold text-stone-100 cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-300" />
                <span>New Note</span>
              </button>

              {onOpenNewProject && (
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold text-stone-100 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>New Project</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. MOTIVATIONAL PROGRESS PILL */}
          <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 shadow-xl flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-stone-100">You're doing great!</p>
                <p className="text-[10px] text-stone-300">Keep going, on track →</p>
              </div>
            </div>
            <span className="text-base font-black text-amber-300 font-mono">12d</span>
          </div>

          {/* 
            4. VINTAGE BRASS GOOSENECK DESK LAMP
            Click to turn light on/off with ambient illumination pool!
          */}
          <div className="flex items-center justify-end pr-2 pt-1">
            <button
              type="button"
              onClick={() => setIsLampOn(!isLampOn)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-stone-200 cursor-pointer transition"
              title="Click vintage brass lamp to toggle light"
            >
              {/* Lamp Icon with Brass Head */}
              <div className="relative">
                <div className={`w-3.5 h-3.5 rounded-full transition ${isLampOn ? 'bg-amber-300 shadow-[0_0_10px_#fde047]' : 'bg-stone-500'}`} />
              </div>
              <span>Brass Lamp: {isLampOn ? 'ON' : 'OFF'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 
        BOTTOM WOODEN DESK SURFACE & PHYSICAL ACCESSORIES
        - Polished solid teak/walnut hardwood desk
        - Center: MacBook laptop
        - Left: Stack of hardcover books ("Productivity", "Better Habits", "Big Dreams") + Ceramic pen cup
        - Left wall: Lush monstera plant foliage with sunlight filtering through
      */}
      <div 
        className="relative z-10 w-full h-14 sm:h-16 border-t-2 border-[#5C3A1A] shadow-2xl flex items-center justify-between px-6 sm:px-12 pointer-events-none select-none"
        style={{
          backgroundColor: '#4A2B11',
          backgroundImage: `
            linear-gradient(to bottom, #5C3A1A 0%, #3D220A 100%),
            radial-gradient(circle at 50% 0%, rgba(255, 230, 160, 0.25) 0%, transparent 70%)
          `,
          boxShadow: '0 -15px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left Accessories: Books & Pen Cup */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Stack of 3 Books */}
          <div className="flex flex-col gap-0.5 pb-1">
            <div className="w-24 sm:w-28 h-2.5 bg-[#2B231D] rounded-xs text-[7px] font-mono text-amber-200/90 px-1.5 flex items-center shadow-xs">
              Big Dreams
            </div>
            <div className="w-28 sm:w-32 h-2.5 bg-[#6E2E1D] rounded-xs text-[7px] font-mono text-amber-100/90 px-1.5 flex items-center shadow-xs">
              Better Habits
            </div>
            <div className="w-32 sm:w-36 h-3 bg-[#1D3A24] rounded-xs text-[7.5px] font-mono font-bold text-amber-200 px-1.5 flex items-center shadow-xs">
              Productivity
            </div>
          </div>

          {/* Ceramic Pen Cup */}
          <div className="w-7 h-9 bg-stone-200 rounded-b-sm border-t border-stone-300 shadow-md flex items-start justify-center pt-0.5 relative">
            <div className="absolute -top-3 left-1 w-1 h-4 bg-amber-600 rotate-[-12deg]" />
            <div className="absolute -top-4 left-2.5 w-1 h-5 bg-stone-800 rotate-[4deg]" />
            <div className="absolute -top-3 left-4 w-1 h-4 bg-blue-600 rotate-[15deg]" />
          </div>
        </div>

        {/* Center: MacBook Laptop Centered in Foreground */}
        <div className="flex flex-col items-center pb-1">
          {/* Laptop Lid Edge with Specular Reflection */}
          <div className="w-48 sm:w-64 h-2 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 rounded-t-sm shadow-md flex items-center justify-center">
            {/* Minimal Apple Logo Notch */}
            <div className="w-5 h-0.5 bg-stone-500 rounded-full opacity-60" />
          </div>
        </div>

        {/* Right Desk Shadow under Brass Lamp */}
        <div className="w-32 sm:w-44 flex justify-end pb-1 opacity-70 text-[9px] font-mono text-amber-200/60">
          Studio Setup • 2026
        </div>
      </div>

      {/* FULL PHOTO LIGHTBOX PREVIEW MODAL */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-2xl w-full bg-white p-3 rounded-2xl shadow-2xl relative"
          >
            <img src={selectedPhoto} alt="Preview" className="w-full max-h-[75vh] object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 p-2 bg-black/70 text-white rounded-full hover:bg-black transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

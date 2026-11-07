import React, { useState, useRef, useEffect } from 'react';
import { 
  Pin, 
  Check, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Palette, 
  Plus, 
  Calendar, 
  Type,
  Edit2,
  ShieldCheck,
  Sparkles,
  Sliders,
  AlignLeft,
  Grid,
  CircleDot,
  CheckSquare,
  FileText,
  RotateCw,
  Tag
} from 'lucide-react';
import { Task, Project, LineStyle, PinStyle } from '../types';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import { STICKY_COLORS } from '../constants/theme';
import { getPostitPaperStyle, parseColorToRgb, rgbToString, InkType } from '../utils/colorUtils';
import { RedPushPin } from './RedPushPin';
import confetti from 'canvas-confetti';

interface StickyNoteCardProps {
  task: Task;
  project?: Project;
  index: number;
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  audioEnabled: boolean;
  onDropOnItem?: (sourceId: string, targetId: string) => void;
}

const AUTHENTIC_POSTIT_COLORS = [
  { id: 'canary', name: 'Canary Yellow', hex: '#FFF380', border: '#eab308' },
  { id: 'coral', name: 'Neon Coral', hex: '#FF9AA2', border: '#f43f5e' },
  { id: 'mint', name: 'Mint Sage', hex: '#B5EAD7', border: '#10b981' },
  { id: 'sky', name: 'Sky Blue', hex: '#C7CEEA', border: '#6366f1' },
  { id: 'kraft', name: 'Kraft Brown', hex: '#E6CCB2', border: '#b45309' },
  { id: 'charcoal', name: 'Charcoal Black', hex: '#2B2B2B', border: '#52525b' },
];

const RULING_OPTIONS: { id: LineStyle; label: string; icon: string }[] = [
  { id: 'blank', label: 'Blank Matte', icon: '📄' },
  { id: 'ruled', label: 'College Ruled', icon: '📝' },
  { id: 'grid', label: 'Architect Grid', icon: '📐' },
  { id: 'dots', label: 'Bullet Dot-Grid', icon: '🔘' },
  { id: 'stencil', label: 'Checklist Stencil', icon: '☑️' },
];

const FASTENER_OPTIONS: { id: PinStyle; label: string; icon: string }[] = [
  { id: 'pin', label: '3D Push-Pin', icon: '📌' },
  { id: 'tape', label: 'Masking Tape', icon: '🏷️' },
  { id: 'adhesive', label: 'Adhesive Strip', icon: '🧴' },
];

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  task,
  project,
  index,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  audioEnabled,
  onDropOnItem,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'color' | 'ruling' | 'fastener'>('color');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [useHandwriting, setUseHandwriting] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Direct Inline Editing States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(task.notes || '');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep local inputs synced with task updates
  useEffect(() => {
    setTitleInput(task.title);
  }, [task.title]);

  useEffect(() => {
    setNotesInput(task.notes || '');
  }, [task.notes]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingNotes) {
      notesTextareaRef.current?.focus();
    }
  }, [isEditingNotes]);

  // 3D Canvas Tilt & Parallax Physics
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 3D Tilt calculation (smooth 9 degrees max)
    const tiltX = -((y - centerY) / centerY) * 8;
    const tiltY = ((x - centerX) / centerX) * 8;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setShowColorPicker(false);
  };

  const isDone = task.status === 'done';

  // Paper Materiality & Physical Properties
  const effectiveColor = task.paperColor || task.colorHex || '#FFF380';
  const paperStyle = getPostitPaperStyle(effectiveColor, task.inkType || 'auto');
  const dueInfo = checkDueDate(task.dueDate);

  const lineStyle: LineStyle = task.lineStyle || 'ruled';
  const effectivePinStyle: PinStyle = task.pinStyle || (task.isPinned || task.priority === 'urgent' ? 'pin' : task.status === 'in_progress' ? 'tape' : 'adhesive');

  // Subtle natural angle for physical post-it note aesthetic (-2.4 deg to +2.3 deg)
  const angles = [-1.5, 1.8, -0.9, 2.1, -1.8, 1.2, -2.3, 1.6];
  const naturalAngle = angles[index % angles.length];
  const currentRotation = task.rotation !== undefined ? task.rotation : naturalAngle;

  // CSS Ruling Pattern
  const rulingClass = 
    lineStyle === 'blank' ? 'paper-ruling-blank' :
    lineStyle === 'grid' ? (paperStyle.isDarkNote ? 'paper-ruling-grid-dark' : 'paper-ruling-grid') :
    lineStyle === 'dots' ? (paperStyle.isDarkNote ? 'paper-ruling-dots-dark' : 'paper-ruling-dots') :
    lineStyle === 'stencil' ? 'paper-ruling-stencil' :
    (paperStyle.isDarkNote ? 'paper-ruling-ruled-dark' : 'paper-ruling-ruled');

  // Fastener Cycling
  const handleCyclePinStyle = () => {
    const sequence: PinStyle[] = ['pin', 'tape', 'adhesive'];
    const currentIdx = sequence.indexOf(effectivePinStyle);
    const nextStyle = sequence[(currentIdx + 1) % sequence.length];
    onUpdateTask({ 
      ...task, 
      pinStyle: nextStyle,
      isPinned: nextStyle === 'pin',
    });
  };

  // Inline Title Save
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTask({ ...task, title: trimmed });
    } else {
      setTitleInput(task.title);
    }
  };

  // Inline Notes Save
  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    if (notesInput !== (task.notes || '')) {
      onUpdateTask({ ...task, notes: notesInput });
    }
  };

  const handleCompleteNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);

    if (!isDone) {
      if (audioEnabled) playCompletionSound();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: [paperStyle.hex, '#dc2626', '#1a56db', '#10b981'],
      });
    }
  };

  const handleToggleChecklistItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const updatedChecklists = task.checklists.map(c => 
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    onUpdateTask({ ...task, checklists: updatedChecklists });
    if (audioEnabled) playCompletionSound();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: 'chk_' + Math.random().toString(36).substring(2, 7),
      text: newChecklistText.trim(),
      completed: false,
    };

    onUpdateTask({
      ...task,
      checklists: [...task.checklists, newItem],
    });
    setNewChecklistText('');
    setIsAddingItem(false);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCyclePinStyle();
  };

  const handleSelectColor = (e: React.MouseEvent, colorStr: string) => {
    e.stopPropagation();
    onUpdateTask({ ...task, colorHex: colorStr, paperColor: colorStr });
  };

  const handleSelectLineStyle = (e: React.MouseEvent, style: LineStyle) => {
    e.stopPropagation();
    onUpdateTask({ ...task, lineStyle: style });
  };

  const handleSelectPinStyle = (e: React.MouseEvent, style: PinStyle) => {
    e.stopPropagation();
    onUpdateTask({ 
      ...task, 
      pinStyle: style,
      isPinned: style === 'pin',
    });
  };

  const handleSelectRotation = (e: React.MouseEvent, angle: number) => {
    e.stopPropagation();
    onUpdateTask({ ...task, rotation: angle });
  };

  const handleSelectInkType = (e: React.MouseEvent, ink: InkType) => {
    e.stopPropagation();
    onUpdateTask({ ...task, inkType: ink });
  };

  // Workflow Stage advancement (To Do -> In Progress -> Done)
  const handleAdvanceStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatusMap: Record<Task['status'], Task['status']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    const nextStatus = nextStatusMap[task.status];
    onUpdateTask({
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
    });
    if (audioEnabled) playCompletionSound();
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && onDropOnItem) {
          onDropOnItem(sourceId, task.id);
          if (audioEnabled) playCompletionSound();
        }
      }}
      onClick={() => onSelectTask(task)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(40px) scale(1.03)`
          : `rotate(${currentRotation}deg)`,
        backgroundColor: paperStyle.baseRgb,
        backgroundImage: `linear-gradient(145deg, ${paperStyle.lightRgb} 0%, ${paperStyle.baseRgb} 60%, ${paperStyle.darkRgb} 100%)`,
        borderColor: paperStyle.borderRgb,
        color: paperStyle.inkColor,
        zIndex: isDragging ? 50 : isHovered ? 40 : 1,
      }}
      className={`group relative flex flex-col justify-between w-[270px] min-h-[280px] max-w-[285px] mx-auto p-5 pt-8 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing realistic-postit paper-edge select-none ${rulingClass} ${
        isDone ? 'opacity-80' : ''
      } ${isDragging ? 'dragging-note' : ''} ${isDragOver ? 'drop-target-active' : ''}`}
    >
      {/* Dynamic Specular Light Sheen Overlay */}
      <div 
        className="specular-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
        }}
      />

      {/* Realistic Top Adhesive Band */}
      <div className={`sticky-adhesive-strip ${paperStyle.isDarkNote ? 'dark-strip' : ''}`} />

      {/* Realistic Dog-Ear Corner Curl at Bottom Right */}
      <div className="paper-dogear-curl" />

      {/* Fastener: 3D Red Pushpin OR Semi-translucent Washi Tape */}
      {effectivePinStyle === 'pin' && (
        <div 
          onClick={handleTogglePin}
          style={{
            transform: isHovered 
              ? `translateZ(34px) translate(-50%, 0) scale(1.15) rotate(${tilt.y * 0.4}deg)` 
              : 'translate(-50%, 0)',
            transition: 'transform 0.15s ease-out',
          }}
          className="absolute -top-3.5 left-1/2 z-30 cursor-pointer"
          title="📌 Pinned with Red Push-Pin (Click to switch fastener)"
        >
          <RedPushPin size={34} />
        </div>
      )}

      {effectivePinStyle === 'tape' && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleCyclePinStyle();
          }}
          className="washi-tape cursor-pointer hover:brightness-105"
          title="🏷️ Masking Tape Fastener (Click to switch fastener)"
        />
      )}

      {/* Rubber DONE Stamp on completion */}
      {isDone && (
        <div className="rubber-stamp-done select-none pointer-events-none">
          DONE
        </div>
      )}

      {/* FLOATING HOVER-ONLY GLASS TOOLBAR */}
      <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-black/20 dark:bg-black/50 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-xs">
        
        {/* Stage advancement chip (To Do -> Doing -> Done) */}
        <button
          type="button"
          onClick={handleAdvanceStage}
          className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/70 dark:bg-black/60 text-slate-800 dark:text-slate-200 hover:scale-105 transition cursor-pointer"
          title={`Stage: ${task.status}. Click to advance.`}
        >
          {task.status === 'in_progress' ? 'Doing' : task.status === 'done' ? 'Done' : 'To Do'}
        </button>

        {/* Quick Edit */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingTitle(true);
          }}
          className="p-1 rounded text-slate-800 dark:text-slate-200 hover:bg-black/10 transition cursor-pointer"
          title="Edit text inline"
        >
          <Edit2 className="w-3 h-3" />
        </button>

        {/* Font Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setUseHandwriting(!useHandwriting);
          }}
          className="p-1 rounded text-slate-800 dark:text-slate-200 hover:bg-black/10 transition cursor-pointer"
          title={useHandwriting ? 'Switch to clean sans font' : 'Switch to authentic handwriting'}
        >
          <Type className="w-3 h-3" />
        </button>

        {/* Skeuomorphic Style Customizer Popover Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 rounded text-slate-800 dark:text-slate-200 hover:bg-black/10 transition cursor-pointer"
            title="Customize paper color, ruling & fasteners"
          >
            <Palette className="w-3 h-3" />
          </button>

          {/* Skeuomorphic Style Customizer Popover */}
          {showColorPicker && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-50 p-3 bg-white dark:bg-[#1a1c24] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-64 animate-pop-in text-xs font-sans"
            >
              {/* Tabs */}
              <div className="flex items-center gap-1 p-0.5 mb-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCustomizerTab('color')}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                    customizerTab === 'color' ? 'bg-white dark:bg-slate-800 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-500'
                  }`}
                >
                  Color
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('ruling')}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                    customizerTab === 'ruling' ? 'bg-white dark:bg-slate-800 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-500'
                  }`}
                >
                  Ruling
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('fastener')}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                    customizerTab === 'fastener' ? 'bg-white dark:bg-slate-800 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-500'
                  }`}
                >
                  Fastener
                </button>
              </div>

              {/* Tab 1: Color */}
              {customizerTab === 'color' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Authentic Paper
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                      WCAG {paperStyle.wcagRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {AUTHENTIC_POSTIT_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(e) => handleSelectColor(e, c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-xl border transition-all cursor-pointer ${
                          effectiveColor.toLowerCase() === c.hex.toLowerCase() 
                            ? 'ring-2 ring-blue-500 scale-110 shadow-sm' 
                            : 'border-black/20 hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>

                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1.5 border-t border-slate-100 dark:border-white/10">
                    Ink Type
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'ballpoint_blue')}
                      className={`px-1 py-0.5 rounded border ${task.inkType === 'ballpoint_blue' ? 'bg-blue-100 text-blue-800 border-blue-400 font-bold' : 'bg-slate-50 dark:bg-white/5 text-blue-600 border-slate-200 dark:border-white/10'}`}
                    >
                      Blue
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'black')}
                      className={`px-1 py-0.5 rounded border ${task.inkType === 'black' ? 'bg-slate-800 text-white border-black font-bold' : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10'}`}
                    >
                      Black
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'white')}
                      className={`px-1 py-0.5 rounded border ${task.inkType === 'white' ? 'bg-slate-300 text-black border-slate-400 font-bold' : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'}`}
                    >
                      White
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'auto')}
                      className={`px-1 py-0.5 rounded border ${!task.inkType || task.inkType === 'auto' ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold' : 'bg-slate-50 dark:bg-white/5 text-slate-600 border-slate-200 dark:border-white/10'}`}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Ruling Pattern */}
              {customizerTab === 'ruling' && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Paper Pattern
                  </span>
                  {RULING_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => handleSelectLineStyle(e, opt.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer ${
                        lineStyle === opt.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                      {lineStyle === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 3: Fasteners & Angle */}
              {customizerTab === 'fastener' && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Wall Fastener
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {FASTENER_OPTIONS.map(fastener => (
                      <button
                        key={fastener.id}
                        type="button"
                        onClick={(e) => handleSelectPinStyle(e, fastener.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                          effectivePinStyle === fastener.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-200 font-bold'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base mb-0.5">{fastener.icon}</span>
                        <span className="text-[9px] leading-tight">{fastener.label}</span>
                      </button>
                    ))}
                  </div>

                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1.5 border-t border-slate-100 dark:border-white/10">
                    Human Angle
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    {[-2.2, 0, 2.2].map(deg => (
                      <button
                        key={deg}
                        type="button"
                        onClick={(e) => handleSelectRotation(e, deg)}
                        className={`flex-1 py-1 rounded-lg border text-[10px] font-mono font-bold transition cursor-pointer ${
                          currentRotation === deg
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600'
                        }`}
                      >
                        {deg > 0 ? `+${deg}°` : `${deg}°`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        const randomDeg = parseFloat(((Math.random() * 4.6) - 2.3).toFixed(1));
                        handleSelectRotation(e, randomDeg);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Randomize human angle"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stopwatch Timer */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTimer(task.id);
          }}
          className={`p-1 rounded transition cursor-pointer ${
            task.isTimerRunning ? 'text-rose-600 animate-pulse' : 'text-slate-800 dark:text-slate-200 hover:bg-black/10'
          }`}
          title={task.isTimerRunning ? 'Pause timer' : 'Start focus timer'}
        >
          {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="p-1 rounded text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition cursor-pointer"
          title="Discard note"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* PURE HANDWRITTEN POST-IT NOTE FACE */}
      <div className="flex-1 min-w-0">
        
        {/* Note Title (Handwritten) */}
        {isEditingTitle ? (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSaveTitle(); }}
            onClick={(e) => e.stopPropagation()}
            className="mb-2"
          >
            <input
              ref={titleInputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setTitleInput(task.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full p-1 text-2xl font-handwriting bg-white/70 dark:bg-black/30 border border-blue-500 rounded focus:outline-none"
              style={{ color: paperStyle.inkColor }}
            />
          </form>
        ) : (
          <h3 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className={`text-2xl sm:text-[26px] font-bold leading-tight break-words cursor-text transition rounded px-0.5 ${
              useHandwriting ? 'font-handwriting' : 'font-sans text-lg font-bold'
            } ${lineStyle === 'ruled' || lineStyle === 'stencil' ? 'leading-[28px]' : ''} ${isDone ? 'marker-strike opacity-60' : ''}`}
            style={{ color: paperStyle.inkColor }}
            title="Click to edit title"
          >
            {task.title || 'Untitled Post-it'}
          </h3>
        )}

        {/* Note Body / Thoughts (Handwritten) */}
        {isEditingNotes ? (
          <div onClick={(e) => e.stopPropagation()} className="mt-1">
            <textarea
              ref={notesTextareaRef}
              rows={3}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              onBlur={handleSaveNotes}
              className={`w-full p-1.5 text-lg font-handwriting bg-white/70 dark:bg-black/30 border border-blue-500 rounded focus:outline-none resize-none ${
                lineStyle === 'ruled' || lineStyle === 'stencil' ? 'leading-[28px]' : ''
              }`}
              style={{ color: paperStyle.inkColor }}
              placeholder="Jot down notes in ink..."
            />
          </div>
        ) : (
          <p 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingNotes(true);
            }}
            className={`text-base sm:text-lg mt-1 line-clamp-4 leading-snug break-words font-medium cursor-text opacity-90 transition rounded px-0.5 ${
              useHandwriting ? 'font-handwriting' : 'font-sans text-xs'
            } ${lineStyle === 'ruled' || lineStyle === 'stencil' ? 'leading-[28px]' : ''}`}
            style={{ color: paperStyle.inkColor }}
            title="Click to edit notes"
          >
            {task.notes || <span className="opacity-30 italic text-sm">Write notes here...</span>}
          </p>
        )}

        {/* Hand-drawn Checklist Subtasks */}
        {task.checklists.length > 0 && (
          <div className="space-y-1 mt-2.5 pt-2 border-t border-black/10 dark:border-white/10">
            {task.checklists.map(c => (
              <div 
                key={c.id} 
                onClick={(e) => handleToggleChecklistItem(e, c.id)}
                className="flex items-center gap-2 group/item cursor-pointer"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-xs border flex items-center justify-center transition-colors shrink-0 bg-white/40"
                  style={{ borderColor: paperStyle.inkColor }}
                >
                  {c.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span 
                  className={`text-base leading-tight ${
                    useHandwriting ? 'font-handwriting' : 'text-xs'
                  } ${c.completed ? 'line-through opacity-55' : ''}`}
                  style={{ color: paperStyle.inkColor }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick inline checklist item creator */}
        {isAddingItem ? (
          <form 
            onSubmit={handleAddChecklistItem}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 mt-2"
          >
            <input
              type="text"
              autoFocus
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Write subtask..."
              className="flex-1 px-1.5 py-0.5 text-base font-handwriting bg-white/70 dark:bg-black/30 rounded border focus:outline-none"
              style={{ color: paperStyle.inkColor, borderColor: paperStyle.borderRgb }}
            />
            <button 
              type="submit" 
              className="px-2 py-0.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-[10px] rounded font-bold"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingItem(true);
            }}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition flex items-center gap-1 text-sm font-handwriting hover:underline cursor-pointer mt-1"
            style={{ color: paperStyle.inkColor }}
          >
            <Plus className="w-3 h-3" />
            <span>+ add item</span>
          </button>
        )}
      </div>

      {/* NATURAL PAPER BOTTOM MARGIN (Subtle hand-written annotations) */}
      <div 
        className="pt-2 flex items-center justify-between text-[11px] font-handwriting font-bold opacity-75 select-none"
        style={{ color: paperStyle.inkColor }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {dueInfo.label && (
            <span className="flex items-center gap-0.5">
              <span>📅 {dueInfo.label}</span>
            </span>
          )}

          {project && (
            <span className="opacity-90">
              📁 {project.title}
            </span>
          )}

          {task.tags.slice(0, 2).map(tag => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        {/* Stopwatch indicator if running */}
        {task.timeSpentSeconds > 0 && (
          <span className="font-mono text-[9px] opacity-80">
            ⏱ {formatDuration(task.timeSpentSeconds)}
          </span>
        )}
      </div>

    </div>
  );
};

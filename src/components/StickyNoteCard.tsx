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
  Sparkles
} from 'lucide-react';
import { Task, Project } from '../types';
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
    const tiltX = -((y - centerY) / centerY) * 9;
    const tiltY = ((x - centerX) / centerX) * 9;

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
  // HCI & WCAG Contrast Compliant Paper & Ink Styling
  const paperStyle = getPostitPaperStyle(task.colorHex, task.inkType || 'auto');
  const dueInfo = checkDueDate(task.dueDate);

  // Subtle natural angle for physical post-it note aesthetic (-1.3 deg to +1.4 deg)
  const angles = [-1.2, 0.9, -0.6, 1.3, -0.9, 0.7, -1.4];
  const naturalAngle = angles[index % angles.length];

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
        particleCount: 30,
        spread: 55,
        origin: { y: 0.75 },
        colors: [paperStyle.hex, '#dc2626', '#1a56db'],
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
    onUpdateTask({ ...task, isPinned: !task.isPinned });
  };

  const handleSelectColor = (e: React.MouseEvent, colorStr: string) => {
    e.stopPropagation();
    onUpdateTask({ ...task, colorHex: colorStr });
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
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(40px) scale(1.04)`
          : `rotate(${naturalAngle}deg)`,
        backgroundColor: paperStyle.baseRgb,
        backgroundImage: `linear-gradient(145deg, ${paperStyle.lightRgb} 0%, ${paperStyle.baseRgb} 60%, ${paperStyle.darkRgb} 100%)`,
        borderColor: paperStyle.borderRgb,
        color: paperStyle.inkColor,
        zIndex: isDragging ? 50 : isHovered ? 40 : 1,
      }}
      className={`group relative flex flex-col justify-between w-[270px] min-h-[270px] max-w-[280px] mx-auto p-5 pt-8 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing realistic-postit paper-edge select-none ${
        isDone ? 'opacity-70' : ''
      } ${isDragging ? 'dragging-note' : ''} ${isDragOver ? 'drop-target-active' : ''}`}
    >
      {/* Dynamic Specular Light Sheen Overlay */}
      <div 
        className="specular-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
        }}
      />

      {/* 3D Red Pushpin at Top Center */}
      <div 
        onClick={handleTogglePin}
        style={{
          transform: isHovered 
            ? `translateZ(34px) translate(-50%, 0) scale(1.15) rotate(${tilt.y * 0.4}deg)` 
            : 'translate(-50%, 0)',
          transition: 'transform 0.15s ease-out',
        }}
        className="absolute -top-3.5 left-1/2 z-30 cursor-pointer"
        title={task.isPinned ? '📌 Pinned to wall (Click to unpin)' : 'Click to pin note'}
      >
        <RedPushPin size={34} />
      </div>

      {/* FLOATING HOVER-ONLY GLASS TOOLBAR (Clean & Invisible until hovered) */}
      <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-black/15 dark:bg-black/35 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-xs">
        
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

        {/* Color Palette Popover Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 rounded text-slate-800 dark:text-slate-200 hover:bg-black/10 transition cursor-pointer"
            title="Change paper color & ink"
          >
            <Palette className="w-3 h-3" />
          </button>

          {/* Color Picker Popover */}
          {showColorPicker && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-50 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-56 animate-pop-in text-xs"
            >
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-[10px] uppercase text-slate-500">Paper Color</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                  WCAG {paperStyle.wcagRating}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {STICKY_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => handleSelectColor(e, c.colorHex)}
                    style={{ backgroundColor: c.colorHex }}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      task.colorHex === c.colorHex ? 'ring-2 ring-blue-500 scale-110 shadow-sm' : 'border-black/15'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Ink choice */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={(e) => handleSelectInkType(e, 'ballpoint_blue')}
                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-300"
                >
                  Blue Ink
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSelectInkType(e, 'black')}
                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-bold border border-slate-300"
                >
                  Black Ink
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSelectInkType(e, 'auto')}
                  className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-semibold"
                >
                  Auto
                </button>
              </div>
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
            } ${isDone ? 'line-through opacity-60' : ''}`}
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
              className="w-full p-1.5 text-lg font-handwriting bg-white/70 dark:bg-black/30 border border-blue-500 rounded focus:outline-none resize-none"
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
            }`}
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

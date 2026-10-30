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
  Moon, 
  Type,
  Edit2,
  CheckCircle2,
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

  const [isDoneState, setIsDoneState] = useState(false);
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

    // 3D Tilt calculation (max 12 degrees)
    const tiltX = -((y - centerY) / centerY) * 12;
    const tiltY = ((x - centerX) / centerX) * 12;

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
  };

  const isDone = task.status === 'done';
  // HCI & WCAG Contrast Compliant Paper & Ink Styling
  const paperStyle = getPostitPaperStyle(task.colorHex, task.inkType || 'auto');
  const dueInfo = checkDueDate(task.dueDate);

  // Subtle natural angle for post-it note aesthetic (-1.8 deg to +1.8 deg)
  const angles = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.8];
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
        particleCount: 35,
        spread: 60,
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

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const hex = e.target.value;
    const rgb = parseColorToRgb(hex);
    onUpdateTask({ ...task, colorHex: rgbToString(rgb) });
  };

  const handleSelectInkType = (e: React.MouseEvent, ink: InkType) => {
    e.stopPropagation();
    onUpdateTask({ ...task, inkType: ink });
  };

  const handleAdvanceStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: Task['status'] = 'todo';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'done';
    else nextStatus = 'todo';

    onUpdateTask({
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
    });
    if (nextStatus === 'done' && audioEnabled) playCompletionSound();
  };

  return (
    <div
      draggable={!isEditingTitle && !isEditingNotes}
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
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(48px) scale(1.05)`
          : `rotate(${naturalAngle}deg)`,
        backgroundColor: paperStyle.baseRgb,
        backgroundImage: `linear-gradient(135deg, ${paperStyle.lightRgb} 0%, ${paperStyle.baseRgb} 55%, ${paperStyle.darkRgb} 100%)`,
        borderColor: paperStyle.borderRgb,
        color: paperStyle.inkColor, // Direct HCI color application
        zIndex: isDragging ? 50 : isHovered ? 40 : 1,
      }}
      className={`group relative flex flex-col justify-between p-5 pt-7 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing realistic-postit paper-edge ${
        isDone ? 'opacity-65 grayscale-20' : ''
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
            ? `translateZ(36px) translate(-50%, 0) scale(1.15) rotate(${tilt.y * 0.4}deg)` 
            : 'translate(-50%, 0)',
          transition: 'transform 0.15s ease-out',
        }}
        className="absolute -top-3.5 left-1/2 z-30 cursor-pointer"
        title={task.isPinned ? '📌 Pinned to top (Click to unpin)' : 'Click to pin note'}
      >
        <RedPushPin size={34} />
      </div>

      {/* Top Bar: Controls, Stage, Project, and Color/HCI Picker */}
      <div className="flex items-center justify-between gap-1 mb-3 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Trello Workflow Stage Badge */}
          <button
            type="button"
            onClick={handleAdvanceStage}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/10 dark:bg-black/30 hover:bg-black/20 text-current transition cursor-pointer"
            title="Advance stage (To Do → Doing → Done)"
          >
            {task.status === 'in_progress' ? 'Doing' : task.status}
          </button>

          {/* Project tag if assigned */}
          {project && (
            <span 
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border bg-black/5 dark:bg-black/20"
              style={{ borderColor: `${project.colorHex}60` }}
            >
              {project.title}
            </span>
          )}
        </div>

        {/* Right tools: Direct Edit + Font Toggle + HCI Color Picker Trigger */}
        <div className="flex items-center gap-1">
          {/* Quick Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="p-1 rounded-md transition opacity-60 hover:opacity-100 hover:bg-black/10 cursor-pointer text-xs"
            title="Edit note text inline"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Handwriting / Sans Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUseHandwriting(!useHandwriting);
            }}
            className="p-1 rounded-md transition opacity-60 hover:opacity-100 hover:bg-black/10 cursor-pointer text-xs"
            title={useHandwriting ? 'Switch to clean modern font' : 'Switch to authentic handwriting ink'}
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {/* HCI RGB Color Palette Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 rounded-md transition opacity-60 hover:opacity-100 hover:bg-black/10 cursor-pointer"
              title="Change note color & ink (HCI contrast)"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* HCI RGB Color & Contrast Popover */}
            {showColorPicker && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-30 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-60 animate-pop-in text-xs"
              >
                {/* Header & Live WCAG Contrast Ratio */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500">Color & Contrast</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    paperStyle.wcagRating === 'AAA' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>WCAG {paperStyle.wcagRating} ({paperStyle.contrastRatio}:1)</span>
                  </span>
                </div>

                {/* Preset RGB Swatches */}
                <div className="mb-3">
                  <span className="block text-[10px] text-slate-400 font-semibold mb-1">Paper RGB Preset:</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {STICKY_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(e) => handleSelectColor(e, c.rgb)}
                        style={{ backgroundColor: c.rgb }}
                        className={`w-8 h-8 rounded-xl border border-black/15 transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                          task.colorHex === c.rgb || task.colorHex === c.colorHex ? 'ring-2 ring-blue-600 scale-105' : ''
                        }`}
                        title={`${c.name} (${c.rgb})`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom RGB Color Picker */}
                <div className="mb-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300">Custom RGB Color:</span>
                    <span className="text-[9px] font-mono text-slate-400">{paperStyle.baseRgb}</span>
                  </div>
                  <input
                    type="color"
                    value={paperStyle.hex}
                    onChange={handleCustomColorChange}
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    title="Pick any custom RGB color"
                  />
                </div>

                {/* HCI Ink Color Selector */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Text Ink Color:</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'auto')}
                      className={`px-1.5 py-1 rounded-lg border text-center font-bold cursor-pointer transition ${
                        (task.inkType || 'auto') === 'auto'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                      title="Auto HCI contrast calculation"
                    >
                      ⚡ Auto
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'ballpoint_blue')}
                      className={`px-1.5 py-1 rounded-lg border text-center font-bold cursor-pointer transition ${
                        task.inkType === 'ballpoint_blue'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                      title="Classic Blue Ballpoint"
                    >
                      🔵 Blue
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'black')}
                      className={`px-1.5 py-1 rounded-lg border text-center font-bold cursor-pointer transition ${
                        task.inkType === 'black'
                          ? 'bg-slate-100 border-slate-900 text-slate-900 dark:bg-slate-800 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                      title="Jet Black Pen"
                    >
                      ⚫ Black
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectInkType(e, 'white')}
                      className={`px-1.5 py-1 rounded-lg border text-center font-bold cursor-pointer transition ${
                        task.inkType === 'white'
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                      title="White Chalk / Gel Pen"
                    >
                      ⚪ White
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Title & Body with DIRECT INLINE EDITING */}
      <div className="mb-3">
        <div className="flex items-start gap-2.5">
          {/* Checkbox Complete Toggle */}
          <button
            type="button"
            onClick={handleCompleteNote}
            className="w-5 h-5 mt-1 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer bg-white/40 dark:bg-black/30"
            style={{ borderColor: paperStyle.inkColor }}
            title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            {/* Inline Title Editor */}
            {isEditingTitle ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSaveTitle(); }}
                onClick={(e) => e.stopPropagation()}
                className="mb-1"
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
                  className={`w-full px-2 py-0.5 rounded-lg border border-blue-500/50 bg-white/70 dark:bg-black/40 text-xl sm:text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    useHandwriting ? 'font-handwriting' : 'font-sans'
                  }`}
                  style={{ color: paperStyle.inkColor }}
                  placeholder="Note Title..."
                />
              </form>
            ) : (
              <h3 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className={`text-xl sm:text-2xl font-bold leading-tight break-words cursor-text rounded-md hover:bg-black/5 dark:hover:bg-white/5 px-1 -mx-1 transition ${
                  useHandwriting ? 'font-handwriting' : 'font-sans'
                } ${isDone ? 'line-through opacity-60' : ''}`}
                style={{ color: paperStyle.inkColor }}
                title="Click to edit title"
              >
                {task.title || 'Untitled Post-it'}
              </h3>
            )}

            {/* Inline Notes Body Editor */}
            {isEditingNotes ? (
              <div onClick={(e) => e.stopPropagation()} className="mt-1">
                <textarea
                  ref={notesTextareaRef}
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  onBlur={handleSaveNotes}
                  className={`w-full p-2 rounded-lg border border-blue-500/50 bg-white/70 dark:bg-black/40 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none ${
                    useHandwriting ? 'font-handwriting' : 'font-sans text-xs'
                  }`}
                  style={{ color: paperStyle.inkColor }}
                  placeholder="Jot down notes or thoughts..."
                />
              </div>
            ) : (
              <p 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingNotes(true);
                }}
                className={`text-base sm:text-lg mt-1 line-clamp-4 leading-snug break-words font-medium cursor-text rounded-md hover:bg-black/5 dark:hover:bg-white/5 px-1 -mx-1 transition opacity-90 ${
                  useHandwriting ? 'font-handwriting' : 'font-sans text-xs'
                }`}
                style={{ color: paperStyle.inkColor }}
                title="Click to edit notes"
              >
                {task.notes || <span className="opacity-40 italic text-sm">Click to add notes...</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Direct In-Card Checklist */}
      {task.checklists.length > 0 && (
        <div className="space-y-1.5 my-2 pt-2 border-t border-black/10 dark:border-white/10">
          {task.checklists.map(c => (
            <div 
              key={c.id} 
              onClick={(e) => handleToggleChecklistItem(e, c.id)}
              className="flex items-center gap-2 group/item cursor-pointer"
            >
              <div 
                className="w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 bg-white/30"
                style={{ borderColor: paperStyle.inkColor }}
              >
                {c.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span 
                className={`text-base sm:text-lg leading-none ${
                  useHandwriting ? 'font-handwriting' : 'text-xs'
                } ${c.completed ? 'line-through opacity-50' : ''}`}
                style={{ color: paperStyle.inkColor }}
              >
                {c.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask */}
      {isAddingItem ? (
        <form onSubmit={handleAddChecklistItem} onClick={(e) => e.stopPropagation()} className="my-1.5 flex gap-1">
          <input
            type="text"
            autoFocus
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            placeholder="Add subtask item..."
            className="flex-1 px-2.5 py-1 text-base font-handwriting bg-white/80 dark:bg-black/40 rounded-lg border focus:outline-none"
            style={{ color: paperStyle.inkColor, borderColor: paperStyle.borderRgb }}
          />
          <button 
            type="submit" 
            className="px-2.5 py-1 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs rounded-lg font-bold"
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
          className="flex items-center gap-1 text-sm font-handwriting hover:underline opacity-70 hover:opacity-100 transition cursor-pointer mt-1 mb-2"
          style={{ color: paperStyle.inkColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add subtask</span>
        </button>
      )}

      {/* Bottom Footer: Due Date, Focus Stopwatch & Delete */}
      <div 
        className="pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-1 text-xs"
        style={{ color: paperStyle.inkColor }}
      >
        {/* Due Date & Evening */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {dueInfo.label && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              dueInfo.isOverdue 
                ? 'bg-rose-600 text-white' 
                : dueInfo.isToday 
                ? 'bg-amber-500 text-slate-900' 
                : 'bg-black/10 dark:bg-white/15'
            }`}>
              <Calendar className="w-2.5 h-2.5" />
              <span>{dueInfo.label}</span>
            </span>
          )}

          {task.isThisEvening && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
              <Moon className="w-2.5 h-2.5" />
              <span>Evening</span>
            </span>
          )}

          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[11px] font-handwriting font-bold opacity-80">
              #{tag}
            </span>
          ))}
        </div>

        {/* Stopwatch & Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTimer(task.id);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono transition cursor-pointer ${
              task.isTimerRunning
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20'
            }`}
            title={task.isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
          >
            {task.isTimerRunning ? (
              <Pause className="w-2.5 h-2.5 fill-white" />
            ) : (
              <Play className="w-2.5 h-2.5" />
            )}
            <span>{formatDuration(task.timeSpentSeconds)}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition rounded-md cursor-pointer"
            title="Discard Post-it Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

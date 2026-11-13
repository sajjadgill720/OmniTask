import { useDialog } from '../utils/useDialog';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Moon,
  Tag as TagIcon,
  Folder,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Play,
  Pause,
  Pin,
  Palette,
  Check,
  Edit2,
  Flag
} from 'lucide-react';
import { Task, Project, Area, Priority, ChecklistItem, LineStyle, PinStyle } from '../types';
import { formatDuration, generateId, checkDueDate } from '../utils/storage';
import { STICKY_COLORS } from '../constants/theme';
import { getPostitPaperStyle, InkType } from '../utils/colorUtils';
import { RedPushPin } from './RedPushPin';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface TaskDetailDrawerProps {
  task: Task | null;
  projects: Project[];
  areas: Area[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Task) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
}

const AUTHENTIC_POSTIT_COLORS = [
  { id: 'canary', name: 'Canary Yellow', hex: '#FFF380' },
  { id: 'sage', name: 'Sage Green', hex: '#A8C3B2' },
  { id: 'coral', name: 'Neon Coral', hex: '#FF9AA2' },
  { id: 'mint', name: 'Mint Sage', hex: '#B5EAD7' },
  { id: 'sky', name: 'Sky Blue', hex: '#C7CEEA' },
  { id: 'kraft', name: 'Kraft Brown', hex: '#E6CCB2' },
  { id: 'charcoal', name: 'Charcoal Black', hex: '#2B2B2B' },
];

const RULING_OPTIONS: { id: LineStyle; label: string; icon: string }[] = [
  { id: 'ruled', label: 'College Ruled', icon: '📝' },
  { id: 'lines', label: 'Clean Ruled', icon: '📜' },
  { id: 'blank', label: 'Blank Matte', icon: '📄' },
  { id: 'grid', label: 'Architect Grid', icon: '📐' },
  { id: 'dots', label: 'Dot Grid', icon: '🔘' },
];

const TaskDetailDrawerBody: React.FC<TaskDetailDrawerProps> = ({
  task,
  projects,
  areas,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onToggleTimer,
}) => {
  const dialogRef = useDialog(onClose);

  const [formData, setFormData] = useState<Task>({ ...task });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(task.notes || '');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'color' | 'ruling' | 'fastener'>('color');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFormData({ ...task });
    if (!isEditingTitle) setTitleInput(task.title);
    if (!isEditingNotes) setNotesInput(task.notes || '');
  }, [task]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  // Paper styling
  const effectiveColor = formData.paperColor || formData.colorHex || '#FFF380';
  const paperStyle = getPostitPaperStyle(effectiveColor, formData.inkType || 'auto');
  const lineStyle: LineStyle = formData.lineStyle || 'ruled';
  const effectivePinStyle: PinStyle = formData.pinStyle || (formData.isPinned || formData.priority === 'urgent' ? 'pin' : formData.status === 'in_progress' ? 'tape' : 'pin');
  const isDone = formData.status === 'done';
  const dueInfo = checkDueDate(formData.dueDate);

  // CSS Ruling Pattern
  const rulingClass =
    lineStyle === 'blank' ? 'paper-ruling-blank' :
    lineStyle === 'lines' ? (paperStyle.isDarkNote ? 'paper-ruling-lines-dark' : 'paper-ruling-lines') :
    lineStyle === 'grid' ? (paperStyle.isDarkNote ? 'paper-ruling-grid-dark' : 'paper-ruling-grid') :
    lineStyle === 'dots' ? (paperStyle.isDarkNote ? 'paper-ruling-dots-dark' : 'paper-ruling-dots') :
    (paperStyle.isDarkNote ? 'paper-ruling-ruled-dark' : 'paper-ruling-ruled');

  const updateField = (field: keyof Task, val: any) => {
    const updated = { ...formData, [field]: val, updatedAt: new Date().toISOString() };
    setFormData(updated);
    onSave(updated);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== formData.title) {
      updateField('title', trimmed);
    } else {
      setTitleInput(formData.title);
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    if (notesInput !== (formData.notes || '')) {
      updateField('notes', notesInput);
    }
  };

  const handleToggleChecklist = (id: string) => {
    const updated = {
      ...formData,
      checklists: formData.checklists.map(c =>
        c.id === id ? { ...c, completed: !c.completed } : c
      ),
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleAddChecklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: generateId(),
      text: newChecklistText.trim(),
      completed: false,
    };

    const updated = {
      ...formData,
      checklists: [...formData.checklists, newItem],
    };
    setFormData(updated);
    onSave(updated);
    setNewChecklistText('');
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = {
      ...formData,
      checklists: formData.checklists.filter(c => c.id !== id),
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = newTagText.trim().replace(/^#/, '');
      if (val && !formData.tags.includes(val)) {
        const updated = {
          ...formData,
          tags: [...formData.tags, val],
        };
        setFormData(updated);
        onSave(updated);
      }
      setNewTagText('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updated = {
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleAdvanceStage = () => {
    const nextStatusMap: Record<Task['status'], Task['status']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    const nextStatus = nextStatusMap[formData.status];
    const updated = { ...formData, status: nextStatus, isTimerRunning: nextStatus === 'done' ? false : formData.isTimerRunning, completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined };
    setFormData(updated); onSave(updated);
    if (nextStatus === 'done') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: [paperStyle.hex, '#dc2626', '#1a56db', '#10b981'],
      });
    }
  };

  return (
    /* Ambient Blur Backdrop with Centered Hyperrealistic Sticky Note */
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="TaskDetail" tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in"
    >
      {/*
        HYPERREALISTIC FULL STICKY NOTE MODAL
        - Real paper gradients, specular light sheen, top adhesive band, paper curl
        - Fastener: 3D Red Pushpin or Masking Tape
        - Pure handwriting ink, ruled lines, interactive hand-drawn checkboxes
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: paperStyle.baseRgb,
          backgroundImage: `linear-gradient(145deg, ${paperStyle.lightRgb} 0%, ${paperStyle.baseRgb} 60%, ${paperStyle.darkRgb} 100%)`,
          borderColor: paperStyle.borderRgb,
          color: paperStyle.inkColor,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.15)',
        }}
        className={`relative w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between p-6 pt-9 border transition-all duration-200 realistic-postit paper-edge select-none animate-scale-in ${rulingClass}`}
      >
        {/* Dynamic Specular Light Sheen Overlay */}
        <div className="specular-glare" />

        {/* Realistic Top Adhesive Band */}
        <div className={`sticky-adhesive-strip ${paperStyle.isDarkNote ? 'dark-strip' : ''}`} />

        {/* Realistic Dog-Ear Corner Curl at Bottom Right */}
        <div className="paper-dogear-curl" />

        {/* Fastener: 3D Red Pushpin OR Semi-translucent Masking Tape */}
        {effectivePinStyle === 'pin' ? (
          <div
            onClick={() => updateField('pinStyle', 'tape')}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 cursor-pointer drop-shadow-md hover:scale-110 transition-transform"
            title="📌 3D Red Pushpin (Click to switch to masking tape)"
          >
            <RedPushPin size={38} />
          </div>
        ) : (
          <div
            onClick={() => updateField('pinStyle', 'pin')}
            className="washi-tape cursor-pointer hover:brightness-105"
            title="🏷️ Masking Tape Fastener (Click to switch to 3D pushpin)"
          />
        )}

        {/* Diagonal Rubber DONE Stamp if Completed */}
        {isDone && (
          <div className="rubber-stamp-done select-none pointer-events-none">
            DONE
          </div>
        )}

        {/* FLOATING TOP GLASS CONTROLS BAR */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/10 dark:border-white/10 relative z-20">

          {/* Left: Stage Pill & Focus Stopwatch Timer */}
          <div className="flex items-center gap-2">
            {/* Stage Advancement Button */}
            <button
              type="button"
              onClick={handleAdvanceStage}
              className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-black/15 dark:bg-white/15 hover:bg-black/25 transition cursor-pointer flex items-center gap-1 shadow-xs"
              title="Click to cycle stage (To Do -> In Progress -> Done)"
            >
              <span>{formData.status === 'in_progress' ? 'Doing' : formData.status === 'done' ? 'Done ✓' : 'To Do'}</span>
            </button>

            {/* Stopwatch Focus Timer */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/10 dark:bg-white/10 rounded-xl text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span>{formatDuration(formData.timeSpentSeconds)}</span>
              <button
                type="button"
                onClick={() => onToggleTimer(formData.id)}
                className={`p-0.5 rounded cursor-pointer ${
                  formData.isTimerRunning ? 'text-rose-600 animate-pulse' : 'hover:opacity-100 opacity-70'
                }`}
                title={formData.isTimerRunning ? 'Pause timer' : 'Start focus timer'}
              >
                {formData.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Right: Customizer, Font Toggle, Pin, Delete, Close */}
          <div className="flex items-center gap-1">
            {/* Skeuomorphic Style Customizer Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer opacity-75 hover:opacity-100"
                title="Customize paper color & lines"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Style Customizer Popover */}
              {showColorPicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-50 p-3 bg-white dark:bg-[#1C1917] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/15 w-64 animate-pop-in text-xs font-sans"
                >
                  <div className="flex items-center gap-1 p-0.5 mb-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCustomizerTab('color')}
                      className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                        customizerTab === 'color' ? 'bg-white dark:bg-stone-800 shadow-xs text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomizerTab('ruling')}
                      className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                        customizerTab === 'ruling' ? 'bg-white dark:bg-stone-800 shadow-xs text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      Lines
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomizerTab('fastener')}
                      className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                        customizerTab === 'fastener' ? 'bg-white dark:bg-stone-800 shadow-xs text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      Pin
                    </button>
                  </div>

                  {/* Tab 1: Colors */}
                  {customizerTab === 'color' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Paper Palette
                      </span>
                      <div className="grid grid-cols-7 gap-1.5">
                        {AUTHENTIC_POSTIT_COLORS.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              updateField('colorHex', c.hex);
                              updateField('paperColor', c.hex);
                            }}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-lg border transition-all cursor-pointer ${
                              effectiveColor.toLowerCase() === c.hex.toLowerCase()
                                ? 'ring-2 ring-stone-900 scale-110 shadow-xs'
                                : 'border-black/20 hover:scale-105'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Ruling */}
                  {customizerTab === 'ruling' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Paper Pattern
                      </span>
                      {RULING_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateField('lineStyle', opt.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg border text-left transition cursor-pointer ${
                            lineStyle === opt.id
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-200 font-bold'
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          {lineStyle === opt.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: Fasteners */}
                  {customizerTab === 'fastener' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('pinStyle', 'pin')}
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer ${
                          effectivePinStyle === 'pin'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 font-bold'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <span className="text-xl">📌</span>
                        <span className="text-[10px] mt-1">3D Push-Pin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('pinStyle', 'tape')}
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer ${
                          effectivePinStyle === 'tape'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 font-bold'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <span className="text-xl">🏷️</span>
                        <span className="text-[10px] mt-1">Masking Tape</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pin to Top */}
            <button
              type="button"
              onClick={() => updateField('isPinned', !formData.isPinned)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                formData.isPinned ? 'text-amber-600 bg-black/10' : 'opacity-75 hover:opacity-100 hover:bg-black/10'
              }`}
              title={formData.isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className={`w-4 h-4 ${formData.isPinned ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Delete note */}
            <button
              type="button"
              onClick={() => {
                onDelete(formData.id);
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition cursor-pointer opacity-75 hover:opacity-100"
              title="Discard sticky note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose} aria-label="Close TaskDetailDrawer "
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer opacity-75 hover:opacity-100 ml-1"
              title="Close detailed sticky note"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE INK NOTE FACE (Ruled Paper lines, Checklists, Notes) */}
        <div className="flex-1 overflow-y-auto pr-2 column-scrollbar space-y-3 relative z-10">

          {/* Note Title (Handwritten in Ink) */}
          {isEditingTitle ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTitle(); }} className="mb-2">
              <input
                ref={titleInputRef}
                aria-label="Note title"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                className="w-full p-1 text-2xl sm:text-3xl font-handwriting font-bold bg-white/70 dark:bg-black/30 border border-blue-500 rounded focus:outline-none"
                style={{ color: paperStyle.inkColor }}
              />
            </form>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsEditingTitle(true); } }}
              className={`text-2xl sm:text-3xl font-bold leading-tight break-words cursor-text transition rounded px-0.5 tracking-wide ${
                'font-handwriting'
              } ${lineStyle === 'ruled' || lineStyle === 'lines' ? 'leading-[32px]' : ''} ${isDone ? 'marker-strike opacity-60' : ''}`}
              style={{ color: paperStyle.inkColor }}
              title="Click to edit title"
            >
              {formData.title || 'Untitled Post-it'}
            </h3>
          )}

          {/* Note Body / Thoughts (Handwritten in Ink on Ruled Lines) */}
          {isEditingNotes ? (
            <div className="mt-1">
              <textarea
                ref={notesTextareaRef}
                aria-label="Note details"
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                onBlur={handleSaveNotes}
                className={`w-full p-2 text-lg font-handwriting bg-white/70 dark:bg-black/30 border border-blue-500 rounded focus:outline-none resize-none ${
                  lineStyle === 'ruled' || lineStyle === 'lines' ? 'leading-[32px]' : ''
                }`}
                style={{ color: paperStyle.inkColor }}
                placeholder="Jot down notes in ink..."
              />
            </div>
          ) : (
            <p
              onClick={() => setIsEditingNotes(true)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsEditingNotes(true); } }}
              className={`text-lg sm:text-xl mt-1 leading-snug break-words font-medium cursor-text opacity-90 transition rounded px-0.5 ${
                'font-handwriting'
              } ${lineStyle === 'ruled' || lineStyle === 'lines' ? 'leading-[30px]' : ''}`}
              style={{ color: paperStyle.inkColor }}
              title="Click to edit notes"
            >
              {formData.notes || <span className="opacity-35 italic text-base">Write notes here in ink...</span>}
            </p>
          )}

          {/* Hand-drawn Checklist Subtasks */}
          {formData.checklists.length > 0 && (
            <div className="space-y-1.5 mt-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                <span>Checklist ({formData.checklists.filter(c => c.completed).length}/{formData.checklists.length})</span>
              </div>

              {formData.checklists.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between group/chk p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div
                    onClick={() => handleToggleChecklist(c.id)}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <div
                      className="w-4 h-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 bg-white/40"
                      style={{ borderColor: paperStyle.inkColor }}
                    >
                      {c.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-lg leading-tight ${
                        'font-handwriting'
                      } ${c.completed ? 'line-through opacity-55' : ''}`}
                      style={{ color: paperStyle.inkColor }}
                    >
                      {c.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(c.id)}
                    className="opacity-0 group-hover/chk:opacity-100 p-1 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Subtask Input */}
          <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="+ Add subtask to checklist..."
              className="flex-1 px-2 py-1 text-base font-handwriting bg-white/40 dark:bg-black/20 rounded border border-black/15 focus:outline-none"
              style={{ color: paperStyle.inkColor }}
            />
            <button
              type="submit"
              className="px-3 py-1 bg-black/80 dark:bg-white/80 text-white dark:text-black font-bold text-xs rounded transition hover:opacity-90 cursor-pointer"
            >
              Add
            </button>
          </form>

          {/* Meta Tags & Details */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            {/* Project Picker */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg">
              <Folder className="w-3 h-3 opacity-70" />
              <select
                value={formData.projectId || ''}
                onChange={(e) => updateField('projectId', e.target.value || undefined)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
                style={{ color: paperStyle.inkColor }}
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Priority Picker */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg">
              <Flag className="w-3 h-3 opacity-70" />
              <select
                value={formData.priority}
                onChange={(e) => updateField('priority', e.target.value as Priority)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
                style={{ color: paperStyle.inkColor }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="normal">🔵 Normal</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg">
              <Calendar className="w-3 h-3 opacity-70" />
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => updateField('dueDate', e.target.value || undefined)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
                style={{ color: paperStyle.inkColor }}
              />
            </div>

            {/* This Evening Toggle */}
            <button
              type="button"
              onClick={() => updateField('isThisEvening', !formData.isThisEvening)}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                formData.isThisEvening ? 'bg-indigo-600 text-white shadow-xs' : 'bg-black/10 dark:bg-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Evening</span>
            </button>
          </div>

          {/* Tags (chips) */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {formData.tags.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/15 dark:bg-white/15"
                style={{ color: paperStyle.inkColor }}
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ Add tag..."
              className="text-xs font-mono bg-transparent border-none focus:outline-none placeholder-stone-500/60 w-24"
              style={{ color: paperStyle.inkColor }}
            />
          </div>

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-3 mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 relative z-10">
          <div className="text-[11px] font-mono opacity-70">
            {dueInfo.label || 'On Desk'}
          </div>

          <button
            type="button"
            onClick={onClose} aria-label="Close TaskDetailDrawer "
            className="px-6 py-2 rounded-xl font-bold text-xs shadow-md transition hover:scale-102 cursor-pointer bg-stone-900 text-white dark:bg-white dark:text-stone-900"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = (props) => props.isOpen && props.task ? <TaskDetailDrawerBody key={props.task.id} {...props} /> : null;

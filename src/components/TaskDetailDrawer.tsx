import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { Task, Project, Area, Priority, ChecklistItem } from '../types';
import { formatDuration, generateId } from '../utils/storage';
import { STICKY_COLORS } from '../constants/theme';
import { RedPushPin } from './RedPushPin';

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

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  projects,
  areas,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onToggleTimer,
}) => {
  if (!isOpen || !task) return null;

  const [formData, setFormData] = useState<Task>({ ...task });
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newTagText, setNewTagText] = useState('');

  useEffect(() => {
    setFormData({ ...task });
  }, [task]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const updateField = (field: keyof Task, val: any) => {
    const updated = { ...formData, [field]: val, updatedAt: new Date().toISOString() };
    setFormData(updated);
    onSave(updated);
  };

  // Determine paper background color
  const paperColor = formData.colorHex || '#FFF275';
  const isDarkPaper = paperColor.toLowerCase() === '#2b2b2b' || paperColor.toLowerCase() === '#1e1b18';
  const textColorClass = isDarkPaper ? 'text-stone-100' : 'text-stone-900';
  const textMutedClass = isDarkPaper ? 'text-stone-300' : 'text-stone-700';

  const completedChecklists = formData.checklists.filter(c => c.completed).length;
  const totalChecklists = formData.checklists.length;

  return (
    /* Center-of-Screen Detailed Sticky Note Modal Backdrop */
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in"
    >
      {/* Centered Tactile Sticky Note Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: paperColor,
          backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.01) 24px, transparent 40px),
            linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.06) 100%)
          `,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)',
        }}
        className={`relative w-full max-w-xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${textColorClass} animate-scale-in border border-black/10 select-none`}
      >
        {/* Tactile Red Push-Pin Centered at the Top Edge */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
          <RedPushPin size={32} />
        </div>

        {/* Top Control Bar */}
        <div className="pt-4 px-6 pb-2 border-b border-black/10 relative z-10 flex items-center justify-between">
          {/* Stopwatch Focus Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-black/10 dark:bg-white/10 rounded-xl text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>{formatDuration(formData.timeSpentSeconds)}</span>
            <button
              onClick={() => onToggleTimer(formData.id)}
              className={`p-0.5 rounded cursor-pointer ${
                formData.isTimerRunning ? 'text-rose-600 animate-pulse' : 'hover:opacity-100 opacity-70'
              }`}
              title={formData.isTimerRunning ? 'Pause timer' : 'Start focus timer'}
            >
              {formData.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Action Icons (Pin, Delete, Close) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateField('isPinned', !formData.isPinned)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                formData.isPinned 
                  ? 'text-amber-600 bg-black/10' 
                  : 'hover:bg-black/10 opacity-70 hover:opacity-100'
              }`}
              title={formData.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className={`w-4 h-4 ${formData.isPinned ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => {
                onDelete(formData.id);
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-600 transition cursor-pointer opacity-70 hover:opacity-100"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/10 transition cursor-pointer opacity-70 hover:opacity-100 ml-1"
              title="Close detailed sticky note"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RGB Paper Color Palette Selector */}
        <div className="px-6 py-2 bg-black/5 flex items-center gap-1.5 flex-wrap">
          <Palette className="w-3.5 h-3.5 opacity-60 mr-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-1">Paper Color:</span>
          {STICKY_COLORS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => updateField('colorHex', c.rgb)}
              style={{ backgroundColor: c.rgb }}
              className={`w-4.5 h-4.5 rounded-md border border-black/20 transition-transform cursor-pointer shadow-2xs ${
                formData.colorHex === c.rgb || formData.colorHex === c.colorHex 
                  ? 'ring-2 ring-stone-900 scale-125 z-10' 
                  : 'hover:scale-115 opacity-85 hover:opacity-100'
              }`}
              title={`${c.name} (${c.rgb})`}
            />
          ))}
        </div>

        {/* Scrollable Sticky Note Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 column-scrollbar space-y-4">
          
          {/* Note Title in Authentic Marker Handwriting */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Sticky note title..."
              className="w-full font-handwriting font-bold text-2xl sm:text-3xl leading-snug tracking-wide bg-transparent border-b border-black/15 focus:border-black/40 outline-none pb-1 placeholder-stone-500/60"
            />
          </div>

          {/* Quick "Move to This Evening" Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateField('isThisEvening', !formData.isThisEvening)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                formData.isThisEvening 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-black/10 hover:bg-black/15 opacity-80 hover:opacity-100'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${formData.isThisEvening ? 'fill-white' : ''}`} />
              <span>{formData.isThisEvening ? 'Scheduled for This Evening' : 'Move to This Evening'}</span>
            </button>
          </div>

          {/* Metadata Grid (Project, Priority, Due Date, Status) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-black/5 rounded-2xl border border-black/10 text-xs">
            {/* Project */}
            <div>
              <label className="block text-[9.5px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                <Folder className="w-2.5 h-2.5" />
                <span>Project</span>
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => updateField('projectId', e.target.value || undefined)}
                className="w-full bg-white/70 dark:bg-black/40 border border-black/15 rounded-lg p-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[9.5px] font-bold uppercase tracking-wider opacity-60 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => updateField('priority', e.target.value as Priority)}
                className="w-full bg-white/70 dark:bg-black/40 border border-black/15 rounded-lg p-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="urgent">🔴 Urgent (P1)</option>
                <option value="high">🟠 High (P2)</option>
                <option value="normal">🔵 Normal (P3)</option>
                <option value="low">⚪ Low (P4)</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[9.5px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => updateField('dueDate', e.target.value || undefined)}
                className="w-full text-xs p-1.5 bg-white/70 dark:bg-black/40 rounded-lg border border-black/15 text-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>

            {/* Status / Lane */}
            <div>
              <label className="block text-[9.5px] font-bold uppercase tracking-wider opacity-60 mb-1">
                Status / Lane
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Task['status'];
                  updateField('status', newStatus);
                  if (newStatus === 'done') {
                    updateField('completedAt', new Date().toISOString());
                  }
                }}
                className="w-full text-xs p-1.5 bg-white/70 dark:bg-black/40 rounded-lg border border-black/15 text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Sticky Note Body (Lined Paper Style Notes) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
              Sticky Note Body / Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Jot down notes, Markdown, or context..."
              className="w-full font-handwriting text-base sm:text-lg leading-relaxed p-3 bg-white/50 dark:bg-black/25 rounded-xl border border-black/10 focus:border-black/30 outline-none resize-none placeholder-stone-500/60"
            />
          </div>

          {/* Checklist Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                Checklist Items ({completedChecklists}/{totalChecklists})
              </label>
              {totalChecklists > 0 && (
                <span className="text-[10px] font-mono font-bold opacity-70">
                  {Math.round((completedChecklists / totalChecklists) * 100)}% done
                </span>
              )}
            </div>

            <div className="space-y-1.5 mb-2.5">
              {formData.checklists.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-black/20 border border-black/10 group hover:bg-white/60 transition"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(c.id)}
                    className="flex items-center gap-2 flex-1 text-left cursor-pointer select-none"
                  >
                    {c.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 opacity-50 shrink-0" />
                    )}
                    <span className={`text-xs font-handwriting text-base ${c.completed ? 'line-through opacity-50' : ''}`}>
                      {c.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(c.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Subtask Input */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 text-xs p-2 bg-white/60 dark:bg-black/30 rounded-xl border border-black/15 focus:outline-none placeholder-stone-500/60"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-xs transition hover:opacity-90 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
              <TagIcon className="w-2.5 h-2.5" />
              <span>Tags (Press Enter)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/40 dark:bg-black/20 rounded-xl border border-black/10">
              {formData.tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/10 text-stone-900 dark:text-stone-100"
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
                placeholder="Add tag..."
                className="flex-1 min-w-[70px] text-xs bg-transparent border-none focus:outline-none placeholder-stone-500/60"
              />
            </div>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 border-t border-black/10 bg-black/5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              const newStatus: Task['status'] = formData.status === 'done' ? 'todo' : 'done';
              updateField('status', newStatus);
              if (newStatus === 'done') {
                updateField('completedAt', new Date().toISOString());
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              formData.status === 'done'
                ? 'bg-emerald-600 text-white'
                : 'bg-black/10 hover:bg-black/15 text-stone-800'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{formData.status === 'done' ? 'Completed ✓' : 'Mark as Complete'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

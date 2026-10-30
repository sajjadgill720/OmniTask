import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Moon, 
  Tag as TagIcon, 
  ExternalLink, 
  Folder, 
  CheckSquare, 
  Square, 
  Plus, 
  Clock, 
  Play, 
  Pause,
  Pin,
  Palette
} from 'lucide-react';
import { Task, Project, Area, Priority, ChecklistItem } from '../types';
import { formatDuration, generateId } from '../utils/storage';
import { STICKY_COLORS } from '../constants/theme';

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-white dark:bg-[#181a20] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slide-right"
      >
        
        {/* Top Control Bar */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Stopwatch Focus Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDuration(formData.timeSpentSeconds)}</span>
              <button
                onClick={() => onToggleTimer(formData.id)}
                className={`p-0.5 rounded cursor-pointer ${
                  formData.isTimerRunning ? 'text-rose-600 animate-pulse' : 'text-slate-400 hover:text-slate-700'
                }`}
                title={formData.isTimerRunning ? 'Pause timer' : 'Start focus timer'}
              >
                {formData.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* Pin to top */}
              <button
                type="button"
                onClick={() => updateField('isPinned', !formData.isPinned)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  formData.isPinned 
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' 
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Pin sticky note"
              >
                <Pin className={`w-4 h-4 ${formData.isPinned ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                onClick={() => {
                  onDelete(formData.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sticky RGB Color Palette */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">RGB Paper:</span>
            {STICKY_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => updateField('colorHex', c.rgb)}
                style={{ backgroundColor: c.rgb }}
                className={`w-5 h-5 rounded-lg border border-black/15 transition-transform cursor-pointer shadow-2xs ${
                  formData.colorHex === c.rgb || formData.colorHex === c.colorHex ? 'ring-2 ring-blue-600 scale-120' : 'hover:scale-110'
                }`}
                title={`${c.name} (${c.rgb})`}
              />
            ))}
            <input
              type="color"
              onChange={(e) => updateField('colorHex', e.target.value)}
              className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
              title="Custom RGB Color"
            />
          </div>

          {/* Task Title */}
          <div className="mb-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Sticky Note Title..."
              className="w-full text-lg font-bold bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Things 3 "This Evening" Toggle */}
          <div className="mb-4">
            <button
              onClick={() => updateField('isThisEvening', !formData.isThisEvening)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                formData.isThisEvening 
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${formData.isThisEvening ? 'fill-indigo-400' : ''}`} />
              <span>{formData.isThisEvening ? 'Scheduled for This Evening' : 'Move to This Evening'}</span>
            </button>
          </div>

          {/* Project & Area Assignment */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Project
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => updateField('projectId', e.target.value || undefined)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => updateField('priority', e.target.value as Priority)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="urgent">🔴 Urgent (P1)</option>
                <option value="high">🟠 High (P2)</option>
                <option value="normal">🔵 Normal (P3)</option>
                <option value="low">⚪ Low (P4)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Section */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => updateField('dueDate', e.target.value || undefined)}
                className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sticky Note Body
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Jot down notes, Markdown, or context..."
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>

          {/* Checklists (Google Keep style) */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Checklist Items ({formData.checklists.filter(c => c.completed).length}/{formData.checklists.length})
            </label>
            
            <div className="space-y-1.5 mb-2">
              {formData.checklists.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-2 group p-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(c.id)}
                    className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                  >
                    {c.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs ${
                      c.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {c.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <form onSubmit={handleAddChecklist} className="flex gap-1.5">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <TagIcon className="w-2.5 h-2.5" />
              <span>Tags (Press Enter)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {formData.tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 cursor-pointer"
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
                className="flex-1 min-w-[70px] text-xs bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Done button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};

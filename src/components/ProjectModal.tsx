import React, { useState } from 'react';
import { X, Folder, Plus } from 'lucide-react';
import { Area, Project } from '../types';
import { generateId } from '../utils/storage';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
  onAddProject: (project: Project) => void;
}

const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  areas,
  onAddProject,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState<string>(areas[0]?.id || '');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddProject({
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      areaId: areaId || undefined,
      colorHex,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#181a20] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Create New Project
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Project Title
            </label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Launch, Sprint 4..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Area of Responsibility
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="">No Area (Standalone Project)</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColorHex(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    colorHex === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};


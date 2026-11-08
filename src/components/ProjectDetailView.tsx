import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  Check, 
  Trash2,
  Clock
} from 'lucide-react';
import { Project, Task, Priority } from '../types';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onQuickAdd: (title: string, priority?: Priority) => void;
  onOpenEditProject?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  tasks,
  onBack,
  onSelectTask,
  onToggleComplete,
  onQuickAdd,
  onOpenEditProject,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'activity'>('tasks');
  const [quickTitle, setQuickTitle] = useState('');

  const projTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projTasks.filter(t => t.status === 'done');
  const totalCount = projTasks.length || 1;
  const progressPercent = Math.round((doneTasks.length / totalCount) * 100);

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAdd(quickTitle.trim(), 'normal');
    setQuickTitle('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 select-none space-y-6">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white space-y-4">
        
        {/* Navigation Breadcrumb & Edit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          {onOpenEditProject && (
            <button
              type="button"
              onClick={onOpenEditProject}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Project</span>
            </button>
          )}
        </div>

        {/* Project Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span 
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                style={{ backgroundColor: project.colorHex || '#3b82f6' }}
              />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
                {project.title}
              </h1>
            </div>
            <p className="text-xs text-white/60 pl-6.5 max-w-xl">
              {project.description || 'Build, ship and grow. Focus on delivering measurable impact.'}
            </p>
          </div>

          {/* Due date & Priority pill */}
          <div className="flex items-center gap-2 pl-6 sm:pl-0">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-mono text-white/80 border border-white/15 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{project.dueDate || 'Nov 15, 2026'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              High
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-white/60">Completion Progress</span>
            <span className="font-mono text-emerald-400">{doneTasks.length}/{projTasks.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: project.colorHex || '#10b981'
              }}
            />
          </div>
        </div>

      </div>

      {/* Tabs Switcher: Tasks (12) | Milestones (3) | Activity */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'tasks' ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          Tasks ({projTasks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'milestones' ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          Milestones (3)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'activity' ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          Activity
        </button>
      </div>

      {/* Tab Content: Tasks List */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          
          {/* Quick Add */}
          <form 
            onSubmit={handleInlineAdd}
            className="flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-md text-white focus-within:ring-2 focus-within:ring-amber-400/40 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={`Add task to ${project.title}... (Press Enter)`}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
            >
              Add Task
            </button>
          </form>

          {/* Tasks Stack */}
          <div className="space-y-2.5">
            {projTasks.map(task => {
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-xl border border-white/15 shadow-md transition-all cursor-pointer hover:bg-black/55 ${
                    isDone ? 'opacity-60' : 'hover:scale-[1.01]'
                  }`}
                  style={{
                    borderLeftColor: task.paperColor || project.colorHex || '#F8D979',
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                        if (!isDone) {
                          playCompletionSound();
                          confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
                        }
                      }}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                        isDone 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-white/40 hover:border-emerald-400'
                      }`}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    <div className="truncate flex-1">
                      <span className={`text-xs sm:text-sm font-semibold truncate block ${
                        isDone ? 'line-through text-white/50' : 'text-white font-handwriting text-sm tracking-wide'
                      }`}>
                        {task.title}
                      </span>
                      {task.notes && (
                        <span className="text-[10px] text-white/50 truncate block mt-0.5">
                          {task.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-xs">
                    {task.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}

                    {task.dueDate && (
                      <span className="font-mono text-[10px] text-white/60">
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {projTasks.length === 0 && (
              <div className="py-12 text-center rounded-2xl bg-black/20 border border-dashed border-white/15 text-white/50 text-xs">
                <span>No tasks in this project yet. Capture one above!</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {[
            { title: 'Phase 1: Architecture & Data Schema', status: 'completed', date: 'Oct 24, 2026' },
            { title: 'Phase 2: Visual Studio Workspace UI/UX', status: 'active', date: 'Nov 8, 2026' },
            { title: 'Phase 3: Production Rollout & Polishing', status: 'pending', date: 'Nov 15, 2026' },
          ].map((milestone, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-emerald-400' : milestone.status === 'active' ? 'bg-amber-400 animate-pulse' : 'bg-white/20'}`} />
                <span className="font-bold">{milestone.title}</span>
              </div>
              <span className="text-white/50 font-mono">{milestone.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 space-y-2 text-xs text-white">
          <p className="text-white/70">✦ Project created under Work & Projects</p>
          <p className="text-white/70">✦ {doneTasks.length} tasks marked as completed</p>
          <p className="text-white/70">✦ Overall milestone progress updated to {progressPercent}%</p>
        </div>
      )}

    </div>
  );
};

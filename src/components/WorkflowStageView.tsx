import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Inbox, 
  Calendar, 
  Compass, 
  Archive, 
  CheckCircle2, 
  Plus, 
  Filter, 
  Clock, 
  Check, 
  MoreVertical, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Task, Project, ThingsSection, Priority } from '../types';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface WorkflowStageViewProps {
  section: ThingsSection;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onQuickAdd: (title: string, priority?: Priority) => void;
}

export const WorkflowStageView: React.FC<WorkflowStageViewProps> = ({
  section,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Filter tasks belonging to current section
  const sectionTasks = useMemo(() => {
    return tasks.filter(t => t.section === section);
  }, [tasks, section]);

  const completedCount = sectionTasks.filter(t => t.status === 'done').length;
  const totalCount = sectionTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'active') return sectionTasks.filter(t => t.status !== 'done');
    if (activeFilter === 'completed') return sectionTasks.filter(t => t.status === 'done');
    return sectionTasks;
  }, [sectionTasks, activeFilter]);

  const getSectionMeta = () => {
    switch (section) {
      case 'today':
        return {
          title: 'Today',
          subtitle: 'Your daily priorities',
          icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />,
        };
      case 'inbox':
        return {
          title: 'Inbox',
          subtitle: 'Unprocessed captures & raw sticky notes',
          icon: <Inbox className="w-5 h-5 text-blue-400" />,
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Scheduled deadlines & calendar commitments',
          icon: <Calendar className="w-5 h-5 text-rose-400" />,
        };
      case 'anytime':
        return {
          title: 'Anytime',
          subtitle: 'Ready tasks with no strict time pressure',
          icon: <Compass className="w-5 h-5 text-emerald-400" />,
        };
      case 'someday':
        return {
          title: 'Someday',
          subtitle: 'Future inspirations & deferred aspirations',
          icon: <Archive className="w-5 h-5 text-purple-400" />,
        };
      case 'logbook':
        return {
          title: 'Logbook',
          subtitle: 'Completed accomplishments archive',
          icon: <CheckCircle2 className="w-5 h-5 text-stone-400" />,
        };
    }
  };

  const meta = getSectionMeta();

  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAdd(quickTitle.trim(), 'normal');
    setQuickTitle('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 select-none space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-400/20 border border-amber-400/40">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
                {meta.title}
              </h1>
              <span className="text-xs font-mono font-bold text-white/50">
                {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-white/60 font-medium">{meta.subtitle}</p>
          </div>
        </div>

        {/* Date Pill & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white/80 font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{todayDateString}</span>
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/15 text-xs">
            {(['all', 'active', 'completed'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-bold transition capitalize ${
                  activeFilter === tab ? 'bg-amber-400 text-stone-950' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Metric Bar */}
      {totalCount > 0 && (
        <div className="p-4 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-xl border border-white/15 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
            <span className="text-white/70">
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-mono text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Layout: Tasks List on Left + Aesthetic Polaroid Memo Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Tasks List */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Quick Capture Input */}
          <form 
            onSubmit={handleInlineAdd}
            className="flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-md text-white focus-within:ring-2 focus-within:ring-amber-400/40 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={`Add task to ${meta.title}... (Press Enter)`}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
            >
              Add
            </button>
          </form>

          {/* Task Rows */}
          <div className="space-y-2.5">
            {filteredTasks.map((task, idx) => {
              const isDone = task.status === 'done';
              const proj = projects.find(p => p.id === task.projectId);
              const defaultTimes = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '7:00 PM'];
              const scheduledTime = task.reminderTime || defaultTimes[idx % defaultTimes.length];

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-xl border border-white/15 shadow-md transition-all cursor-pointer hover:bg-black/55 ${
                    isDone ? 'opacity-60' : 'hover:scale-[1.01]'
                  }`}
                  style={{
                    borderLeftColor: task.paperColor || '#F8D979',
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    {/* Circular Checkbox */}
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
                      {proj && (
                        <span className="text-[10px] text-white/50 block">
                          {proj.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata: Category Pill + Scheduled Time */}
                  <div className="flex items-center gap-2.5 shrink-0 text-xs">
                    {task.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}

                    <span className="font-mono text-[10px] text-white/60">
                      {scheduledTime}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center rounded-2xl bg-black/20 border border-dashed border-white/15 text-white/50 text-xs">
                <span>No notes in this stage. Capture one above!</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Pinned Polaroid Landscape Card from Mockup */}
        <div className="lg:col-span-4 flex flex-col items-center">
          
          <div 
            className="w-full max-w-xs p-4 pb-5 rounded-2xl bg-white text-stone-900 border border-stone-200 shadow-2xl relative select-none rotate-1 hover:rotate-0 transition-transform"
          >
            {/* Washi Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/80 border border-amber-300/50 shadow-2xs rotate-[-2deg]" />

            {/* Polaroid Mountain Photo from Mockup */}
            <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-200 mb-3 shadow-inner">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=70"
                alt="Mountain Peak Motivation"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Handwritten Note Calligraphy */}
            <div className="text-center">
              <p className="font-handwriting text-xl font-bold text-stone-800 leading-tight">
                "You're doing great! :)"
              </p>
              <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                Knovera Studio • {todayDateString}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Calendar, 
  Compass, 
  Archive, 
  CheckCircle2, 
  Folder, 
  Sparkles,
  Plus,
  Filter,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { Task, Project, ThingsSection, Priority } from '../types';
import { TaskRow } from './TaskRow';
import { RedPushPin } from './RedPushPin';

interface TaskListViewProps {
  section: ThingsSection;
  selectedProject: Project | null;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  audioEnabled: boolean;
  onQuickAdd: (title?: string, priority?: Priority) => void;
}

export type ListFilter = 'all' | 'active' | 'priority' | 'completed';
export type ListSort = 'manual' | 'priority' | 'dueDate' | 'title';

/**
 * TaskListView
 * Pinned list / index-card studio workspace for sections (Inbox, Upcoming, Anytime, Someday, Logbook, Projects)
 */
export const TaskListView: React.FC<TaskListViewProps> = ({
  section,
  selectedProject,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  audioEnabled,
  onQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('normal');
  const [activeFilter, setActiveFilter] = useState<ListFilter>('all');
  const [activeSort, setActiveSort] = useState<ListSort>('manual');

  const getHeaderInfo = () => {
    if (selectedProject) {
      return {
        title: selectedProject.title,
        subtitle: selectedProject.description || 'Project Tasks & Milestones',
        icon: <Folder className="w-5 h-5 text-indigo-400" />,
      };
    }

    switch (section) {
      case 'inbox':
        return {
          title: 'Inbox',
          subtitle: 'Unprocessed thoughts and quick captures',
          icon: <Inbox className="w-5 h-5 text-blue-400" />,
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Scheduled events and future deadlines',
          icon: <Calendar className="w-5 h-5 text-rose-400" />,
        };
      case 'anytime':
        return {
          title: 'Anytime',
          subtitle: 'Tasks ready to be tackled when you have time',
          icon: <Compass className="w-5 h-5 text-emerald-400" />,
        };
      case 'someday':
        return {
          title: 'Someday',
          subtitle: 'Ideas on hold and long-term aspirations',
          icon: <Archive className="w-5 h-5 text-purple-400" />,
        };
      case 'logbook':
        return {
          title: 'Logbook',
          subtitle: 'Completed accomplishments and historical log',
          icon: <CheckCircle2 className="w-5 h-5 text-stone-400" />,
        };
      default:
        return {
          title: 'Tasks',
          subtitle: 'Your active tasks',
          icon: <Folder className="w-5 h-5 text-amber-400" />,
        };
    }
  };

  const header = getHeaderInfo();
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (activeFilter === 'active') {
      result = result.filter(t => t.status !== 'done');
    } else if (activeFilter === 'priority') {
      result = result.filter(t => t.priority === 'urgent' || t.priority === 'high');
    } else if (activeFilter === 'completed') {
      result = result.filter(t => t.status === 'done');
    }

    // Sort
    if (activeSort === 'priority') {
      const pWeights = { urgent: 0, high: 1, normal: 2, low: 3 };
      result.sort((a, b) => (pWeights[a.priority || 'normal'] - pWeights[b.priority || 'normal']));
    } else if (activeSort === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (activeSort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tasks, activeFilter, activeSort]);

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickAdd(trimmed, quickPriority);
    setQuickTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 w-full">
      
      {/* Section Header with Studio Plaster Index Card Treatment */}
      <div className="relative p-5 sm:p-6 rounded-3xl bg-black/40 dark:bg-black/55 backdrop-blur-2xl border border-white/15 shadow-2xl text-white mb-6">
        
        {/* Subtle Pushpin */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <RedPushPin color="yellow" size={30} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {header.icon}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                {header.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-bold font-mono">
                {tasks.length} {tasks.length === 1 ? 'Note' : 'Notes'}
              </span>
            </div>
            <p className="text-xs font-medium text-white/60">
              {header.subtitle}
            </p>
          </div>

          {/* Progress Tracker Pill */}
          {totalCount > 0 && (
            <div className="w-full sm:w-56 p-2.5 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-white/60">Progress</span>
                <span className="text-amber-400 font-mono">
                  {completedCount}/{totalCount} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Inline Task Adder */}
      <form 
        onSubmit={handleInlineAdd}
        className="flex items-center gap-2 p-2 px-3 mb-6 bg-black/35 dark:bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-amber-400/40 transition-all text-white"
      >
        <Plus className="w-4 h-4 text-amber-400 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder={`Add a note to ${header.title}... (Press Enter to save)`}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-white placeholder-white/50 focus:outline-none"
        />

        {/* Quick Priority Selector */}
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as Priority)}
          className="text-xs font-bold px-2 py-1 bg-white/10 text-white rounded-xl border border-white/15 cursor-pointer focus:outline-none"
        >
          <option value="normal" className="bg-stone-900 text-white">Normal</option>
          <option value="high" className="bg-stone-900 text-white">High</option>
          <option value="urgent" className="bg-stone-900 text-white">Urgent</option>
          <option value="low" className="bg-stone-900 text-white">Low</option>
        </select>

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md shrink-0"
        >
          Pin Note
        </button>
      </form>

      {/* Filter and Sort Toolbar */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between pb-3 mb-4 text-xs flex-wrap gap-2">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-amber-500" /> Filter:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'bg-black/20 hover:bg-black/30 dark:bg-black/40 text-stone-800 dark:text-stone-200 border border-black/10 dark:border-white/10'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                activeFilter === 'active'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'bg-black/20 hover:bg-black/30 dark:bg-black/40 text-stone-800 dark:text-stone-200 border border-black/10 dark:border-white/10'
              }`}
            >
              Active ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setActiveFilter('priority')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                activeFilter === 'priority'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-black/20 hover:bg-black/30 dark:bg-black/40 text-stone-800 dark:text-stone-200 border border-black/10 dark:border-white/10'
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-black/20 hover:bg-black/30 dark:bg-black/40 text-stone-800 dark:text-stone-200 border border-black/10 dark:border-white/10'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-amber-500" /> Sort:
            </span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as ListSort)}
              className="text-xs font-semibold px-2 py-1 bg-black/20 dark:bg-black/40 text-stone-800 dark:text-stone-200 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="manual" className="bg-stone-900 text-white">Natural Order</option>
              <option value="priority" className="bg-stone-900 text-white">Priority</option>
              <option value="dueDate" className="bg-stone-900 text-white">Due Date</option>
              <option value="title" className="bg-stone-900 text-white">Title Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* List of Tasks Rendered as Tactile Cards */}
      <div className="space-y-3 pb-8">
        {filteredTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            project={projects.find(p => p.id === task.projectId)}
            onToggleComplete={onToggleComplete}
            onSelectTask={onSelectTask}
            onToggleTimer={onToggleTimer}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onReorderTasks={onReorderTasks}
            audioEnabled={audioEnabled}
          />
        ))}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-black/20 dark:bg-black/35 backdrop-blur-md border border-white/10">
            <span className="text-4xl block mb-2">📌</span>
            <h3 className="text-base font-bold text-stone-800 dark:text-white mb-1">
              No notes in {header.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto mb-4">
              Capture tasks, set deadlines, and pin your thoughts directly to the wall.
            </p>
            <button
              onClick={() => onQuickAdd('New note', 'normal')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
            >
              + Pin First Note
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

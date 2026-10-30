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
        icon: <Folder className="w-5 h-5 text-blue-500" />,
      };
    }

    switch (section) {
      case 'inbox':
        return {
          title: 'Inbox',
          subtitle: 'Unprocessed thoughts and quick captures',
          icon: <Inbox className="w-5 h-5 text-blue-500" />,
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Scheduled events and future deadlines',
          icon: <Calendar className="w-5 h-5 text-rose-500" />,
        };
      case 'anytime':
        return {
          title: 'Anytime',
          subtitle: 'Tasks ready to be tackled when you have time',
          icon: <Compass className="w-5 h-5 text-emerald-500" />,
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
          icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
        };
      default:
        return {
          title: 'Tasks',
          subtitle: 'Your active tasks',
          icon: <Folder className="w-5 h-5 text-slate-500" />,
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Section Header with Progress Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {header.icon}
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {header.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono">
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {header.subtitle}
          </p>
        </div>

        {/* Progress Tracker */}
        {totalCount > 0 && (
          <div className="w-full sm:w-56 p-2.5 bg-slate-100/80 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Inline Task Adder (Things 3 & Linear Style) */}
      <form 
        onSubmit={handleInlineAdd}
        className="flex items-center gap-2 p-2 px-3 mb-5 bg-white dark:bg-[#151821] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-blue-500/30 transition-all"
      >
        <Plus className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder={`Add a task to ${header.title}... (Press Enter to save)`}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {/* Quick Priority Selector */}
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as Priority)}
          className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer focus:outline-none"
        >
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="low">Low</option>
        </select>

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
        >
          Add
        </button>
      </form>

      {/* Filter and Sort Toolbar */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between pb-3 mb-3 text-xs border-b border-slate-100 dark:border-white/5 flex-wrap gap-2">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeFilter === 'active'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Active ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setActiveFilter('priority')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeFilter === 'priority'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as ListSort)}
              className="text-xs font-semibold px-2 py-1 bg-transparent text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="manual">Drag Order</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16 px-4 clean-canvas-surface">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {tasks.length === 0 ? `Nothing in ${header.title}` : 'No matching tasks for filter'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            {tasks.length === 0 
              ? 'Use the quick adder above or the Magic Button to capture tasks.'
              : 'Try selecting a different filter above to view your tasks.'}
          </p>
        </div>
      )}

      {/* Tasks List with Drag & Drop */}
      {filteredTasks.length > 0 && (
        <div className="space-y-2">
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
              onReorderTasks={activeSort === 'manual' ? onReorderTasks : undefined}
              audioEnabled={audioEnabled}
            />
          ))}
        </div>
      )}

    </div>
  );
};

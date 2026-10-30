import React from 'react';
import { 
  Inbox, 
  Calendar, 
  Compass, 
  Archive, 
  CheckCircle2, 
  Folder, 
  Sparkles,
  Plus
} from 'lucide-react';
import { Task, Project, ThingsSection } from '../types';
import { TaskRow } from './TaskRow';

interface TaskListViewProps {
  section: ThingsSection;
  selectedProject: Project | null;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  section,
  selectedProject,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  audioEnabled,
  onQuickAdd,
}) => {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {header.icon}
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {header.title}
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {header.subtitle}
          </p>
        </div>

        {tasks.length > 0 && (
          <div className="text-right font-mono text-xs text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">{tasks.length}</span> items
            {section === 'logbook' && (
              <span className="block text-[10px] text-emerald-500">Completed</span>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Nothing in {header.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            {section === 'logbook' 
              ? 'Complete tasks in Today or Anytime to see them archived here.' 
              : 'Add your first task to this list to keep your thoughts organized.'}
          </p>
          {section !== 'logbook' && (
            <button
              onClick={onQuickAdd}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Add Task
            </button>
          )}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              project={projects.find(p => p.id === task.projectId)}
              onToggleComplete={onToggleComplete}
              onSelectTask={onSelectTask}
              onToggleTimer={onToggleTimer}
              audioEnabled={audioEnabled}
            />
          ))}
        </div>
      )}

    </div>
  );
};


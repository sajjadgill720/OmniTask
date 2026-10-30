import React from 'react';
import { Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { Task, Project } from '../types';
import { StickyNoteCard } from './StickyNoteCard';

interface KanbanBoardViewProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  audioEnabled: boolean;
  onQuickAdd: () => void;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  title,
  subtitle,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  audioEnabled,
  onQuickAdd,
}) => {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300',
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      icon: <ListTodo className="w-4 h-4 text-slate-500" />,
      items: todoTasks,
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      items: inProgressTasks,
    },
    {
      id: 'done',
      title: 'Completed',
      color: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      items: doneTasks,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">📋</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              Kanban Board
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {subtitle} • Trello Sticky Columns with Motion Graphics
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Card</span>
        </button>
      </div>

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(col => (
          <div
            key={col.id}
            className={`rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800/70 ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  {col.title}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${col.badgeColor}`}>
                {col.items.length}
              </span>
            </div>

            {/* Sticky Cards in this column */}
            <div className="space-y-4 min-h-48">
              {col.items.length === 0 ? (
                <div className="text-center py-10 px-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">
                    No notes in {col.title}
                  </span>
                </div>
              ) : (
                col.items.map((task, idx) => (
                  <StickyNoteCard
                    key={task.id}
                    task={task}
                    index={idx}
                    project={projects.find(p => p.id === task.projectId)}
                    onToggleComplete={onToggleComplete}
                    onSelectTask={onSelectTask}
                    onToggleTimer={onToggleTimer}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    audioEnabled={audioEnabled}
                  />
                ))
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};


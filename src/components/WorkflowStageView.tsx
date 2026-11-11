import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Inbox, 
  Calendar, 
  Compass, 
  Archive, 
  Check, 
  Plus, 
  ChevronDown
} from 'lucide-react';
import { Task, Project, ThingsSection, Priority } from '../types';
import { RedPushPin } from './RedPushPin';
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

/**
 * WorkflowStageView
 * Workflow Stage page matching Image 5 reference:
 * - Header: Today, Nov 8, 2026 + "+ Filter v"
 * - Translucent Glass Card:
 *   - Star Icon + "Today" (8 tasks) + Progress Bar (62% Complete)
 *   - Clean List of Items with circle checkboxes and category badge pills on right (Research, Personal, Health, Planning)
 *   - Pinned Physical Sticky Note on bottom-right: "You're doing great! :)"
 */
export const WorkflowStageView: React.FC<WorkflowStageViewProps> = ({
  section,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');

  // Filter tasks belonging to current section
  const sectionTasks = useMemo(() => {
    if (section === 'upcoming') {
      return tasks
        .filter(t => t.section === 'upcoming' || Boolean(t.dueDate))
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }
    if (section === 'logbook') {
      return tasks.filter(t => t.status === 'done');
    }
    return tasks.filter(t => t.section === section);
  }, [tasks, section]);

  const completedCount = sectionTasks.filter(t => t.status === 'done').length;
  const totalCount = sectionTasks.length > 0 ? sectionTasks.length : 8;
  const progressPercent = sectionTasks.length > 0 
    ? Math.round((completedCount / sectionTasks.length) * 100) 
    : 62;

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

  // Default tasks matching Image 5 reference if task list is empty
  const defaultDisplayTasks = [
    { id: 't1', title: 'Finish RETECO paper summary', tag: 'Research', tagBg: '#D7B7EE', done: true },
    { id: 't2', title: 'Update portfolio with new projects', tag: 'Personal', tagBg: '#C6DF9C', done: false },
    { id: 't3', title: 'Gym workout', tag: 'Health', tagBg: '#F1A6A6', done: false },
    { id: 't4', title: 'Review SemEval papers', tag: 'Research', tagBg: '#D7B7EE', done: false },
    { id: 't5', title: 'Plan next week', tag: 'Planning', tagBg: '#D8C5A8', done: false },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none space-y-4">
      
      {/* Top Header: Date + Filter matching Image 5 */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-stone-900 dark:text-white font-extrabold text-xl sm:text-2xl tracking-tight">
          <Calendar className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          <span>Today, {todayDateString}</span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 text-stone-900 dark:text-white font-bold text-xs shadow-xs transition cursor-pointer backdrop-blur-md border border-white/20"
        >
          <span>+ Filter</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Frosted Glass Stage Container matching Image 5 */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-white/45 dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-2xl">
        
        {/* Stage Header: Yellow Star + Today + Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-4 border-b border-black/10 dark:border-white/10 gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-3xl text-amber-400 drop-shadow-xs">★</span>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h1>
                <span className="text-sm font-semibold text-stone-600 dark:text-white/60">
                  {totalCount} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar matching Image 5 */}
          <div className="flex flex-col sm:items-end w-full sm:w-60">
            <span className="text-xs font-bold font-mono text-stone-700 dark:text-white/80 mb-1.5">
              {progressPercent}% Complete
            </span>
            <div className="w-full h-2 rounded-full bg-stone-300/80 dark:bg-white/15 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>

        {/* Task Items List + Bottom-Right Sticky Note Layout */}
        <div className="relative min-h-[380px] pb-24 sm:pb-16">
          
          <div className="space-y-3 max-w-2xl">
            {/* Quick Capture Inline Input */}
            <form 
              onSubmit={handleInlineAdd}
              className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md border border-stone-300 dark:border-white/15 mb-4"
            >
              <Plus className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Add a new task... (Press Enter)"
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-white/50 focus:outline-none"
              />
            </form>

            {/* List of Tasks matching Image 5 */}
            {(sectionTasks.length > 0 ? sectionTasks : defaultDisplayTasks).map((task: any) => {
              const isDone = task.status === 'done' || task.done === true;
              const tagText = task.tags?.[0] || task.tag || 'Personal';
              const tagColor = task.tagBg || (tagText === 'Research' ? '#D7B7EE' : tagText === 'Health' ? '#F1A6A6' : tagText === 'Planning' ? '#D8C5A8' : '#C6DF9C');

              return (
                <div
                  key={task.id}
                  onClick={() => task.createdAt && onSelectTask(task)}
                  className={`flex items-center justify-between p-3.5 px-4 rounded-2xl bg-white/75 dark:bg-black/45 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xs transition-all cursor-pointer hover:bg-white dark:hover:bg-black/60 ${
                    isDone ? 'opacity-85' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.createdAt) {
                          onToggleComplete(task.id);
                        }
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                        isDone 
                          ? 'bg-emerald-600 text-white' 
                          : 'border-2 border-stone-600 dark:border-stone-400 hover:border-emerald-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <span className={`text-sm sm:text-base font-semibold text-stone-900 dark:text-white truncate ${
                      isDone ? 'line-through text-stone-500 dark:text-white/50' : ''
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Category Badge Pill on Right */}
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: tagColor,
                      color: '#1c1917',
                    }}
                  >
                    {tagText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ===================================================================
              AUTHENTIC YELLOW STICKY NOTE PINNED ON BOTTOM RIGHT matching Image 5
              "You're doing great! :)"
              =================================================================== */}
          <div 
            className="absolute bottom-2 right-2 sm:right-6 w-44 sm:w-48 p-4 rounded-2xl shadow-xl border border-amber-300 text-center select-none"
            style={{
              backgroundColor: '#F8D979',
              transform: 'rotate(-2.5deg)',
              color: '#1c1917',
              boxShadow: '0 10px 20px -3px rgba(45,30,15,0.22), 0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            {/* 3D Pushpin on top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <RedPushPin size={24} color="cyan" />
            </div>

            {/* Hand-drawn Smiley Face */}
            <div className="text-2xl mb-1">
              😊
            </div>

            {/* Handwritten note */}
            <p 
              className="text-lg sm:text-xl font-bold font-serif italic leading-tight"
              style={{
                fontFamily: "'Homemade Apple', 'Caveat', cursive, serif",
              }}
            >
              You're doing great!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

import { localDateString } from '../utils/dates';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Check, 
  Plus, 
  ChevronDown
} from 'lucide-react';
import { Task, ThingsSection, Priority } from '../types';
import { RedPushPin } from './RedPushPin';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface WorkflowStageViewProps {
  section: ThingsSection;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
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
  onToggleComplete,
  onSelectTask,
  onQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Filter tasks belonging to current section
  const sectionTasks = useMemo(() => {
    if (section === 'upcoming') {
      return tasks
        .filter(t => t.status !== 'done' && (t.section === 'upcoming' || Boolean(t.dueDate)))
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }
    if (section === 'logbook') {
      return tasks.filter(t => t.status === 'done');
    }
    return tasks.filter(t => t.section === section || (section === 'today' && t.status !== 'done' && t.dueDate && t.dueDate <= localDateString()));
  }, [tasks, section]);

  const tagOf = (task: Task) => task.tags?.[0] || 'Personal';
  const tagOptions = useMemo(() => [...new Set(sectionTasks.map(tagOf))].sort((a, b) => a.localeCompare(b)), [sectionTasks]);
  useEffect(() => {
    if (activeTagFilter && !tagOptions.includes(activeTagFilter)) setActiveTagFilter(null);
  }, [activeTagFilter, tagOptions]);
  const visibleTasks = activeTagFilter ? sectionTasks.filter(task => tagOf(task) === activeTagFilter) : sectionTasks;
  const completedCount = visibleTasks.filter(t => t.status === 'done').length;
  const totalCount = visibleTasks.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

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

  const sectionTitle = section === 'inbox' ? 'Inbox' : section.charAt(0).toUpperCase() + section.slice(1);
  const stageDescription: Record<ThingsSection, string> = {
    today: 'A calm place to focus on what matters today.',
    inbox: 'Capture first. Decide where it belongs when you are ready.',
    upcoming: 'See what is coming and give the week some shape.',
    anytime: 'A flexible shelf for tasks you can pick up whenever.',
    someday: 'Ideas worth keeping for a little further down the road.',
    logbook: 'A record of the work you have already put in.',
  };
  const dateHeading = section === 'today' ? `Today · ${todayDateString}` : `${sectionTitle} · ${todayDateString}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none space-y-4">
      
      {/* Top Header: Date + Filter matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-extrabold text-xl sm:text-2xl tracking-tight">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-300" />
            <span>{dateHeading}</span>
          </div>
          <p className="mt-1 pl-7 text-xs text-stone-600 dark:text-white/60">{stageDescription[section]}</p>
        </div>

        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            aria-expanded={showFilterMenu}
            onClick={() => setShowFilterMenu(open => !open)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/65 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 text-stone-900 dark:text-white font-bold text-xs shadow-sm transition cursor-pointer backdrop-blur-md border border-white/60 dark:border-white/20"
          >
            <span>{activeTagFilter ? `Tag · ${activeTagFilter}` : 'Filter notes'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-white/70 dark:border-white/15 bg-[#fffaf0]/95 dark:bg-stone-900/95 p-2 shadow-xl backdrop-blur-xl">
              <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-stone-500 dark:text-white/45">Show notes tagged</p>
              {[null, ...tagOptions].map(tag => (
                <button key={tag || 'all'} type="button" onClick={() => { setActiveTagFilter(tag); setShowFilterMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${activeTagFilter === tag ? 'bg-amber-300/80 font-bold text-stone-950' : 'text-stone-700 hover:bg-stone-900/5 dark:text-white/75 dark:hover:bg-white/10'}`}>
                  <span>{tag || 'All notes'}</span>
                  {tag && <span className="text-[10px] opacity-60">{sectionTasks.filter(task => tagOf(task) === tag).length}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Frosted Glass Stage Container matching Image 5 */}
      <div className="relative overflow-hidden p-5 sm:p-8 rounded-[2rem] bg-gradient-to-br from-[#fffaf0]/90 via-[#fff7e9]/80 to-[#f5e8d4]/85 dark:from-stone-950/75 dark:via-stone-900/75 dark:to-stone-950/80 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[0_24px_70px_-32px_rgba(73,47,22,.55)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" />
        
        {/* Stage Header: Yellow Star + Today + Progress Bar */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-5 border-b border-black/10 dark:border-white/10 gap-4">
          
          <div className="flex items-center gap-3">
            <span className="text-3xl text-amber-400 drop-shadow-xs">★</span>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
                  {sectionTitle}
                </h1>
                <span className="rounded-full bg-black/[.06] dark:bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:text-white/65">
                  {totalCount} tasks
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600/80 dark:text-white/55">{completedCount} finished · {Math.max(0, totalCount - completedCount)} still in play</p>
            </div>
          </div>

          {/* Progress Bar matching Image 5 */}
          <div className="flex flex-col sm:items-end w-full sm:w-60 rounded-2xl bg-white/45 dark:bg-black/20 p-3 border border-white/50 dark:border-white/10">
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
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_210px] gap-6 lg:gap-9">
          
          <div className="space-y-3 max-w-3xl">
            {/* Quick Capture Inline Input */}
            {section !== 'logbook' && <form
              onSubmit={handleInlineAdd}
              className="flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-white/75 dark:bg-black/35 backdrop-blur-md border border-amber-900/10 dark:border-white/15 mb-5 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/60 focus-within:border-amber-400/50 transition"
            >
              <Plus className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Add a new task... (Press Enter)"
                className="flex-1 bg-transparent border-none font-handwriting text-lg text-stone-900 dark:text-white placeholder:font-sans placeholder:text-sm placeholder:text-stone-500 dark:placeholder:text-white/50 focus:outline-none"
              />
            </form>}

            {/* List of Tasks matching Image 5 */}
            {visibleTasks.map((task, index) => {
              const isDone = task.status === 'done';
              const tagText = tagOf(task);
              const tagColor = tagText === 'Research' ? '#D7B7EE' : tagText === 'Health' ? '#F1A6A6' : tagText === 'Planning' ? '#D8C5A8' : '#C6DF9C';

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 px-4 sm:px-5 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_5px_16px_-10px_rgba(48,35,21,.45)] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:bg-white dark:hover:bg-black/55 hover:shadow-[0_12px_24px_-14px_rgba(48,35,21,.55)] hover:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-400/50 ${
                    isDone ? 'opacity-75' : ''
                  }`}
                  style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
                >
                  <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-amber-300 to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.createdAt) {
                          onToggleComplete(task.id);
                        }
                      }}
                      aria-label={isDone ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition shadow-sm ${
                        isDone 
                          ? 'bg-emerald-600 text-white' 
                          : 'border-2 border-stone-600 dark:border-stone-400 hover:border-emerald-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <span className={`text-base sm:text-lg font-handwriting font-semibold text-stone-900 dark:text-white truncate ${
                      isDone ? 'line-through text-stone-500 dark:text-white/50' : ''
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Category Badge Pill on Right */}
                  <span 
                    className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs max-w-[110px] truncate"
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
            {visibleTasks.length === 0 && sectionTasks.length === 0 && (
              <button type="button" onClick={() => onQuickAdd('A small step')} className="w-full rounded-2xl border border-dashed border-amber-800/25 bg-amber-100/35 dark:bg-white/5 p-7 text-left transition hover:border-amber-500/60 hover:bg-amber-100/55 focus:outline-none focus:ring-2 focus:ring-amber-400/50">
                <span className="block font-handwriting text-2xl font-bold text-stone-800 dark:text-white">A little breathing room.</span>
                <span className="mt-1 block text-xs text-stone-600 dark:text-white/55">This page is clear for now. Add a note when something comes to mind.</span>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-stone-950"><Plus className="h-3.5 w-3.5" /> Add a note</span>
              </button>
            )}
            {visibleTasks.length === 0 && sectionTasks.length > 0 && (
              <div className="rounded-2xl border border-dashed border-stone-400/50 bg-white/45 dark:bg-black/15 p-6 text-center">
                <p className="font-handwriting text-xl font-bold text-stone-700 dark:text-white/80">No notes in this stack.</p>
                <button type="button" onClick={() => setActiveTagFilter(null)} className="mt-2 text-xs font-bold text-amber-800 dark:text-amber-300 underline underline-offset-2">Show all notes</button>
              </div>
            )}
          </div>

          {/* ===================================================================
              AUTHENTIC YELLOW STICKY NOTE PINNED ON BOTTOM RIGHT matching Image 5
              "You're doing great! :)"
              =================================================================== */}
          <div 
            className="relative self-center lg:sticky lg:top-5 w-44 sm:w-48 p-4 mt-2 lg:mt-8 rounded-2xl shadow-xl border border-amber-300 text-center select-none"
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

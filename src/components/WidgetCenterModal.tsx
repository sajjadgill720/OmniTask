import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layout, 
  Clock, 
  Check, 
  Play, 
  Pause, 
  Maximize2, 
  Sparkles, 
  Star,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Task, WidgetType } from '../types';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import confetti from 'canvas-confetti';

interface WidgetCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  audioEnabled: boolean;
}

export const WidgetCenterModal: React.FC<WidgetCenterModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleComplete,
  onToggleTimer,
  audioEnabled,
}) => {
  if (!isOpen) return null;

  const [activeWidget, setActiveWidget] = useState<WidgetType>('today_focus');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick for Standby mode
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayTasks = tasks.filter(t => t.section === 'today');
  const pendingToday = todayTasks.filter(t => t.status !== 'done');
  const completedToday = todayTasks.filter(t => t.status === 'done');

  const handleCheck = (taskId: string, isDone: boolean) => {
    onToggleComplete(taskId);
    if (!isDone) {
      if (audioEnabled) playCompletionSound();
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#15171c] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Interactive Widgets Hub
              </h3>
              <p className="text-[11px] text-slate-400">
                Interactive widgets inspired by TickTick & Apple Reminders lock-screens.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Selector Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveWidget('today_focus')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'today_focus'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Today Focus Widget</span>
          </button>

          <button
            onClick={() => setActiveWidget('standby_clock')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'standby_clock'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Standby Desk Clock</span>
          </button>
        </div>

        {/* WIDGET PREVIEW AREA */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[340px]">
          
          {/* 1. TODAY FOCUS WIDGET */}
          {activeWidget === 'today_focus' && (
            <div className="w-full max-w-md bg-white dark:bg-[#1a1c24] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 select-none">
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">TODAY</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {completedToday.length}/{todayTasks.length} Done
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pendingToday.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All today's tasks completed!
                  </div>
                )}

                {pendingToday.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={() => handleCheck(task.id, task.status === 'done')}
                        className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 hover:border-blue-500 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {task.status === 'done' && <Check className="w-2.5 h-2.5 text-blue-500 stroke-[3]" />}
                      </button>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleTimer(task.id)}
                      className={`p-1 rounded-md text-xs font-mono flex items-center gap-1 ${
                        task.isTimerRunning ? 'text-rose-600 animate-pulse font-bold' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(task.timeSpentSeconds)}</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 2. STANDBY DESK CLOCK WIDGET */}
          {activeWidget === 'standby_clock' && (
            <div className="w-full max-w-lg bg-black text-white rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
              
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>STANDBY DESK DISPLAY</span>
                <span className="font-mono text-emerald-400">● LIVE FOCUS</span>
              </div>

              {/* Big Digital Clock */}
              <div className="text-center my-4">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Next Top Task to focus on */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                  CURRENT PRIORITY TASK
                </span>
                {pendingToday[0] ? (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
                    <span className="text-xs font-medium text-white truncate max-w-[280px]">
                      {pendingToday[0].title}
                    </span>
                    <button
                      onClick={() => handleCheck(pendingToday[0].id, false)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No pending priority tasks.</div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>Interactive actions sync instantly with your main workspace.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Widgets
          </button>
        </div>

      </div>

    </div>
  );
};


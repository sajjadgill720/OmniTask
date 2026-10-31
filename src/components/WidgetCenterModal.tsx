import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layout, 
  Clock, 
  Check, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles, 
  Star,
  CheckCircle2,
  Calendar,
  Volume2,
  VolumeX,
  Plus,
  Maximize2,
  Minimize2,
  Flame,
  Pin,
  FileText,
  Palette
} from 'lucide-react';
import { Task, WidgetType } from '../types';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound, playPomodoroChime } from '../utils/permissions';
import { STICKY_COLORS } from '../constants/theme';
import confetti from 'canvas-confetti';

interface WidgetCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onAddTask?: (title: string, section?: string, colorHex?: string) => void;
  audioEnabled: boolean;
  onToggleFloatingWidget?: (type: 'sticky' | 'pomodoro' | null) => void;
  floatingWidgetType?: 'sticky' | 'pomodoro' | null;
}

export const WidgetCenterModal: React.FC<WidgetCenterModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleComplete,
  onToggleTimer,
  onAddTask,
  audioEnabled,
  onToggleFloatingWidget,
  floatingWidgetType,
}) => {
  if (!isOpen) return null;

  const [activeWidget, setActiveWidget] = useState<WidgetType>('today_focus');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Standby Display States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  // Today Focus Widget States
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [quickInput, setQuickInput] = useState('');

  // Pomodoro Timer States (25 minutes = 1500 seconds)
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(2);
  const [selectedPomoTaskId, setSelectedPomoTaskId] = useState<string>('');

  // Quick Sticky Pad States
  const [stickyNoteText, setStickyNoteText] = useState('Refine corporate presentation & finalize deliverables.');
  const [stickyColor, setStickyColor] = useState('#fef08a');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomoActive && pomoSeconds > 0) {
      interval = setInterval(() => {
        setPomoSeconds(prev => prev - 1);
      }, 1000);
    } else if (pomoSeconds === 0 && pomoActive) {
      setPomoActive(false);
      setPomoSessions(s => s + 1);
      if (audioEnabled) playPomodoroChime();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#3b82f6'],
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoActive, pomoSeconds, audioEnabled]);

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

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickInput.trim();
    if (!trimmed || !onAddTask) return;
    onAddTask(trimmed, 'today');
    setQuickInput('');
  };

  const handleSaveStickyToWall = () => {
    const trimmed = stickyNoteText.trim();
    if (!trimmed || !onAddTask) return;
    onAddTask(trimmed, 'today', stickyColor);
    if (audioEnabled) playCompletionSound();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
      colors: [stickyColor, '#3b82f6'],
    });
  };

  // Pomodoro Progress Ring calculation
  const pomoTotal = 25 * 60;
  const pomoProgress = (pomoTotal - pomoSeconds) / pomoTotal;
  const pomoRadius = 45;
  const pomoCircumference = 2 * Math.PI * pomoRadius;
  const pomoDashoffset = pomoCircumference - pomoProgress * pomoCircumference;

  const pomoMinutes = Math.floor(pomoSeconds / 60);
  const pomoSecs = pomoSeconds % 60;
  const pomoFormatted = `${pomoMinutes.toString().padStart(2, '0')}:${pomoSecs.toString().padStart(2, '0')}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 ${isFullscreen ? 'p-0' : ''}`}>
      
      <div className={`relative w-full ${isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-3xl rounded-3xl'} bg-white dark:bg-[#13151c] border border-slate-200/90 dark:border-white/10 shadow-2xl p-5 sm:p-7 overflow-y-auto max-h-[92vh] flex flex-col justify-between transition-all`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Interactive Widgets Hub
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                  Pro Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interactive desktop widgets, Pomodoro focus blocks & Standby desk display.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Desk Display'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Tab Widget Selector Suite */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl text-xs font-bold">
          
          <button
            onClick={() => setActiveWidget('today_focus')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'today_focus'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="truncate">Today Focus</span>
          </button>

          <button
            onClick={() => setActiveWidget('pomodoro')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'pomodoro'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate">Pomodoro Timer</span>
          </button>

          <button
            onClick={() => setActiveWidget('standby_clock')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'standby_clock'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate">Standby Clock</span>
          </button>

          <button
            onClick={() => setActiveWidget('sticky_pad')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'sticky_pad'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate">Quick Sticky</span>
          </button>

        </div>

        {/* WIDGET STAGE AREA */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-slate-50 dark:bg-black/30 rounded-3xl border border-slate-200/80 dark:border-white/5 min-h-[380px]">
          
          {/* 1. TODAY FOCUS WIDGET (Lockscreen & Banner Format) */}
          {activeWidget === 'today_focus' && (
            <div className={`w-full ${widgetSize === 'small' ? 'max-w-xs' : widgetSize === 'medium' ? 'max-w-md' : 'max-w-lg'} bg-white dark:bg-[#1a1c26] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-5 select-none transition-all`}>
              
              {/* Widget Header & Controls */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">TODAY'S EXECUTION</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {completedToday.length}/{todayTasks.length} Done
                  </span>

                  {/* Size toggles */}
                  <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => setWidgetSize('small')}
                      className={`px-1.5 py-0.5 rounded ${widgetSize === 'small' ? 'bg-white dark:bg-slate-800 shadow-xs' : 'text-slate-400'}`}
                      title="Compact 2x2"
                    >
                      S
                    </button>
                    <button
                      onClick={() => setWidgetSize('medium')}
                      className={`px-1.5 py-0.5 rounded ${widgetSize === 'medium' ? 'bg-white dark:bg-slate-800 shadow-xs' : 'text-slate-400'}`}
                      title="Standard 4x2"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setWidgetSize('large')}
                      className={`px-1.5 py-0.5 rounded ${widgetSize === 'large' ? 'bg-white dark:bg-slate-800 shadow-xs' : 'text-slate-400'}`}
                      title="Expanded 4x4"
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Input in Widget */}
              {onAddTask && (
                <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5 mb-3 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Quick add to Today..."
                    className="flex-1 bg-transparent px-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!quickInput.trim()}
                    className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              )}

              {/* Tasks List */}
              <div className={`space-y-1.5 ${widgetSize === 'small' ? 'max-h-40' : widgetSize === 'medium' ? 'max-h-56' : 'max-h-72'} overflow-y-auto pr-1`}>
                {pendingToday.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All today's tasks completed!
                  </div>
                )}

                {pendingToday.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={() => handleCheck(task.id, task.status === 'done')}
                        className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 hover:border-amber-500 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {task.status === 'done' && <Check className="w-2.5 h-2.5 text-amber-500 stroke-[3]" />}
                      </button>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleTimer(task.id)}
                      className={`p-1 rounded-md text-[10px] font-mono flex items-center gap-1 ${
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

          {/* 2. POMODORO DEEP FOCUS ENGINE WIDGET */}
          {activeWidget === 'pomodoro' && (
            <div className="w-full max-w-md bg-white dark:bg-[#1a1c26] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 text-center select-none">
              
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  <span>Pomodoro Engine</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <span>Streak:</span>
                  <span className="font-mono text-amber-500 font-extrabold">🔥 {pomoSessions} Blocks</span>
                </span>
              </div>

              {/* Circular Animated Countdown Progress Ring */}
              <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                <svg className="w-44 h-44 -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={pomoRadius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={pomoRadius}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="7"
                    strokeDasharray={pomoCircumference}
                    strokeDashoffset={pomoDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {pomoFormatted}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    {pomoActive ? 'FOCUSING' : 'READY'}
                  </span>
                </div>
              </div>

              {/* Task Linking Dropdown */}
              <div className="mb-4 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Linked Task:
                </label>
                <select
                  value={selectedPomoTaskId}
                  onChange={(e) => setSelectedPomoTaskId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">— Focus on general tasks —</option>
                  {pendingToday.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPomoActive(!pomoActive)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md ${
                    pomoActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                  }`}
                >
                  {pomoActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{pomoActive ? 'Pause Session' : 'Start 25m Focus'}</span>
                </button>

                <button
                  onClick={() => {
                    setPomoActive(false);
                    setPomoSeconds(25 * 60);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPomoSeconds(s => s + 5 * 60)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  title="Add 5 Minutes"
                >
                  +5m
                </button>
              </div>

            </div>
          )}

          {/* 3. STANDBY DESK DISPLAY WIDGET (Nightstand Clock) */}
          {activeWidget === 'standby_clock' && (
            <div className={`w-full max-w-lg ${nightMode ? 'bg-red-950/80 text-red-500 border-red-900' : 'bg-black text-white border-slate-800'} rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between border select-none transition-colors`}>
              
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="font-bold tracking-widest uppercase">STANDBY DESK DISPLAY</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNightMode(!nightMode)}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold cursor-pointer"
                  >
                    {nightMode ? 'Normal Glow' : 'Night Vision Red'}
                  </button>
                  <span className="font-mono text-emerald-400">● LIVE</span>
                </div>
              </div>

              {/* Big Digital Flip Clock */}
              <div className="text-center my-6">
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs uppercase tracking-widest mt-2 opacity-70">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Next Top Task to focus on */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                  TOP PRIORITY FOCUS
                </span>
                {pendingToday[0] ? (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs font-semibold truncate max-w-[280px]">
                      {pendingToday[0].title}
                    </span>
                    <button
                      onClick={() => handleCheck(pendingToday[0].id, false)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Complete
                    </button>
                  </div>
                ) : (
                  <div className="text-xs opacity-50">All priority tasks cleared for today.</div>
                )}
              </div>

            </div>
          )}

          {/* 4. QUICK STICKY PAD WIDGET */}
          {activeWidget === 'sticky_pad' && (
            <div className="w-full max-w-sm flex flex-col items-center">
              
              {/* The Miniature Real Sticky Note */}
              <div 
                style={{ backgroundColor: stickyColor }}
                className="w-64 h-64 p-5 rounded-2xl shadow-xl border border-black/10 flex flex-col justify-between relative transition-all"
              >
                {/* Pin at Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-600 shadow-sm border border-rose-800" />

                <div className="flex-1">
                  <span className="block text-[10px] font-black uppercase text-black/40 mb-1">
                    JOT NOTE
                  </span>
                  <textarea
                    rows={5}
                    value={stickyNoteText}
                    onChange={(e) => setStickyNoteText(e.target.value)}
                    placeholder="Write a quick thought or task..."
                    className="w-full h-40 bg-transparent text-xl font-handwriting text-blue-900 placeholder-blue-900/40 focus:outline-none resize-none leading-snug"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[10px] text-black/60 font-handwriting">
                  <span>Auto-syncs with Today</span>
                  <span>📌 Post-it</span>
                </div>
              </div>

              {/* Color Bar and Save to Wall Button */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-white/10">
                  {STICKY_COLORS.slice(0, 5).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickyColor(c.colorHex)}
                      style={{ backgroundColor: c.colorHex }}
                      className={`w-5 h-5 rounded-full border transition-transform ${stickyColor === c.colorHex ? 'scale-125 ring-2 ring-blue-500' : 'border-black/10'}`}
                      title={c.name}
                    />
                  ))}
                </div>

                <button
                  onClick={handleSaveStickyToWall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Stick to Today's Wall
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Interactive widgets sync live with your workspace database.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};

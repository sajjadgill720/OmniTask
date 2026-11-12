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
  Maximize2,
  Minimize2,
  Flame,
  FileText,
  Pin
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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#291b12]/75 backdrop-blur-md animate-in fade-in duration-150 ${isFullscreen ? 'p-0' : ''}`}>
      
      <div className={`relative w-full ${isFullscreen ? 'h-[100dvh] max-w-none rounded-none' : 'max-h-[94dvh] max-w-5xl rounded-[26px]'} bg-[#f5ead5] dark:bg-[#252018] border border-[#c3925d]/70 dark:border-[#70583d] shadow-[0_30px_90px_rgba(30,18,9,.52),inset_0_1px_rgba(255,255,255,.75)] p-4 sm:p-6 overflow-y-auto flex flex-col transition-all`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#9e7048]/25 dark:border-[#d4b58a]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-950/20">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-stone-900 dark:text-amber-50">
                  Omni Sticky Widgets
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-300/60 text-amber-950 text-[10px] font-black uppercase tracking-wide">
                  Your desk, at a glance
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                Handwritten task cards, a focus timer, a desk clock, and a quick jot pad.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/10 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Desk Display'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Tab Widget Selector Suite */}
        <div role="tablist" aria-label="Widget preview" className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5 bg-[#68452d] dark:bg-[#17130f] p-1.5 rounded-2xl border border-[#ba8a56]/70 dark:border-[#715438] text-xs font-bold shadow-[0_5px_12px_rgba(53,34,18,.18)]">
          
          <button
            role="tab"
            aria-selected={activeWidget === 'today_focus'}
            onClick={() => setActiveWidget('today_focus')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'today_focus'
                ? 'bg-[#f9dc79] text-stone-950 shadow-[0_3px_7px_rgba(25,16,8,.28)]'
                : 'text-amber-50/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="truncate">Today Focus</span>
          </button>

          <button
            role="tab"
            aria-selected={activeWidget === 'pomodoro'}
            onClick={() => setActiveWidget('pomodoro')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'pomodoro'
                ? 'bg-[#f9dc79] text-stone-950 shadow-[0_3px_7px_rgba(25,16,8,.28)]'
                : 'text-amber-50/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate">Pomodoro Timer</span>
          </button>

          <button
            role="tab"
            aria-selected={activeWidget === 'standby_clock'}
            onClick={() => setActiveWidget('standby_clock')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'standby_clock'
                ? 'bg-[#f9dc79] text-stone-950 shadow-[0_3px_7px_rgba(25,16,8,.28)]'
                : 'text-amber-50/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate">Standby Clock</span>
          </button>

          <button
            role="tab"
            aria-selected={activeWidget === 'sticky_pad'}
            onClick={() => setActiveWidget('sticky_pad')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeWidget === 'sticky_pad'
                ? 'bg-[#f9dc79] text-stone-950 shadow-[0_3px_7px_rgba(25,16,8,.28)]'
                : 'text-amber-50/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate">Quick Sticky</span>
          </button>

        </div>

        {/* WIDGET STAGE AREA (Clean, cozy backdrop - corkboard removed) */}
        <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 min-h-[300px] sm:min-h-[380px] max-h-[64dvh] overflow-y-auto rounded-2xl bg-black/5 dark:bg-black/35 border border-black/10 dark:border-white/10 shadow-inner">
          
          {/* 1. TODAY FOCUS WIDGET (Lockscreen & Banner Format) */}
          {activeWidget === 'today_focus' && (
            <div className={`realistic-postit paper-edge relative w-full ${widgetSize === 'small' ? 'max-w-xs' : widgetSize === 'medium' ? 'max-w-md' : 'max-w-lg'} rounded-[5px_10px_7px_9px] border border-amber-900/20 bg-[#fff0a8] p-5 text-stone-900 shadow-[0_18px_30px_-16px_rgba(41,23,10,.72)] select-none transition-all`}>
              <span aria-hidden="true" className="widget-paper-pin" />
              
              {/* Widget Header & Controls */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-900/15">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-handwriting font-bold text-xl text-stone-900">Today's focus</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-handwriting text-lg font-bold text-amber-900">
                    {completedToday.length}/{todayTasks.length} Done
                  </span>

                  {/* Size toggles */}
                  <div className="flex items-center p-0.5 bg-amber-900/10 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => setWidgetSize('small')}
                      className={`px-1.5 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${widgetSize === 'small' ? 'bg-[#fffaf0] text-stone-900 shadow-sm' : 'text-stone-600'}`}
                      title="Compact 2x2"
                    >
                      S
                    </button>
                    <button
                      onClick={() => setWidgetSize('medium')}
                      className={`px-1.5 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${widgetSize === 'medium' ? 'bg-[#fffaf0] text-stone-900 shadow-sm' : 'text-stone-600'}`}
                      title="Standard 4x2"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setWidgetSize('large')}
                      className={`px-1.5 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${widgetSize === 'large' ? 'bg-[#fffaf0] text-stone-900 shadow-sm' : 'text-stone-600'}`}
                      title="Expanded 4x4"
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Input in Widget */}
              {onAddTask && (
                <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5 mb-3 p-1.5 bg-white/55 border border-amber-900/10 rounded-lg shadow-inner">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Quick add to Today..."
                    className="flex-1 bg-transparent px-2 text-sm font-handwriting text-stone-900 placeholder-stone-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!quickInput.trim()}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-amber-950 font-bold text-xs rounded-md shadow-sm cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              )}

              {/* Tasks List */}
              <div className={`space-y-1.5 ${widgetSize === 'small' ? 'max-h-40' : widgetSize === 'medium' ? 'max-h-56' : 'max-h-72'} overflow-y-auto pr-1`}>
                {pendingToday.length === 0 && (
                  <div className="text-center py-8 text-sm font-handwriting text-stone-700">
                    <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2 opacity-80" />
                    All today's tasks completed!
                  </div>
                )}

                {pendingToday.map((task, index) => (
                  <div
                    key={task.id}
                    style={{ backgroundColor: ['#fff9b8', '#d8edb7', '#ffd5b1', '#e5d2f5'][index % 4] }}
                    className="realistic-postit paper-edge relative flex min-h-12 items-center justify-between gap-2 rounded-[3px_7px_4px_6px] border border-black/10 px-3 py-2 pl-4 shadow-[0_7px_12px_-8px_rgba(30,18,9,.7)] transition hover:-translate-y-0.5"
                  >
                    <span aria-hidden="true" className="widget-mini-pin" />
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={() => handleCheck(task.id, task.status === 'done')}
                        aria-label={`Complete ${task.title}`}
                        className="w-4 h-4 rounded-full border-2 border-stone-600/70 hover:border-emerald-700 flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
                      >
                        {task.status === 'done' && <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />}
                      </button>
                      <span className="text-lg font-handwriting font-semibold text-stone-900 truncate">
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleTimer(task.id)}
                      aria-label={`${task.isTimerRunning ? 'Pause' : 'Start'} timer for ${task.title}`}
                      className={`p-1 rounded-md text-xs font-handwriting flex items-center gap-1 ${
                        task.isTimerRunning ? 'text-rose-700 animate-pulse font-bold' : 'text-stone-600'
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
            <div className="realistic-postit paper-edge relative w-full max-w-md rounded-[5px_12px_8px_10px] border border-amber-900/20 bg-[#fff0a8] p-6 text-center text-stone-900 shadow-[0_18px_30px_-16px_rgba(41,23,10,.72)] select-none">
              <span aria-hidden="true" className="widget-paper-pin" />
              
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-amber-900/15">
                <span className="font-handwriting text-xl font-bold text-stone-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-700" />
                  <span>Focus session</span>
                </span>
                <span className="text-sm font-handwriting font-bold text-stone-700 flex items-center gap-1">
                  <span>Streak:</span>
                  <span className="font-handwriting text-amber-900 font-bold">🔥 {pomoSessions} blocks</span>
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
                    className="text-amber-900/15"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={pomoRadius}
                    fill="transparent"
                    stroke="#19866a"
                    strokeWidth="7"
                    strokeDasharray={pomoCircumference}
                    strokeDashoffset={pomoDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black font-mono tracking-tight text-stone-900">
                    {pomoFormatted}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mt-1">
                    {pomoActive ? 'FOCUSING' : 'READY'}
                  </span>
                </div>
              </div>

              {/* Task Linking Dropdown */}
              <div className="mb-4 text-left">
                <label className="block text-xs font-handwriting font-bold text-stone-700 mb-1">
                  Pin this session to a task
                </label>
                <select
                  value={selectedPomoTaskId}
                  onChange={(e) => setSelectedPomoTaskId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-handwriting font-semibold bg-white/55 border border-amber-900/20 rounded-lg text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 cursor-pointer"
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
                      ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-900/20'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20'
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
                  className="p-2.5 rounded-xl bg-white/60 hover:bg-white text-stone-700 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPomoSeconds(s => s + 5 * 60)}
                  className="px-3 py-2.5 rounded-xl bg-white/60 hover:bg-white text-stone-800 font-bold text-xs transition cursor-pointer"
                  title="Add 5 Minutes"
                >
                  +5m
                </button>
              </div>

            </div>
          )}

          {/* 3. STANDBY DESK DISPLAY WIDGET (Nightstand Clock) */}
          {activeWidget === 'standby_clock' && (
            <div className="relative w-full max-w-lg rounded-2xl border-4 border-stone-700/60 bg-stone-900/90 p-1.5 shadow-2xl select-none">
              <span aria-hidden="true" className="widget-paper-pin" />
              <div className={`${nightMode ? 'bg-[#250e0b] text-red-400 border-red-950' : 'bg-[#171714] text-amber-50 border-black'} rounded-[6px] p-5 sm:p-7 shadow-inner flex flex-col justify-between border transition-colors`}>
              
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
            </div>
          )}

          {/* 4. QUICK STICKY PAD WIDGET */}
          {activeWidget === 'sticky_pad' && (
            <div className="w-full max-w-sm flex flex-col items-center">
              
              {/* The Miniature Real Sticky Note */}
              <div 
                style={{ backgroundColor: stickyColor }}
                className="realistic-postit paper-edge w-64 h-64 p-5 pt-7 rounded-[4px_10px_6px_8px] shadow-[0_18px_28px_-14px_rgba(39,22,10,.7)] border border-black/15 flex flex-col justify-between relative transition-all"
              >
                <span aria-hidden="true" className="widget-paper-pin" />

                <div className="flex-1">
                  <span className="block text-sm font-handwriting font-bold text-black/55 mb-1">
                    A quick thought
                  </span>
                  <textarea
                    rows={5}
                    value={stickyNoteText}
                    onChange={(e) => setStickyNoteText(e.target.value)}
                    placeholder="Write a quick thought or task..."
                    className="paper-ruling-lines w-full h-40 bg-transparent text-xl font-handwriting text-stone-900 placeholder-stone-700/50 focus:outline-none resize-none leading-[28px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/15 text-xs text-black/65 font-handwriting">
                  <span>Save this note to Today</span>
                  <span className="flex items-center gap-1"><Pin className="h-3 w-3" /> Paper note</span>
                </div>
              </div>

              {/* Color Bar and Save to Wall Button */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 p-1.5 bg-[#68452d] rounded-xl shadow-md border border-[#ba8a56]">
                  {STICKY_COLORS.slice(0, 5).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickyColor(c.colorHex)}
                      style={{ backgroundColor: c.colorHex }}
                      className={`w-6 h-6 rounded-full border border-white/65 transition-transform ${stickyColor === c.colorHex ? 'scale-110 ring-2 ring-amber-300' : 'hover:scale-110'}`}
                      title={c.name}
                    />
                  ))}
                </div>

                <button
                  onClick={handleSaveStickyToWall}
                  className="px-4 py-2 bg-amber-300 hover:bg-amber-200 text-stone-950 font-bold text-sm rounded-lg shadow-md transition cursor-pointer"
                >
                  Stick to Today's Wall
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#9e7048]/25 dark:border-[#d4b58a]/15 flex items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-300">
          <span className="font-handwriting text-sm">Your workspace, written on paper.</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#68452d] hover:bg-[#54341f] dark:bg-amber-300 dark:hover:bg-amber-200 text-amber-50 dark:text-stone-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Coffee, 
  Headphones, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX,
  Target
} from 'lucide-react';
import { Task, Project } from '../types';
import { soundscape } from '../utils/audioSoundscape';
import { playCompletionSound } from '../utils/permissions';
import { useToast } from './ToastNotification';
import confetti from 'canvas-confetti';

interface FocusRoomViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  audioEnabled: boolean;
}

export const FocusRoomView: React.FC<FocusRoomViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onToggleComplete,
  onUpdateTask,
  audioEnabled,
}) => {
  const { toast } = useToast();

  // Timer state
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60); // 25 mins
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(2);
  const targetSessions = 4;

  // Distraction-free mode
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);

  // Ambient soundscape mode
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'cafe' | 'binaural'>('off');
  const [soundVolume, setSoundVolume] = useState<number>(0.3);

  // Active task selection
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
    return activeTasks[0]?.id || null;
  });

  const currentTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || activeTasks[0] || null;
  }, [tasks, selectedTaskId, activeTasks]);

  const currentProject = useMemo(() => {
    if (!currentTask?.projectId) return null;
    return projects.find(p => p.id === currentTask.projectId) || null;
  }, [currentTask, projects]);

  const setFocusDurationPreset = (minutes: number) => {
    setIsActive(false);
    setSessionType('focus');
    setTotalSeconds(minutes * 60);
    setSecondsRemaining(minutes * 60);
    toast.info(`Focus session set to ${minutes} minutes`);
  };

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      // Completed timer phase
      if (sessionType === 'focus') {
        if (audioEnabled) playCompletionSound();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setCompletedSessions(prev => prev + 1);

        // Accumulate focus time to the task for real analytics tracking
        if (currentTask) {
          onUpdateTask({
            ...currentTask,
            timeSpentSeconds: (currentTask.timeSpentSeconds || 0) + totalSeconds,
            updatedAt: new Date().toISOString(),
          });
          toast.success(`Completed ${Math.round(totalSeconds / 60)}m focus on "${currentTask.title}"!`);
        } else {
          toast.success(`Completed ${Math.round(totalSeconds / 60)}m focus session!`);
        }

        setSessionType('break');
        setTotalSeconds(5 * 60);
        setSecondsRemaining(5 * 60);
      } else {
        toast.info('Break finished! Ready for next focus block?');
        setSessionType('focus');
        setTotalSeconds(25 * 60);
        setSecondsRemaining(25 * 60);
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, sessionType, audioEnabled, currentTask, totalSeconds, onUpdateTask, toast]);

  // Ambient Sound Controller
  useEffect(() => {
    if (ambientSound === 'off') {
      soundscape.stop();
    } else {
      soundscape.play(ambientSound, soundVolume);
    }
    return () => {
      soundscape.stop();
    };
  }, [ambientSound]);

  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    const initial = sessionType === 'focus' ? 25 * 60 : 5 * 60;
    setTotalSeconds(initial);
    setSecondsRemaining(initial);
  };

  const skipTimer = () => {
    setIsActive(false);
    if (sessionType === 'focus') {
      setSessionType('break');
      setTotalSeconds(5 * 60);
      setSecondsRemaining(5 * 60);
    } else {
      setSessionType('focus');
      setTotalSeconds(25 * 60);
      setSecondsRemaining(25 * 60);
    }
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress ratio (0 to 1)
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const strokeRadius = 130;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 py-4 transition-all duration-300 ${isDistractionFree ? 'scale-[1.02]' : ''}`}>
      
      {/* Top Quote Inscription matching Mockup */}
      <div className="text-center mb-6 select-none">
        <p className="text-xl sm:text-2xl text-stone-700/90 dark:text-amber-100/90 font-serif italic drop-shadow-xs">
          “Small steps every day lead to remarkable places.”
        </p>
      </div>

      {/* Main Focus Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left / Center: Large Circular Focus Timer */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          
          {/* Circular Timer Stage */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
            
            {/* Ambient Radial Glow Halo */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-30 pointer-events-none"
              style={{
                background: sessionType === 'focus' 
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.1) 60%, transparent 80%)'
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.1) 60%, transparent 80%)'
              }}
            />

            {/* SVG Timer Arc Ring */}
            <svg className="w-full h-full -rotate-90 drop-shadow-2xl">
              {/* Background Track */}
              <circle
                cx="50%"
                cy="50%"
                r={strokeRadius}
                fill="transparent"
                stroke="rgba(0, 0, 0, 0.35)"
                strokeWidth="14"
                className="dark:stroke-white/10"
              />
              {/* Active Glowing Progress Ring */}
              <circle
                cx="50%"
                cy="50%"
                r={strokeRadius}
                fill="transparent"
                stroke={sessionType === 'focus' ? '#F8D979' : '#C6DF9C'}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                style={{
                  filter: `drop-shadow(0 0 12px ${sessionType === 'focus' ? 'rgba(248, 217, 121, 0.6)' : 'rgba(198, 223, 156, 0.6)'})`,
                }}
              />
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
              
              {/* Digital Time Display */}
              <h1 
                className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-white drop-shadow-md"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {timeFormatted}
              </h1>

              {/* Session Subtitle */}
              <p className="text-sm font-semibold text-amber-200/90 uppercase tracking-widest mt-1">
                {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
              </p>

              {/* Play / Pause Tactile Center Button */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isActive ? 'Pause Focus' : 'Start Focus'}
                >
                  {isActive ? (
                    <Pause className="w-6 h-6 fill-stone-950" />
                  ) : (
                    <Play className="w-6 h-6 fill-stone-950 ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={skipTimer}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-bold border border-white/15 transition cursor-pointer"
                  title="Skip to next phase"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Duration Presets */}
              <div className="flex items-center gap-1.5 mt-3">
                {[15, 25, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFocusDurationPreset(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      totalSeconds === mins * 60 && sessionType === 'focus'
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Inspirational Subtext quote */}
          <div className="mt-4 text-center">
            <p className="text-xs text-stone-600 dark:text-stone-300 font-serif italic max-w-md">
              “Discipline is choosing between what you want now and what you want most.” — Abraham Lincoln
            </p>
          </div>

        </div>

        {/* Right Side: Current Task Card, Session Progress & Break Timer Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Current Task Card */}
          <div className="p-5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Task</span>
              </span>
              {currentTask && (
                <button
                  type="button"
                  onClick={() => onSelectTask(currentTask)}
                  className="text-white/50 hover:text-white p-1 rounded transition"
                  title="Edit task details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {currentTask ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(currentTask.id)}
                    className="w-4 h-4 mt-0.5 rounded-full border-2 border-white/40 hover:border-emerald-400 transition shrink-0"
                    title="Mark task done"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white font-handwriting leading-snug">
                      {currentTask.title}
                    </h3>
                    {currentProject && (
                      <span className="text-[10px] text-white/60 block mt-0.5">
                        {currentProject.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {currentTask.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-bold text-indigo-300">
                      {tag}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-mono text-white/70">
                    {Math.round(totalSeconds / 60)}m focus
                  </span>
                </div>

                {/* Task Switcher Selector */}
                {activeTasks.length > 1 && (
                  <div className="pt-2 border-t border-white/10 mt-2">
                    <label className="text-[10px] text-white/50 block mb-1 font-mono uppercase">
                      Switch Focus Task:
                    </label>
                    <select
                      value={currentTask?.id || ''}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      {activeTasks.map(t => (
                        <option key={t.id} value={t.id} className="bg-stone-900 text-white">
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-white/50 text-xs">
                <span>No active task selected</span>
              </div>
            )}
          </div>

          {/* Session Progress Card */}
          <div className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-white/70">Session Progress</span>
              <span className="font-mono text-amber-300">{completedSessions} / {targetSessions}</span>
            </div>
            {/* Progress Segmented Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: targetSessions }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx < completedSessions 
                      ? 'bg-amber-400 shadow-xs shadow-amber-400/40' 
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Break Timer Card */}
          <div 
            onClick={() => {
              setSessionType('break');
              setTotalSeconds(5 * 60);
              setSecondsRemaining(5 * 60);
              setIsActive(true);
            }}
            className="p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex items-center justify-between cursor-pointer hover:bg-black/55 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white/80 block">Break Timer</span>
                <span className="text-[10px] text-white/50">Rest your eyes & hydrate</span>
              </div>
            </div>
            <span className="text-base font-mono font-bold text-emerald-400 group-hover:scale-105 transition">
              5:00
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Floating Environment Controls Bar */}
      <div className="mt-8 flex items-center justify-center gap-3 select-none flex-wrap">
        
        {/* Distraction-Free Toggle */}
        <button
          type="button"
          onClick={() => setIsDistractionFree(!isDistractionFree)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer backdrop-blur-xl ${
            isDistractionFree 
              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md' 
              : 'bg-black/45 text-white/80 border-white/15 hover:text-white hover:bg-black/60'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>{isDistractionFree ? 'Focus Mode Active' : 'Focus Mode'}</span>
        </button>

        {/* Ambient Sounds Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const modes: ('off' | 'rain' | 'cafe' | 'binaural')[] = ['off', 'rain', 'cafe', 'binaural'];
              const nextIndex = (modes.indexOf(ambientSound) + 1) % modes.length;
              setAmbientSound(modes[nextIndex]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer backdrop-blur-xl ${
              ambientSound !== 'off' 
                ? 'bg-indigo-500/40 text-indigo-200 border-indigo-400/50 shadow-md' 
                : 'bg-black/45 text-white/80 border-white/15 hover:text-white hover:bg-black/60'
            }`}
            title="Cycle Ambient Sounds (Rain, Cafe, Binaural, Off)"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>
              {ambientSound === 'off' ? 'Ambient Sounds' : `Sound: ${ambientSound.toUpperCase()}`}
            </span>
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-black/45 text-white/80 border border-white/15 hover:text-white hover:bg-black/60 backdrop-blur-xl transition cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fullscreen</span>
        </button>

      </div>

    </div>
  );
};


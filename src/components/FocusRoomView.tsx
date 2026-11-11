import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Headphones, 
  Maximize2, 
  Moon, 
  Edit3, 
  CheckCircle2,
  Volume2
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

/**
 * FocusRoomView
 * Immersive study room matching Image 3 reference:
 * - Left: Floating Frosted Card (Current Task: "Finish RETECO paper summary" + Edit)
 * - Center: Large Circular Focus Timer (25:00 + Focus Session + Glowing Yellow Ring + Play Button)
 * - Right: Session Progress (2/4 + Gold Bar) & Break in (5:00 + Coffee Cup)
 * - Below Timer: Authentic Handwritten Inscription:
 *   "Discipline is choosing between what you want now and what you want most." — Abraham Lincoln
 * - Bottom Floating Pill Toolbar: Focus Mode | Ambient Sounds | Fullscreen
 */
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

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      if (sessionType === 'focus') {
        if (audioEnabled) playCompletionSound();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setCompletedSessions(prev => prev + 1);

        if (currentTask) {
          onUpdateTask({
            ...currentTask,
            timeSpentSeconds: (currentTask.timeSpentSeconds || 0) + totalSeconds,
          });
        }
        toast.success('Focus session completed! Enjoy a refreshing break.');
        setSessionType('break');
        setTotalSeconds(5 * 60);
        setSecondsRemaining(5 * 60);
      } else {
        if (audioEnabled) playCompletionSound();
        toast.info('Break completed! Ready for your next focus session?');
        setSessionType('focus');
        setTotalSeconds(25 * 60);
        setSecondsRemaining(25 * 60);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, sessionType, totalSeconds, currentTask, audioEnabled, onUpdateTask, toast]);

  // Soundscape audio controller
  useEffect(() => {
    soundscape.stop();
    if (ambientSound !== 'off') {
      soundscape.play(ambientSound, 0.3);
    }
    return () => {
      soundscape.stop();
    };
  }, [ambientSound]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const initial = sessionType === 'focus' ? 25 * 60 : 5 * 60;
    setTotalSeconds(initial);
    setSecondsRemaining(initial);
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular progress math
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const strokeRadius = 125;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (progressRatio || 0.65) * circumference;

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 py-6 transition-all duration-300 select-none ${isDistractionFree ? 'scale-[1.02]' : ''}`}>
      
      {/* 3-Column Ergonomic Grid matching Image 3 Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* =====================================================================
            LEFT CARD: Current Task
            ===================================================================== */}
        <div className="lg:col-span-3 flex justify-center lg:justify-start">
          <div className="w-full max-w-[280px] p-5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-white/70 pb-2 border-b border-white/10">
              <span>Current Task</span>
              {currentTask && (
                <button
                  type="button"
                  onClick={() => onSelectTask(currentTask)}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                  title="Edit task"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-sans text-white leading-snug break-words">
                {currentTask?.title || 'Finish RETECO paper summary'}
              </h3>
              {currentProject && (
                <span className="text-xs font-medium text-amber-300/80 block">
                  {currentProject.title}
                </span>
              )}
            </div>

            {/* Task switcher if multiple available */}
            {activeTasks.length > 1 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <select
                  value={currentTask?.id || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full text-xs font-medium bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-white/90 focus:outline-none cursor-pointer"
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
        </div>

        {/* =====================================================================
            CENTER: Circular Focus Timer + Handwritten Quote
            ===================================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          
          {/* Circular Stage with Glowing Ring */}
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
            
            {/* Ambient Radial Halo */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-25 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(217, 119, 6, 0.1) 60%, transparent 80%)'
              }}
            />

            {/* Circular Progress Ring */}
            <svg className="w-full h-full -rotate-90 drop-shadow-2xl">
              <circle
                cx="50%"
                cy="50%"
                r={strokeRadius}
                fill="rgba(0, 0, 0, 0.35)"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="12"
              />
              <circle
                cx="50%"
                cy="50%"
                r={strokeRadius}
                fill="transparent"
                stroke="#F8D979"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(248, 217, 121, 0.6))',
                }}
              />
            </svg>

            {/* Inner Content: 25:00 + Focus Session + Yellow Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <h1 
                className="text-6xl sm:text-7xl font-sans font-black tracking-tight text-white drop-shadow-md"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {timeFormatted}
              </h1>

              <p className="text-xs font-semibold text-amber-200/90 uppercase tracking-widest mt-1">
                {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
              </p>

              {/* Yellow Tactile Play / Pause Button matching Image 3 */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isActive ? 'Pause timer' : 'Start focus timer'}
                >
                  {isActive ? (
                    <Pause className="w-5 h-5 fill-stone-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Authentic Handwritten Inscription Directly on Wall below Timer matching Image 3 */}
          <div className="mt-6 text-center max-w-md px-4">
            <p 
              className="text-lg sm:text-xl text-stone-900/90 dark:text-amber-100/90 font-serif italic drop-shadow-xs leading-snug"
              style={{
                fontFamily: "'Homemade Apple', 'Caveat', serif",
                textShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }}
            >
              “Discipline is choosing between what you want now and what you want most.”
            </p>
            <p className="text-xs text-stone-700/80 dark:text-amber-200/70 font-serif italic mt-1">
              — Abraham Lincoln
            </p>
          </div>

        </div>

        {/* =====================================================================
            RIGHT CARDS: Session Progress & Break in (Stacked)
            ===================================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-4 items-center lg:items-end">
          
          {/* Top Card: Session Progress */}
          <div className="w-full max-w-[260px] p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
            <span className="text-xs font-semibold text-white/70 block mb-1">
              Session Progress
            </span>
            <div className="text-2xl font-black text-white font-mono mb-2">
              {completedSessions} / {targetSessions}
            </div>
            {/* Horizontal Gold Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                style={{ width: `${(completedSessions / targetSessions) * 100}%` }}
              />
            </div>
          </div>

          {/* Bottom Card: Break in 5:00 */}
          <div 
            onClick={() => {
              setSessionType('break');
              setTotalSeconds(5 * 60);
              setSecondsRemaining(5 * 60);
              setIsActive(true);
            }}
            className="w-full max-w-[260px] p-4 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex items-center justify-between cursor-pointer hover:bg-black/55 transition group"
          >
            <div className="flex items-center gap-3">
              <Coffee className="w-6 h-6 text-amber-200" />
              <div>
                <span className="text-xs font-semibold text-white/70 block">Break in</span>
                <span className="text-xl font-bold font-mono text-white">5:00</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* =====================================================================
          BOTTOM FLOATING PILL TOOLBAR matching Image 3 Reference:
          Focus Mode | Ambient Sounds | Fullscreen
          ===================================================================== */}
      <div className="mt-12 flex items-center justify-center gap-3 select-none flex-wrap">
        
        {/* Focus Mode Toggle */}
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
          title="Cycle Ambient Sounds"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>{ambientSound === 'off' ? 'Ambient Sounds' : `Sound: ${ambientSound.toUpperCase()}`}</span>
        </button>

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

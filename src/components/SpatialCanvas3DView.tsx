import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft,
  Plus,
  Check,
  Calendar,
  Zap,
  FolderPlus,
  FilePlus,
  Sparkles,
  MousePointer,
  StickyNote,
  Type,
  Image as ImageIcon,
  Link2,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronDown
} from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import { RedPushPin, PinColor } from './RedPushPin';
import { checkDueDate } from '../utils/storage';
import confetti from 'canvas-confetti';

interface SpatialCanvas3DViewProps {
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
  onQuickAdd: (status?: Task['status']) => void;
  onReorderTasks?: (sourceId: string, targetId: string) => void;
  onMoveTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
  onBack?: () => void;
  onOpenNewProject?: () => void;
}

// 8 Pinboard slots matching reference photo exactly
interface CorkboardSlot {
  id: string;
  defaultTitle: string;
  bg: string;
  pin: PinColor;
  tag: string;
  date: string;
  completed?: boolean;
}

const DEFAULT_SLOTS: CorkboardSlot[] = [
  { id: 'slot-1', defaultTitle: 'Prepare presentation', bg: '#FEE575', pin: 'red', tag: 'Work', date: 'Nov 14' },
  { id: 'slot-2', defaultTitle: 'Update portfolio with new projects', bg: '#BAEBC7', pin: 'green', tag: 'Personal', date: 'Today' },
  { id: 'slot-3', defaultTitle: 'Plan next sprint', bg: '#FFAFA8', pin: 'blue', tag: 'Work', date: 'Nov 15' },
  { id: 'slot-4', defaultTitle: 'Financial literacy', bg: '#DDBDF5', pin: 'blue', tag: 'Finance', date: 'Nov 11' },
  { id: 'slot-5', defaultTitle: 'Research LLM evaluation methods', bg: '#BDE3F5', pin: 'yellow', tag: 'Research', date: 'Sat, Nov 8' },
  { id: 'slot-6', defaultTitle: 'Gym session', bg: '#DCF0B9', pin: 'green', tag: 'Health', date: 'Today', completed: true },
];

export const SpatialCanvas3DView: React.FC<SpatialCanvas3DViewProps> = ({
  title,
  subtitle,
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  audioEnabled,
  onQuickAdd,
  onBack,
  onOpenNewProject,
}) => {
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'text' | 'image' | 'link' | 'grid'>('sticky');
  const [memoText, setMemoText] = useState('Keep going! 😊');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Map real tasks onto slots
  const displayedNotes = useMemo(() => {
    return DEFAULT_SLOTS.map((slot, idx) => {
      const realTask = tasks[idx];
      return {
        slot,
        task: realTask || {
          id: `virtual_${slot.id}`,
          title: slot.defaultTitle,
          status: slot.completed ? 'done' : 'todo',
          priority: 'normal',
          tags: [slot.tag],
          section: 'today',
          colorHex: slot.bg,
          checklists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeSpentSeconds: 0,
        } as Task,
      };
    });
  }, [tasks]);

  // Upcoming real tasks
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .slice(0, 3);
  }, [tasks]);

  const handleCheckTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onToggleComplete(task.id);
    if (audioEnabled) playCompletionSound();
    if (task.status !== 'done') {
      confetti({
        particleCount: 25,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#FEE575', '#BAEBC7', '#FFAFA8', '#3B82F6'],
      });
    }
  };

  const mountainPhotoUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="w-full flex items-start justify-center gap-3 sm:gap-4 lg:gap-5 pb-8 select-none font-sans">
      
      {/* 
        1. FLOATING VERTICAL TOOL PALETTE (Docked Next to Left Sidebar)
        Matching Reference Photo: [ ↖, 📝 (active), T, 🖼️, 🔗, ⊞ ]
      */}
      <div className="shrink-0 flex flex-col gap-2 p-1.5 bg-black/65 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl z-20 mt-10">
        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'select' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Selection Tool (↖)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('sticky')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'sticky' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Sticky Note Tool (📝)"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('text')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'text' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Text Tool (T)"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('image')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'image' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Image Tool (🖼️)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('link')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'link' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Connector Tool (🔗)"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('grid')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'grid' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Templates & Grid (⊞)"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* 
        2. CENTERPIECE: SOLID WOODEN BEVELED CORKBOARD
        Amorim natural cork pinboard with 6 pinned sticky notes + 1 Polaroid + 1 Memo
      */}
      <div className="flex-1 min-w-0 max-w-4xl flex flex-col items-center">
        
        {/* Header Pill Capsule Above Corkboard */}
        <div className="w-full flex items-center justify-between p-2 mb-2 bg-white/40 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm gap-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-2.5 py-1 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Return to Desk Workspace"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Desk Workspace</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-base">🏛️</span>
              <span className="font-bold text-sm text-stone-900 tracking-tight">Executive Standup Wall</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 text-[11px] font-mono font-bold">
                {tasks.length} Deliverables
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 font-medium hidden md:block">
            Corporate Sprint Review • Live physical digital twin of your team workspace.
          </p>

          {/* Zoom / Fullscreen Suite */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/60 text-white text-xs font-mono font-bold shadow-xs">
              <span>100%</span>
              <ChevronDown className="w-3 h-3 text-stone-300" />
            </div>
            <button
              type="button"
              className="p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition cursor-pointer shadow-xs"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 
          SOLID BEVELED WOODEN CORKBOARD FRAME
          Amorim natural cork pinboard texture with physical depth & shadows
        */}
        <div 
          className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden border-[14px] sm:border-[18px] md:border-[20px] border-[#7D4F27]"
          style={{
            backgroundColor: '#B58249',
            backgroundImage: `
              radial-gradient(circle at 60% 40%, rgba(220, 165, 100, 0.45) 0%, rgba(160, 105, 55, 0.35) 60%),
              radial-gradient(circle at 20% 80%, rgba(140, 85, 40, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, #C28F54 0%, #A67038 50%, #8C5524 100%)
            `,
            boxShadow: `
              0 30px 60px -15px rgba(45, 25, 10, 0.45),
              0 15px 25px -5px rgba(0, 0, 0, 0.2),
              inset 0 4px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 3px rgba(255, 255, 255, 0.2)
            `,
          }}
        >
          {/* Amorim Cork Granular Texture Speckles */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 30%, #5E3814 1.5px, transparent 2px),
                radial-gradient(circle at 75% 65%, #3E240D 1.5px, transparent 2px),
                radial-gradient(circle at 45% 85%, #8B5827 2px, transparent 2.5px),
                radial-gradient(circle at 85% 20%, #F5CE98 1.5px, transparent 2px)
              `,
              backgroundSize: '40px 40px, 35px 35px, 50px 50px, 45px 45px',
            }}
          />

          {/* 
            PINNED CONTENT GRID ON CORKBOARD (2 Rows x 4 Columns)
            Matching Reference Photo Exactly!
          */}
          <div className="relative z-10 w-full p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start justify-items-center">
            
            {/* ROW 1: Note 1 (Yellow), Note 2 (Green), Note 3 (Pink), Mountain Polaroid */}
            {displayedNotes.slice(0, 3).map(({ slot, task }, idx) => {
              const isDone = task.status === 'done';
              const rotation = idx === 0 ? -1.5 : idx === 1 ? 0.8 : -1.2;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-pointer shadow-lg select-none"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    backgroundColor: slot.bg,
                    boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                  }}
                  title="Click sticky note to open in full detail"
                >
                  {/* 3D Push-Pin at Top Center */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                    <RedPushPin size={30} color={slot.pin} />
                  </div>

                  {/* Top Row: Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleCheckTask(e, task)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-600 border-emerald-700 text-white' 
                          : 'border-stone-800/40 hover:border-stone-900 bg-black/5 hover:bg-black/10'
                      }`}
                      title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                  </div>

                  {/* Note Title in Authentic Marker Handwriting */}
                  <div className="my-auto px-0.5">
                    <p className={`font-handwriting font-bold text-stone-900 text-base sm:text-lg leading-tight line-clamp-3 ${
                      isDone ? 'line-through opacity-55' : ''
                    }`}>
                      {task.title}
                    </p>
                  </div>

                  {/* Bottom Meta: Date & Tag */}
                  <div className="pt-1 flex items-center justify-between text-[10px] font-bold border-t border-black/10">
                    <span className="text-stone-700/80">{slot.date}</span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                      {slot.tag}
                    </span>
                  </div>

                  {/* Paper Dog-Ear Curl */}
                  <div className="paper-dogear-curl" />
                </div>
              );
            })}

            {/* Alpine Mountain Polaroid Photo with Black Binder Clip */}
            <div 
              onClick={() => setSelectedPhoto(mountainPhotoUrl)}
              className="relative w-36 sm:w-40 md:w-44 bg-white p-2.5 pb-4 rounded-xs shadow-xl rotate-[1.5deg] hover:scale-105 hover:z-30 transition-all cursor-pointer group"
              style={{
                boxShadow: '0 15px 30px -5px rgba(45, 25, 10, 0.38), 0 4px 8px rgba(0,0,0,0.15)',
              }}
              title="Click photo to view full image"
            >
              {/* Black Metal Binder Clip at Top Center */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
                <div className="w-5 h-4 border-2 border-stone-300 rounded-t-sm mb-[-2px]" />
                <div className="w-7 h-3.5 bg-stone-900 rounded-xs shadow-xs border border-stone-800" />
              </div>

              {/* Photo Image */}
              <div className="w-full aspect-4/3 overflow-hidden rounded-2xs bg-stone-100">
                <img 
                  src={mountainPhotoUrl} 
                  alt="Alpine Mountain Summit" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>

            {/* ROW 2: Note 4 (Purple), Note 5 (Blue), Note 6 (Lime - Checked), Crumpled Memo */}
            {displayedNotes.slice(3, 6).map(({ slot, task }, idx) => {
              const isDone = task.status === 'done' || slot.completed;
              const rotation = idx === 0 ? 1.0 : idx === 1 ? -1.8 : 0.5;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-pointer shadow-lg select-none"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    backgroundColor: slot.bg,
                    boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                  }}
                  title="Click sticky note to open in full detail"
                >
                  {/* 3D Push-Pin at Top Center */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                    <RedPushPin size={30} color={slot.pin} />
                  </div>

                  {/* Top Row: Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleCheckTask(e, task)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-600 border-emerald-700 text-white' 
                          : 'border-stone-800/40 hover:border-stone-900 bg-black/5 hover:bg-black/10'
                      }`}
                      title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                  </div>

                  {/* Note Title in Authentic Marker Handwriting */}
                  <div className="my-auto px-0.5">
                    <p className={`font-handwriting font-bold text-stone-900 text-base sm:text-lg leading-tight line-clamp-3 ${
                      isDone ? 'line-through opacity-55' : ''
                    }`}>
                      {task.title}
                    </p>
                  </div>

                  {/* Bottom Meta: Date & Tag */}
                  <div className="pt-1 flex items-center justify-between text-[10px] font-bold border-t border-black/10">
                    <span className="text-stone-700/80">{slot.date}</span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                      {slot.tag}
                    </span>
                  </div>

                  {/* Paper Dog-Ear Curl */}
                  <div className="paper-dogear-curl" />
                </div>
              );
            })}

            {/* Crumpled Craft Paper Memo: "Keep going! 😊" */}
            <div 
              onClick={() => setIsEditingMemo(true)}
              className="relative w-36 sm:w-40 md:w-44 p-3.5 pt-4.5 rounded-xs rotate-[1.5deg] shadow-lg hover:scale-105 hover:z-30 transition-all cursor-pointer select-none"
              style={{
                backgroundColor: '#F5EBE1',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF5EE 0%, #E8D9C8 100%)',
                boxShadow: '0 10px 20px -3px rgba(45, 25, 10, 0.28), 0 2px 5px rgba(0,0,0,0.1)',
              }}
              title="Click to edit personal memo"
            >
              {/* Semi-translucent Masking Tape at Top */}
              <div 
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 w-14 h-4 shadow-xs border-y border-white/20 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(225, 175, 110, 0.85)',
                  transform: 'rotate(2deg)',
                }}
              />

              {/* Memo Text in Ballpoint Ink */}
              {isEditingMemo ? (
                <input
                  type="text"
                  autoFocus
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  onBlur={() => setIsEditingMemo(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingMemo(false); }}
                  className="w-full font-handwriting text-xl font-black text-stone-900 bg-transparent border-b border-black/20 outline-none text-center"
                />
              ) : (
                <div className="text-center py-2.5">
                  <p className="font-handwriting font-black text-2xl text-stone-900 leading-tight">
                    {memoText}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 
        3. RIGHT SIDEBAR WORKSPACE PANELS (Matching Reference Photo)
        - Upcoming panel
        - Quick Actions panel
        - You're doing great! card
      */}
      <div className="w-64 sm:w-72 xl:w-80 flex flex-col gap-3 z-20 shrink-0">
        
        {/* 1. UPCOMING PANEL */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-stone-200/60 dark:border-white/10 shadow-lg text-stone-900 dark:text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-amber-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming</span>
            </div>
            <span className="text-[10px] font-bold text-stone-500 hover:text-stone-900 dark:text-stone-300 cursor-pointer">
              View all →
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium">CS251 DAA Assignment</span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Tomorrow</span>
            </div>

            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-medium">NTAC Planning Meeting</span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Fri, 4:00 PM</span>
            </div>

            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">SemEval RETECO Review</span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Sat, 6:00 PM</span>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS PANEL */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-stone-200/60 dark:border-white/10 shadow-lg text-stone-900 dark:text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 pb-2 mb-2 border-b border-stone-200 dark:border-white/10">
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Actions</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onQuickAdd('todo')}
              className="w-full py-2 px-3 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
              <span>+ Add Task</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickAdd('todo')}
              className="w-full py-2 px-3 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
              <span>New Note</span>
            </button>

            {onOpenNewProject && (
              <button
                type="button"
                onClick={onOpenNewProject}
                className="w-full py-2 px-3 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                <span>New Project</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. MOTIVATIONAL PROGRESS CARD */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-stone-200/60 dark:border-white/10 shadow-lg flex items-center justify-between text-stone-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold">You're doing great!</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-300">Keep going, on track →</p>
            </div>
          </div>
          <span className="text-xl">🏔️</span>
        </div>

      </div>

      {/* FULL PHOTO LIGHTBOX PREVIEW MODAL */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-2xl w-full bg-white p-3 rounded-2xl shadow-2xl relative"
          >
            <img src={selectedPhoto} alt="Preview" className="w-full max-h-[75vh] object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 p-2 bg-black/70 text-white rounded-full hover:bg-black transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft,
  Plus,
  Check,
  Calendar,
  MousePointer,
  StickyNote,
  Type,
  Image as ImageIcon,
  Link2,
  Grid,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { Task, Project } from '../types';
import { playCompletionSound } from '../utils/permissions';
import { RedPushPin, PinColor } from './RedPushPin';
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

interface DefaultNoteDef {
  id: string;
  defaultTitle: string;
  bg: string;
  pin: PinColor;
  tag: string;
  date: string;
  completed?: boolean;
}

const TODO_DEFAULTS: DefaultNoteDef[] = [
  { id: 'todo-1', defaultTitle: 'Prepare presentation', bg: '#FEE575', pin: 'red', tag: 'Work', date: 'Nov 14' },
  { id: 'todo-2', defaultTitle: 'Financial literacy', bg: '#FFAFA8', pin: 'blue', tag: 'Finance', date: 'Nov 11' },
  { id: 'todo-3', defaultTitle: 'Plan Q4 strategy', bg: '#FEE575', pin: 'red', tag: 'Work', date: 'Nov 16' },
];

const IN_PROGRESS_DEFAULTS: DefaultNoteDef[] = [
  { id: 'prog-1', defaultTitle: 'Update portfolio with new projects', bg: '#BAEBC7', pin: 'green', tag: 'Personal', date: 'Today' },
  { id: 'prog-2', defaultTitle: 'Research LLM evaluation methods', bg: '#BDE3F5', pin: 'yellow', tag: 'Research', date: 'Sat, Nov 8' },
  { id: 'prog-3', defaultTitle: 'Build DemoFlow v2.0', bg: '#DDBDF5', pin: 'purple', tag: 'Project', date: 'Nov 13' },
];

const DONE_DEFAULTS: DefaultNoteDef[] = [
  { id: 'done-1', defaultTitle: 'Gym session', bg: '#FFAFA8', pin: 'blue', tag: 'Health', date: 'Today', completed: true },
  { id: 'done-2', defaultTitle: 'Email professor (Shaif Chowdhury)', bg: '#DCF0B9', pin: 'green', tag: 'Work', date: 'Done • 1d ago', completed: true },
];

const SKYLINE_PHOTO_URL = 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80';
const MOUNTAIN_PHOTO_URL = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';

export const SpatialCanvas3DView: React.FC<SpatialCanvas3DViewProps> = ({
  tasks,
  onToggleComplete,
  onSelectTask,
  audioEnabled,
  onQuickAdd,
  onMoveTaskStatus,
  onBack,
}) => {
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'text' | 'image' | 'link' | 'grid'>('sticky');
  const [memoText, setMemoText] = useState('Dream Bigger 😊');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

  // Group real tasks by status
  const realTodo = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const realInProgress = useMemo(() => tasks.filter(t => t.status === 'in_progress'), [tasks]);
  const realDone = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

  // Merge real tasks with reference slots so the board is always full and beautiful
  const todoItems = useMemo(() => {
    return TODO_DEFAULTS.map((def, idx) => {
      const real = realTodo[idx];
      return {
        def,
        task: real || ({
          id: `virtual_${def.id}`,
          title: def.defaultTitle,
          status: 'todo',
          priority: 'normal',
          tags: [def.tag],
          section: 'today',
          colorHex: def.bg,
          checklists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeSpentSeconds: 0,
        } as Task),
      };
    });
  }, [realTodo]);

  const inProgressItems = useMemo(() => {
    return IN_PROGRESS_DEFAULTS.map((def, idx) => {
      const real = realInProgress[idx];
      return {
        def,
        task: real || ({
          id: `virtual_${def.id}`,
          title: def.defaultTitle,
          status: 'in_progress',
          priority: 'normal',
          tags: [def.tag],
          section: 'today',
          colorHex: def.bg,
          checklists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeSpentSeconds: 0,
        } as Task),
      };
    });
  }, [realInProgress]);

  const doneItems = useMemo(() => {
    return DONE_DEFAULTS.map((def, idx) => {
      const real = realDone[idx];
      return {
        def,
        task: real || ({
          id: `virtual_${def.id}`,
          title: def.defaultTitle,
          status: 'done',
          priority: 'normal',
          tags: [def.tag],
          section: 'today',
          colorHex: def.bg,
          checklists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeSpentSeconds: 0,
        } as Task),
      };
    });
  }, [realDone]);

  // Completion toggle with sound and confetti
  const handleCheckTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onToggleComplete(task.id);
    if (audioEnabled) playCompletionSound();
    if (task.status !== 'done') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FEE575', '#BAEBC7', '#FFAFA8', '#3B82F6'],
      });
    }
  };

  // Drag and drop handlers between corkboard columns
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    if (onMoveTaskStatus) {
      onMoveTaskStatus(taskId, targetStatus);
    } else {
      const found = tasks.find(t => t.id === taskId);
      if (found) {
        if (targetStatus === 'done' && found.status !== 'done') {
          onToggleComplete(taskId);
        } else if (targetStatus !== 'done' && found.status === 'done') {
          onToggleComplete(taskId);
        }
      }
    }

    if (audioEnabled) playCompletionSound();
    if (targetStatus === 'done') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FEE575', '#BAEBC7', '#FFAFA8', '#3B82F6'],
      });
    }
  };

  return (
    <div className="w-full flex items-start justify-center gap-3 sm:gap-4 lg:gap-5 pb-8 select-none font-sans">
      
      {/* 
        1. FLOATING VERTICAL TOOL PALETTE (Docked beside left sidebar)
        Matching Reference Photo: [ ↖, 📝 (active), T, 🖼️, 🔗, ⊞ ]
      */}
      <div className="shrink-0 flex flex-col gap-2 p-1.5 bg-black/65 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl z-20 mt-12">
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
          onClick={() => {
            setActiveTool('sticky');
            onQuickAdd('todo');
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'sticky' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Sticky Note Tool (📝) - Click to add note"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTool('text');
            setIsEditingMemo(true);
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'text' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Text Tool (T) - Edit corkboard memo"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTool('image');
            setSelectedPhoto(SKYLINE_PHOTO_URL);
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeTool === 'image' ? 'bg-white/20 text-white' : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title="Image Tool (🖼️) - View photographs"
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
        2. CENTERPIECE: SOLID BEVELED WOODEN CORKBOARD
        Pure centerpiece — NO DUPLICATE right sidebar here!
        (StudioRightPanel.tsx on the far right handles the Upcoming, Quick Actions, and Productivity panels)
      */}
      <div className="flex-1 min-w-0 max-w-5xl flex flex-col items-center">
        
        {/* Header Pill Capsule Above Corkboard */}
        <div className="w-full flex items-center justify-between p-2 mb-2.5 bg-white/45 dark:bg-black/35 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/15 shadow-sm gap-2">
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
              <span className="font-bold text-sm text-stone-900 dark:text-white tracking-tight">Executive Standup Wall</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-200 text-[11px] font-mono font-bold">
                {tasks.length} Deliverables
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium hidden md:block">
            Corporate Sprint Review • Live physical digital twin of your team workspace.
          </p>

          {/* Zoom / Fullscreen Suite */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 text-white text-xs font-mono font-bold shadow-xs">
              <span>100%</span>
              <ChevronDown className="w-3 h-3 text-stone-300" />
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition cursor-pointer shadow-xs"
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
              0 30px 60px -15px rgba(45, 25, 10, 0.50),
              0 15px 25px -5px rgba(0, 0, 0, 0.25),
              inset 0 4px 12px rgba(0, 0, 0, 0.45),
              inset 0 1px 3px rgba(255, 255, 255, 0.25)
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
            3-COLUMN PHYSICAL PINBOARD WORKSPACE
            Matching media_1794486913010_1bde6093.jpg:
            Column 1: TO DO (Tape Header, Skyline Photo, Torn Memo, 3 Notes)
            Column 2: IN PROGRESS (Tape Header, 3 Notes)
            Column 3: DONE (Tape Header, 2 Checked Notes, Mountain Photo w/ Binder Clip)
          */}
          <div className="relative z-10 w-full p-4 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
            
            {/* =======================================================================
                COLUMN 1: TO DO
                ======================================================================= */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'todo')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'todo')}
              className={`flex flex-col items-center gap-3.5 transition-all duration-200 rounded-2xl p-1.5 ${
                dragOverCol === 'todo' ? 'bg-black/10 ring-2 ring-amber-400' : ''
              }`}
            >
              {/* Masking Tape Header: TO DO */}
              <div 
                className="relative px-6 py-1.5 shadow-md border-y border-stone-300/40 select-none flex items-center justify-between gap-3 w-44 sm:w-48"
                style={{
                  backgroundColor: '#F5EBE1',
                  backgroundImage: 'linear-gradient(90deg, #EFE2D3 0%, #F8F1E7 50%, #EFE2D3 100%)',
                  transform: 'rotate(-0.8deg)',
                  boxShadow: '0 3px 6px -1px rgba(45, 25, 10, 0.35)',
                }}
              >
                <span className="font-handwriting font-black text-lg text-stone-900 tracking-wider">
                  TO DO
                </span>
                <button
                  type="button"
                  onClick={() => onQuickAdd('todo')}
                  className="w-5 h-5 rounded-full hover:bg-stone-900/10 text-stone-800 flex items-center justify-center transition cursor-pointer"
                  title="Add note to TO DO"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Skyline Sunset Polaroid Photo */}
              <div 
                onClick={() => setSelectedPhoto(SKYLINE_PHOTO_URL)}
                className="relative w-36 sm:w-40 bg-white p-2 pb-3.5 rounded-xs shadow-xl rotate-[-2deg] hover:scale-105 hover:z-30 transition-all cursor-pointer group"
                style={{
                  boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.38), 0 3px 6px rgba(0,0,0,0.15)',
                }}
                title="Click photo to view full image"
              >
                {/* 3D Pushpin at Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                  <RedPushPin size={26} color="red" />
                </div>

                <div className="w-full aspect-4/3 overflow-hidden rounded-2xs bg-stone-100">
                  <img 
                    src={SKYLINE_PHOTO_URL} 
                    alt="City Skyline Sunset" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>

              {/* Torn Craft Paper Memo: "Dream Bigger 😊" */}
              <div 
                onClick={() => setIsEditingMemo(true)}
                className="relative w-36 sm:w-40 p-2.5 pt-3.5 rounded-xs rotate-[2deg] shadow-lg hover:scale-105 hover:z-30 transition-all cursor-pointer select-none"
                style={{
                  backgroundColor: '#F5EBE1',
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF5EE 0%, #E8D9C8 100%)',
                  boxShadow: '0 8px 18px -3px rgba(45, 25, 10, 0.28), 0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Click to edit personal memo"
              >
                {/* Masking Tape at Top */}
                <div 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 w-12 h-3.5 shadow-xs border-y border-white/20 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(225, 175, 110, 0.85)',
                    transform: 'rotate(-1.5deg)',
                  }}
                />

                {isEditingMemo ? (
                  <input
                    type="text"
                    autoFocus
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    onBlur={() => setIsEditingMemo(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingMemo(false); }}
                    className="w-full font-handwriting text-lg font-black text-stone-900 bg-transparent border-b border-black/20 outline-none text-center"
                  />
                ) : (
                  <div className="text-center py-1">
                    <p className="font-handwriting font-black text-xl text-stone-900 leading-tight">
                      {memoText}
                    </p>
                  </div>
                )}
              </div>

              {/* Pinned Sticky Notes in TO DO */}
              {todoItems.map(({ def, task }, idx) => {
                const rotation = idx === 0 ? -1.2 : idx === 1 ? 1.0 : -0.8;
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-grab active:cursor-grabbing shadow-lg select-none"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: def.bg,
                      boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                    }}
                    title="Click to open sticky note in full detail • Drag to move columns"
                  >
                    {/* 3D Push-Pin at Top Center */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                      <RedPushPin size={30} color={def.pin} />
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
                      <span className="text-stone-700/80">{def.date}</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                        {def.tag}
                      </span>
                    </div>

                    {/* Paper Dog-Ear Curl */}
                    <div className="paper-dogear-curl" />
                  </div>
                );
              })}
            </div>

            {/* =======================================================================
                COLUMN 2: IN PROGRESS
                ======================================================================= */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'in_progress')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'in_progress')}
              className={`flex flex-col items-center gap-3.5 transition-all duration-200 rounded-2xl p-1.5 ${
                dragOverCol === 'in_progress' ? 'bg-black/10 ring-2 ring-amber-400' : ''
              }`}
            >
              {/* Masking Tape Header: IN PROGRESS */}
              <div 
                className="relative px-6 py-1.5 shadow-md border-y border-stone-300/40 select-none flex items-center justify-between gap-3 w-48 sm:w-52"
                style={{
                  backgroundColor: '#F5EBE1',
                  backgroundImage: 'linear-gradient(90deg, #EFE2D3 0%, #F8F1E7 50%, #EFE2D3 100%)',
                  transform: 'rotate(0.6deg)',
                  boxShadow: '0 3px 6px -1px rgba(45, 25, 10, 0.35)',
                }}
              >
                <span className="font-handwriting font-black text-lg text-stone-900 tracking-wider">
                  IN PROGRESS
                </span>
                <button
                  type="button"
                  onClick={() => onQuickAdd('in_progress')}
                  className="w-5 h-5 rounded-full hover:bg-stone-900/10 text-stone-800 flex items-center justify-center transition cursor-pointer"
                  title="Add note to IN PROGRESS"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Pinned Sticky Notes in IN PROGRESS */}
              {inProgressItems.map(({ def, task }, idx) => {
                const rotation = idx === 0 ? 0.8 : idx === 1 ? -1.5 : 1.2;
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-grab active:cursor-grabbing shadow-lg select-none"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: def.bg,
                      boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                    }}
                    title="Click to open sticky note in full detail • Drag to move columns"
                  >
                    {/* 3D Push-Pin at Top Center */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                      <RedPushPin size={30} color={def.pin} />
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
                      <span className="text-stone-700/80">{def.date}</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                        {def.tag}
                      </span>
                    </div>

                    {/* Paper Dog-Ear Curl */}
                    <div className="paper-dogear-curl" />
                  </div>
                );
              })}
            </div>

            {/* =======================================================================
                COLUMN 3: DONE
                ======================================================================= */}
            <div 
              onDragOver={(e) => handleColumnDragOver(e, 'done')}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleColumnDrop(e, 'done')}
              className={`flex flex-col items-center gap-3.5 transition-all duration-200 rounded-2xl p-1.5 ${
                dragOverCol === 'done' ? 'bg-black/10 ring-2 ring-emerald-400' : ''
              }`}
            >
              {/* Masking Tape Header: DONE */}
              <div 
                className="relative px-6 py-1.5 shadow-md border-y border-stone-300/40 select-none flex items-center justify-between gap-3 w-40 sm:w-44"
                style={{
                  backgroundColor: '#F5EBE1',
                  backgroundImage: 'linear-gradient(90deg, #EFE2D3 0%, #F8F1E7 50%, #EFE2D3 100%)',
                  transform: 'rotate(-0.5deg)',
                  boxShadow: '0 3px 6px -1px rgba(45, 25, 10, 0.35)',
                }}
              >
                <span className="font-handwriting font-black text-lg text-stone-900 tracking-wider">
                  DONE
                </span>
                <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-900 text-[11px] font-mono font-bold flex items-center justify-center">
                  {realDone.length}
                </span>
              </div>

              {/* Pinned Sticky Notes in DONE (Checked with green Check button) */}
              {doneItems.map(({ def, task }, idx) => {
                const rotation = idx === 0 ? 1.0 : -1.2;
                const isDone = true;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 p-3 rounded-xs flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:z-30 cursor-grab active:cursor-grabbing shadow-lg select-none"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: def.bg,
                      boxShadow: '0 12px 24px -4px rgba(45, 25, 10, 0.32), 0 3px 6px rgba(0,0,0,0.12)',
                    }}
                    title="Click to open sticky note in full detail • Drag to move columns"
                  >
                    {/* 3D Push-Pin at Top Center */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                      <RedPushPin size={30} color={def.pin} />
                    </div>

                    {/* Top Row: Completed Green Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleCheckTask(e, task)}
                        className="w-4 h-4 rounded-full border border-emerald-700 bg-emerald-600 text-white flex items-center justify-center transition cursor-pointer"
                        title="Mark as Incomplete"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Note Title in Authentic Marker Handwriting with strikethrough */}
                    <div className="my-auto px-0.5">
                      <p className="font-handwriting font-bold text-stone-900 text-base sm:text-lg leading-tight line-clamp-3 line-through opacity-70">
                        {task.title}
                      </p>
                    </div>

                    {/* Bottom Meta: Date & Tag */}
                    <div className="pt-1 flex items-center justify-between text-[10px] font-bold border-t border-black/10">
                      <span className="text-stone-700/80">{def.date}</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-black/10 text-stone-900 font-sans text-[9px]">
                        {def.tag}
                      </span>
                    </div>

                    {/* Paper Dog-Ear Curl */}
                    <div className="paper-dogear-curl" />
                  </div>
                );
              })}

              {/* Alpine Mountain Lake Polaroid Photo with Black Metal Binder Clip */}
              <div 
                onClick={() => setSelectedPhoto(MOUNTAIN_PHOTO_URL)}
                className="relative w-36 sm:w-40 bg-white p-2 pb-3.5 rounded-xs shadow-xl rotate-[1.5deg] hover:scale-105 hover:z-30 transition-all cursor-pointer group mt-2"
                style={{
                  boxShadow: '0 14px 28px -5px rgba(45, 25, 10, 0.40), 0 4px 8px rgba(0,0,0,0.15)',
                }}
                title="Click photo to view full image"
              >
                {/* Black Metal Binder Clip at Top Center */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
                  <div className="w-4.5 h-3.5 border-2 border-stone-300 rounded-t-sm mb-[-2px]" />
                  <div className="w-6.5 h-3 bg-stone-900 rounded-xs shadow-xs border border-stone-800" />
                </div>

                <div className="w-full aspect-4/3 overflow-hidden rounded-2xs bg-stone-100">
                  <img 
                    src={MOUNTAIN_PHOTO_URL} 
                    alt="Alpine Mountain Lake" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>

            </div>

          </div>
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

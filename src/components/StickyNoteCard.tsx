import React, { useState } from 'react';
import { 
  Pin, 
  Check, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Palette, 
  Plus, 
  ChevronRight, 
  Calendar,
  Moon,
  Type
} from 'lucide-react';
import { Task, Project } from '../types';
import { checkDueDate, formatDuration } from '../utils/storage';
import { playCompletionSound } from '../utils/permissions';
import { STICKY_COLORS } from '../constants/theme';
import { getPostitPaperStyle, parseColorToRgb, rgbToString } from '../utils/colorUtils';
import { RedPushPin } from './RedPushPin';
import confetti from 'canvas-confetti';

interface StickyNoteCardProps {
  task: Task;
  project?: Project;
  index: number;
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  audioEnabled: boolean;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  task,
  project,
  index,
  onToggleComplete,
  onSelectTask,
  onToggleTimer,
  onUpdateTask,
  onDeleteTask,
  audioEnabled,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [useHandwriting, setUseHandwriting] = useState(true);

  const isDone = task.status === 'done';
  const paperStyle = getPostitPaperStyle(task.colorHex, 'ballpoint_blue');
  const dueInfo = checkDueDate(task.dueDate);

  // Subtle natural angle for post-it note aesthetic (-1.8 deg to +1.8 deg)
  const angles = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.8];
  const naturalAngle = angles[index % angles.length];

  const handleCompleteNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);

    if (!isDone) {
      if (audioEnabled) playCompletionSound();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: [paperStyle.hex, '#dc2626', '#1a56db'],
      });
    }
  };

  const handleToggleChecklistItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const updatedChecklists = task.checklists.map(c => 
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    onUpdateTask({ ...task, checklists: updatedChecklists });
    if (audioEnabled) playCompletionSound();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: 'chk_' + Math.random().toString(36).substring(2, 7),
      text: newChecklistText.trim(),
      completed: false,
    };

    onUpdateTask({
      ...task,
      checklists: [...task.checklists, newItem],
    });
    setNewChecklistText('');
    setIsAddingItem(false);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTask({ ...task, isPinned: !task.isPinned });
  };

  const handleSelectColor = (e: React.MouseEvent, colorStr: string) => {
    e.stopPropagation();
    onUpdateTask({ ...task, colorHex: colorStr });
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const hex = e.target.value;
    const rgb = parseColorToRgb(hex);
    onUpdateTask({ ...task, colorHex: rgbToString(rgb) });
  };

  const handleAdvanceStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: Task['status'] = 'todo';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'done';
    else nextStatus = 'todo';

    onUpdateTask({
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
    });
    if (nextStatus === 'done' && audioEnabled) playCompletionSound();
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      style={{
        transform: `rotate(${naturalAngle}deg)`,
        backgroundColor: paperStyle.baseRgb,
        backgroundImage: `linear-gradient(135deg, ${paperStyle.lightRgb} 0%, ${paperStyle.baseRgb} 55%, ${paperStyle.darkRgb} 100%)`,
        borderColor: paperStyle.borderRgb,
      }}
      className={`group relative flex flex-col justify-between p-5 pt-7 rounded-2xl border transition-all duration-200 cursor-pointer realistic-postit hover:!rotate-0 ${
        isDone ? 'opacity-65 grayscale-20' : ''
      }`}
    >
      {/* 3D Red Pushpin at Top Center (Exact match to reference photo!) */}
      <div 
        onClick={handleTogglePin}
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 cursor-pointer transition-transform hover:scale-125 active:scale-95"
        title={task.isPinned ? 'Pinned Note (Click to unpin)' : 'Click to pin note'}
      >
        <RedPushPin size={34} />
      </div>

      {/* Top Bar: Controls, Stage, Project, and RGB Color Picker */}
      <div className="flex items-center justify-between gap-1 mb-3 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Trello Workflow Stage Badge */}
          <button
            type="button"
            onClick={handleAdvanceStage}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/10 dark:bg-black/30 hover:bg-black/15 text-slate-800 dark:text-slate-100 transition cursor-pointer"
            title="Click to advance status (To Do → Doing → Done)"
          >
            {task.status === 'in_progress' ? 'Doing' : task.status}
          </button>

          {/* Project tag if assigned */}
          {project && (
            <span 
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-200"
              style={{ borderColor: `${project.colorHex}60` }}
            >
              {project.title}
            </span>
          )}
        </div>

        {/* Right tools: Font toggle + RGB Palette Popover Trigger */}
        <div className="flex items-center gap-1">
          {/* Handwriting / Sans Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUseHandwriting(!useHandwriting);
            }}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-md transition opacity-60 group-hover:opacity-100 cursor-pointer text-xs"
            title={useHandwriting ? 'Switch to clean font' : 'Switch to handwriting ballpoint ink'}
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {/* RGB Color Palette Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-md transition opacity-60 group-hover:opacity-100 cursor-pointer"
              title="Select note RGB color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* RGB Color Options Modal/Popover */}
            {showColorPicker && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-30 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-52 animate-pop-in text-xs"
              >
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Post-it RGB Colors</span>
                  <span className="text-[9px] font-mono text-slate-400">{paperStyle.baseRgb}</span>
                </div>

                {/* Preset RGB Swatches */}
                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => handleSelectColor(e, c.rgb)}
                      style={{ backgroundColor: c.rgb }}
                      className={`w-7 h-7 rounded-xl border border-black/15 transition-transform hover:scale-115 cursor-pointer shadow-xs ${
                        task.colorHex === c.rgb || task.colorHex === c.colorHex ? 'ring-2 ring-blue-600 scale-105' : ''
                      }`}
                      title={`${c.name} (${c.rgb})`}
                    />
                  ))}
                </div>

                {/* Custom RGB Color Picker */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
                    <span>Custom RGB:</span>
                  </label>
                  <input
                    type="color"
                    value={paperStyle.hex}
                    onChange={handleCustomColorChange}
                    className="w-8 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    title="Pick custom RGB color"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Title & Body (Handwritten Ballpoint Ink like reference photo) */}
      <div className="mb-3">
        <div className="flex items-start gap-2.5">
          {/* Circular check toggle */}
          <button
            type="button"
            onClick={handleCompleteNote}
            className={`w-5 h-5 mt-1 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              isDone
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-blue-700/60 dark:border-blue-400 hover:border-blue-600 bg-white/50 dark:bg-black/20'
            }`}
            title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <h3 className={`text-xl sm:text-2xl font-bold leading-tight break-words ${
              useHandwriting ? 'font-handwriting ballpoint-blue' : 'font-sans font-bold text-slate-900 dark:text-white'
            } ${isDone ? 'line-through opacity-60' : ''}`}>
              {task.title || 'Untitled Post-it'}
            </h3>

            {task.notes && (
              <p className={`text-base sm:text-lg mt-1 line-clamp-4 leading-snug break-words font-medium ${
                useHandwriting ? 'font-handwriting ballpoint-blue opacity-90' : 'text-xs text-slate-700 dark:text-slate-300'
              }`}>
                {task.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Direct In-Card Checklist with Blue Ink Handwriting */}
      {task.checklists.length > 0 && (
        <div className="space-y-1.5 my-2 pt-2 border-t border-black/10 dark:border-white/10">
          {task.checklists.map(c => (
            <div 
              key={c.id} 
              onClick={(e) => handleToggleChecklistItem(e, c.id)}
              className="flex items-center gap-2 group/item cursor-pointer"
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                c.completed 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-blue-800/60 dark:border-blue-400 bg-white/40'
              }`}>
                {c.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className={`text-base sm:text-lg leading-none ${
                useHandwriting ? 'font-handwriting ballpoint-blue' : 'text-xs text-slate-800 dark:text-slate-200'
              } ${c.completed ? 'line-through opacity-50' : ''}`}>
                {c.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask */}
      {isAddingItem ? (
        <form onSubmit={handleAddChecklistItem} onClick={(e) => e.stopPropagation()} className="my-1.5 flex gap-1">
          <input
            type="text"
            autoFocus
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            placeholder="Add handwritten subtask..."
            className="flex-1 px-2.5 py-1 text-base font-handwriting bg-white/80 dark:bg-black/40 rounded-lg border border-blue-300 dark:border-blue-700 focus:outline-none"
          />
          <button 
            type="submit" 
            className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-bold"
          >
            Add
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsAddingItem(true);
          }}
          className="flex items-center gap-1 text-sm font-handwriting ballpoint-blue hover:underline opacity-80 hover:opacity-100 transition cursor-pointer mt-1 mb-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add subtask</span>
        </button>
      )}

      {/* Bottom Footer: Due Date, Focus Stopwatch & Delete */}
      <div className="pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-1 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Due Date & Evening */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {dueInfo.label && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              dueInfo.isOverdue 
                ? 'bg-rose-500 text-white' 
                : dueInfo.isToday 
                ? 'bg-amber-500 text-slate-900' 
                : 'bg-black/10 dark:bg-white/15 text-slate-800 dark:text-slate-100'
            }`}>
              <Calendar className="w-2.5 h-2.5" />
              <span>{dueInfo.label}</span>
            </span>
          )}

          {task.isThisEvening && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
              <Moon className="w-2.5 h-2.5" />
              <span>Evening</span>
            </span>
          )}

          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[11px] font-handwriting font-bold ballpoint-blue">
              #{tag}
            </span>
          ))}
        </div>

        {/* Stopwatch & Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTimer(task.id);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono transition cursor-pointer ${
              task.isTimerRunning
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 text-slate-800 dark:text-slate-100'
            }`}
            title={task.isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
          >
            {task.isTimerRunning ? (
              <Pause className="w-2.5 h-2.5 fill-white" />
            ) : (
              <Play className="w-2.5 h-2.5" />
            )}
            <span>{formatDuration(task.timeSpentSeconds)}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-1 text-slate-500 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition rounded-md cursor-pointer"
            title="Discard Post-it Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

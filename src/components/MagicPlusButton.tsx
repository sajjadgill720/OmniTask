import React, { useState, useRef, useEffect } from 'react';
import { Plus, Sparkles, Moon, Calendar, Tag, Palette } from 'lucide-react';
import { parseNaturalLanguageTask } from '../utils/nlpParser';
import { Priority, ThingsSection } from '../types';
import { STICKY_COLORS } from '../constants/theme';

interface MagicPlusButtonProps {
  onAddTask: (parsed: {
    title: string;
    dueDate?: string;
    isThisEvening?: boolean;
    priority: Priority;
    tags: string[];
    section: ThingsSection;
    colorHex?: string;
  }) => void;
  currentSection: ThingsSection;
}

export const MagicPlusButton: React.FC<MagicPlusButtonProps> = ({
  onAddTask,
  currentSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(STICKY_COLORS[0].colorHex);
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const parsedPreview = parseNaturalLanguageTask(inputVal);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const parsed = parseNaturalLanguageTask(inputVal);
    if (!parsed.dueDate && currentSection !== 'logbook') {
      parsed.section = currentSection;
    }

    onAddTask({
      ...parsed,
      colorHex: selectedColor,
    });
    setInputVal('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Magic Sticky Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/35 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
          isOpen ? 'rotate-45 bg-slate-800 dark:bg-slate-700' : 'hover:scale-110'
        }`}
        title="Quick Add Sticky Note (N)"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Floating Popover / Smart Quick Add Modal */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1a1c23] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 mb-16 sm:mb-0 animate-slide-up"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Smart Sticky Note Entry</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                "tomorrow", "this evening", "p1", "#tag"
              </span>
            </div>

            {/* Input field */}
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                }}
                placeholder="e.g. Call designer tomorrow 3pm p1 #Design"
                className="w-full text-sm font-semibold bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none mb-3"
              />

              {/* Dynamic Live Tag/Date Badges Preview */}
              <div className="flex items-center gap-1.5 flex-wrap min-h-6 mb-4">
                {parsedPreview.dueDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] font-semibold border border-rose-200 dark:border-rose-900">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{parsedPreview.dueDate}</span>
                  </span>
                )}
                {parsedPreview.isThisEvening && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-900">
                    <Moon className="w-2.5 h-2.5" />
                    <span>This Evening</span>
                  </span>
                )}
                {parsedPreview.priority === 'urgent' && (
                  <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-800">
                    Urgent (P1)
                  </span>
                )}
                {parsedPreview.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                    <Tag className="w-2.5 h-2.5" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>

              {/* Sticky Color Swatches & Custom RGB */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">RGB Color:</span>
                  {STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.rgb)}
                      style={{ backgroundColor: c.rgb }}
                      className={`w-5 h-5 rounded-lg border border-black/15 transition-transform cursor-pointer shadow-2xs ${
                        selectedColor === c.rgb || selectedColor === c.colorHex ? 'ring-2 ring-blue-600 scale-120' : 'hover:scale-110'
                      }`}
                      title={`${c.name} (${c.rgb})`}
                    />
                  ))}
                  <input
                    type="color"
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
                    title="Custom RGB Color"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Create Post-it
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

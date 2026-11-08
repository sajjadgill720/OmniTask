import React, { useState, useMemo } from 'react';
import { getDailyHyperFocusQuote, FocusQuote } from '../utils/quotes';

interface StudioTopMuralProps {
  compact?: boolean;
}

/**
 * StudioTopMural
 * Displays the artistic hand-lettered wall inscription "Dream Big Plan Better" with
 * the golden crown doodle, paired with the 105+ curated daily rotating quote system.
 */
export const StudioTopMural: React.FC<StudioTopMuralProps> = ({ compact = false }) => {
  const [quoteOffset, setQuoteOffset] = useState<number>(0);
  const currentQuote: FocusQuote = useMemo(() => getDailyHyperFocusQuote(quoteOffset), [quoteOffset]);

  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(prev => prev + 1);
  };

  const handlePrevQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(prev => prev - 1);
  };

  const handleResetQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteOffset(0);
  };

  return (
    <div className={`text-center relative select-none ${compact ? 'mb-4' : 'mb-7'}`}>
      
      {/* Hand-lettered Calligraphy Wall Inscription */}
      <div className="relative inline-block mb-1">
        <h2 
          className="text-3xl sm:text-4xl md:text-5xl text-stone-800 dark:text-amber-100/90 font-bold tracking-tight drop-shadow-xs font-handwriting"
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          Dream Big
        </h2>

        {/* Hand-drawn Golden Crown doodle */}
        <div className="absolute -top-3.5 -right-8 text-amber-500/90 text-2xl rotate-12 drop-shadow-xs">
          👑
        </div>

        <p 
          className="text-xl sm:text-2xl md:text-3xl text-stone-700/90 dark:text-amber-200/80 font-semibold tracking-wide font-handwriting -mt-1 ml-5 sm:ml-7"
        >
          Plan Better
        </p>
      </div>

      {/* Dynamic Daily Rotating Motivational Quote System (105+ Curated Quotes) */}
      <div className="mt-1 flex items-center justify-center gap-2 max-w-xl mx-auto px-4">
        <button
          type="button"
          onClick={handlePrevQuote}
          className="p-1 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
          title="Previous inspirational quote"
        >
          ‹
        </button>

        <div className="text-center px-3 py-1 rounded-xl bg-amber-50/60 dark:bg-black/35 border border-amber-200/50 dark:border-white/10 backdrop-blur-xs shadow-2xs">
          <p className="text-xs italic text-stone-700 dark:text-stone-200 font-serif leading-tight">
            “{currentQuote.quote}”
          </p>
          <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] font-sans text-stone-500 dark:text-stone-400 font-medium">
            <span>— {currentQuote.author}</span>
            <span>•</span>
            <span className="font-mono text-amber-700 dark:text-amber-400/90 font-bold">{todayDateString}</span>
            {quoteOffset !== 0 && (
              <button
                type="button"
                onClick={handleResetQuote}
                className="ml-1 text-blue-500 hover:underline cursor-pointer"
              >
                (Today)
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextQuote}
          className="p-1 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
          title="Next inspirational quote"
        >
          ›
        </button>
      </div>

    </div>
  );
};


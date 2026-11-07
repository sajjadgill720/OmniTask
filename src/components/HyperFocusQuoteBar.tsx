import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, Quote } from 'lucide-react';
import { getDailyHyperFocusQuote, HYPER_FOCUS_QUOTES, FocusQuote } from '../utils/quotes';

export const HyperFocusQuoteBar: React.FC = () => {
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [quote, setQuote] = useState<FocusQuote>(() => getDailyHyperFocusQuote(0));
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('omnisticky_quote_dismissed_date') === new Date().toISOString().slice(0, 10);
  });

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextOffset = dayOffset + 1;
    setDayOffset(nextOffset);
    setQuote(getDailyHyperFocusQuote(nextOffset));
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('omnisticky_quote_dismissed_date', new Date().toISOString().slice(0, 10));
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('omnisticky_quote_dismissed_date');
  };

  if (isDismissed) {
    return (
      <div className="flex justify-center mb-3">
        <button
          type="button"
          onClick={handleRestore}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-medium text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded-full transition cursor-pointer"
          title="Show daily focus quotation"
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          <span>Daily Focus Quote</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="group relative mb-5 px-3.5 py-2 rounded-xl bg-amber-50/60 dark:bg-[#1f1b26]/70 border border-amber-200/50 dark:border-white/5 backdrop-blur-xs shadow-2xs transition-all hover:border-amber-300/80 dark:hover:border-white/10"
    >
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Serene Icon + Daily Quote */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-md bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="min-w-0 flex-1 flex items-baseline gap-2 flex-wrap sm:flex-nowrap">
            <p className="text-xs italic text-stone-700 dark:text-stone-200 truncate font-serif select-text">
              “{quote.quote}”
            </p>
            <span className="text-[11px] not-italic font-sans font-medium text-stone-400 dark:text-stone-500 shrink-0">
              — {quote.author}
            </span>
          </div>
        </div>

        {/* Right: Gentle Actions (Quiet & Uncluttered) */}
        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleNextQuote}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="Cycle next daily focus quote"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="Dismiss quote for today"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};


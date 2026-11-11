import React, { useMemo } from 'react';
import { getDailyHyperFocusQuote, FocusQuote } from '../utils/quotes';

interface StudioTopMuralProps {
  compact?: boolean;
}

/**
 * StudioTopMural
 * Displays the hyperrealistic handwritten quote directly on the stucco wall,
 * matching the authentic studio reference photo (Image 1 & Image 3):
 * "Discipline is choosing between what you want now and what you want most."
 * — Abraham Lincoln
 */
export const StudioTopMural: React.FC<StudioTopMuralProps> = ({ compact = false }) => {
  const currentQuote: FocusQuote = useMemo(() => getDailyHyperFocusQuote(0), []);

  return (
    <div className={`text-center relative select-none w-full max-w-3xl mx-auto px-4 ${compact ? 'mb-2' : 'mb-6'}`}>
      {/* Hyperrealistic Handwritten Quote Directly on the Stucco Wall */}
      <div className="relative inline-block py-1">
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl text-stone-900/90 dark:text-amber-100/90 font-serif italic font-medium tracking-tight drop-shadow-xs"
          style={{
            fontFamily: "'Homemade Apple', 'Caveat', 'Playfair Display', Georgia, serif",
            lineHeight: 1.35,
            textShadow: '0 1px 2px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          “{currentQuote.quote}”
        </h2>

        {/* Verified Author Attribution in Fine Italic Ink */}
        {currentQuote.author && (
          <p 
            className="text-sm sm:text-base text-stone-700/80 dark:text-amber-200/70 font-serif italic tracking-wide mt-1 sm:mt-1.5 text-right pr-4 sm:pr-8"
            style={{
              fontFamily: "'Caveat', 'Homemade Apple', cursive, serif",
            }}
          >
            — {currentQuote.author}
          </p>
        )}
      </div>
    </div>
  );
};


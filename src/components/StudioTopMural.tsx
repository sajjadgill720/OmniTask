import React from 'react';

interface StudioTopMuralProps {
  compact?: boolean;
}

/**
 * StudioTopMural
 * Displays the hyperrealistic handwritten quote painted directly on the plaster wall:
 * "Small steps every day lead to remarkable places."
 */
export const StudioTopMural: React.FC<StudioTopMuralProps> = ({ compact = false }) => {
  return (
    <div className={`text-center relative select-none w-full max-w-2xl mx-auto px-4 ${compact ? 'mb-3 sm:mb-4' : 'mb-5 sm:mb-6'}`}>
      <div className="relative inline-block py-0.5">
        <h2 
          className="studio-wall-quote text-2xl sm:text-3xl md:text-[34px] text-stone-900/90 dark:text-amber-200 font-serif italic font-medium tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
          style={{
            fontFamily: "'Homemade Apple', 'Caveat', 'Playfair Display', Georgia, cursive, serif",
            lineHeight: 1.25,
          }}
        >
          “Small steps every day lead to remarkable places.”
        </h2>
      </div>
    </div>
  );
};

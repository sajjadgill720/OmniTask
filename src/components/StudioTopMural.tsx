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
    <div className={`text-center relative select-none w-full max-w-2xl mx-auto px-4 ${compact ? 'mb-1' : 'mb-2.5'}`}>
      <div className="relative inline-block py-0.5">
        <h2 
          className="text-2xl sm:text-3xl md:text-[34px] text-stone-900/90 dark:text-amber-100/90 font-serif italic font-medium tracking-tight"
          style={{
            fontFamily: "'Homemade Apple', 'Caveat', 'Playfair Display', Georgia, cursive, serif",
            lineHeight: 1.25,
            textShadow: '0 1px 2px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          “Small steps every day lead to remarkable places.”
        </h2>
      </div>
    </div>
  );
};

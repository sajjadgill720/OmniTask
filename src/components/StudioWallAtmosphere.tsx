import React, { useState } from 'react';

/**
 * StudioWallAtmosphere
 * Renders the global creative studio environment matching the reference photo:
 * - Directional afternoon sunlight entering from top-right
 * - Soft leaf and window shadows on plaster wall
 * - Polished solid wood desk surface across the bottom
 * - Books ("Build Better Habits", "Deep Work", "Productivity")
 * - White ceramic Knovera coffee mug on cork coaster
 * - MacBook centered in the foreground
 * - Fluted ceramic pen cup with pencils, pens, and brushes
 * - Potted desk plant on the right
 */
export const StudioWallAtmosphere: React.FC = () => {
  return (
    <>
      {/* 1. DIRECTIONAL WARM AFTERNOON SUNLIGHT BEAMS */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 85% 15%, rgba(255, 248, 220, 0.5) 0%, rgba(254, 240, 180, 0.2) 35%, transparent 75%)',
        }}
      />
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 252, 235, 0.4) 0%, rgba(255, 243, 205, 0.15) 30%, transparent 60%)',
        }}
      />

      {/* Hanging Leaf Shadows in Left Corner */}
      <div className="pointer-events-none fixed top-0 left-0 z-10 w-64 sm:w-72 h-80 opacity-80 mix-blend-multiply">
        <svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <path d="M 0 0 Q 40 40 50 120 T 70 240" stroke="#2d4a22" strokeWidth="2.5" fill="none" opacity="0.85" />
          <path d="M 0 10 Q 70 30 110 90 T 140 180" stroke="#365e26" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 45 40 C 30 30 20 50 40 65 C 55 55 60 40 45 40 Z" fill="#4d7c0f" />
          <path d="M 52 50 C 40 45 35 60 50 72 C 62 65 65 52 52 50 Z" fill="#65a30d" />
          <path d="M 30 75 C 15 65 10 85 28 98 C 42 90 45 78 30 75 Z" fill="#3f6212" />
          <path d="M 80 55 C 65 42 60 68 78 82 C 92 75 95 60 80 55 Z" fill="#4d7c0f" />
          <path d="M 105 85 C 90 70 85 95 102 110 C 118 102 120 88 105 85 Z" fill="#65a30d" />
          <path d="M 65 150 C 50 140 48 160 62 172 C 75 165 76 152 65 150 Z" fill="#65a30d" />
        </svg>
      </div>

      {/* 2. SOLID WOODEN HARDWOOD DESK SURFACE ACROSS BOTTOM */}
      <div 
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-28 sm:h-32 z-0 overflow-hidden"
        style={{
          background: 'linear-gradient(to top, rgba(65, 36, 17, 0.98) 0%, rgba(95, 52, 25, 0.92) 42px, rgba(120, 68, 35, 0.70) 80px, transparent 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255, 230, 180, 0.25)',
        }}
      >
        <div className="absolute top-14 sm:top-18 left-0 right-0 h-[1.5px] bg-amber-100/20" />
      </div>

      {/* 3. PHYSICAL DESK ACCESSORIES (Matching Reference Photo) */}
      <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-32 z-10 max-w-[1720px] mx-auto px-6 sm:px-12 flex items-end justify-between overflow-hidden pointer-events-none">
        
        {/* Left Desk Accessories: Hardcover Books + Knovera Mug */}
        <div className="flex items-end gap-4 sm:gap-6 pb-2 pointer-events-auto">
          
          {/* Stack of Hardcover Books ("Build Better Habits", "Deep Work", "Productivity") */}
          <div className="hidden sm:flex flex-col items-center select-none shadow-md">
            <div className="w-28 sm:w-34 h-3.5 rounded-sm bg-[#1C1917] border-t border-stone-500/40 shadow-xs flex items-center px-2">
              <span className="text-[7.5px] font-serif font-bold text-amber-200 tracking-wider truncate">Build Better Habits</span>
            </div>
            <div className="w-32 sm:w-38 h-4 rounded-sm bg-[#292524] border-t border-stone-600/30 shadow-xs flex items-center px-2">
              <span className="text-[7.5px] font-serif font-bold text-amber-200 tracking-wider truncate">Deep Work</span>
            </div>
            <div className="w-36 sm:w-42 h-4.5 rounded-sm bg-[#1E293B] border-t border-stone-400/40 shadow-sm flex items-center px-2">
              <span className="text-[8px] font-serif font-bold text-amber-200 tracking-wider truncate">Productivity</span>
            </div>
          </div>

          {/* White Ceramic Coffee Mug with Knovera Logo on Cork Coaster */}
          <div className="hidden md:flex flex-col items-center relative select-none">
            <div className="w-12 h-14 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-100 via-white to-stone-200 border border-stone-300 shadow-lg flex flex-col items-center justify-center relative">
              <span className="text-[10px] text-purple-600">✦</span>
              <span className="text-[8px] font-bold text-stone-800 tracking-tight">Knovera</span>
              {/* Mug Handle */}
              <div className="absolute top-2.5 -right-3 w-3.5 h-7 rounded-r-lg border-2 border-stone-300 border-l-0" />
            </div>
            {/* Round Cork Coaster */}
            <div className="w-16 h-2 rounded-full bg-[#C49258] border-t border-[#DFB37C] shadow-xs" />
          </div>

        </div>

        {/* Center: Sleek MacBook Laptop Centered in Foreground */}
        <div className="hidden lg:flex flex-col items-center mb-0.5 opacity-95 select-none">
          <div className="w-64 sm:w-72 h-4 rounded-t-xl bg-gradient-to-b from-stone-300 via-stone-200 to-stone-400 border-t border-white/60 shadow-2xl flex items-center justify-center">
            <div className="w-6 h-1 rounded-full bg-stone-500 opacity-60" />
          </div>
        </div>

        {/* Right Desk Accessories: Fluted Ceramic Pen Cup + Potted Desk Plant */}
        <div className="flex items-end gap-4 sm:gap-6 pb-2 pointer-events-auto">
          
          {/* Fluted Ceramic Pen Holder with Pens, Brushes, Ruler */}
          <div className="hidden sm:flex flex-col items-center select-none">
            <div className="flex items-end gap-1 mb-[-4px]">
              <div className="w-1.5 h-11 bg-amber-600 rounded-t-sm rotate-[-12deg]" />
              <div className="w-1.5 h-13 bg-stone-900 border-t border-white/60 rounded-t-sm rotate-[-4deg]" />
              <div className="w-2 h-14 bg-stone-300 rounded-t-xs text-[6px] text-stone-600 px-0.5 font-mono rotate-[4deg]">|</div>
              <div className="w-1.5 h-10 bg-blue-600 rounded-t-sm rotate-[10deg]" />
              <div className="w-2 h-12 bg-amber-700 rounded-t-sm rotate-[16deg]" />
            </div>
            {/* Fluted White Ceramic Cup */}
            <div className="w-12 h-12 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-100 via-white to-stone-200 border border-stone-300 shadow-md flex items-center justify-center">
              <div className="w-full h-full flex justify-around px-1 opacity-25">
                <span className="w-0.5 h-full bg-stone-400" />
                <span className="w-0.5 h-full bg-stone-400" />
                <span className="w-0.5 h-full bg-stone-400" />
              </div>
            </div>
          </div>

          {/* Potted Desk Plant */}
          <div className="hidden md:flex flex-col items-center select-none">
            <div className="text-2xl mb-[-4px]">🪴</div>
            <div className="w-10 h-8 rounded-b-lg rounded-t-xs bg-[#B45309] border border-[#92400E] shadow-md" />
          </div>

        </div>

      </div>
    </>
  );
};

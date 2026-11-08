import React from 'react';

/**
 * StudioWallAtmosphere
 * Renders the photorealistic physical creative studio atmosphere across ALL pages:
 * - Warm directional sunlight entering from top-left
 * - Subtle hanging ivy vine leaves in top-left
 * - Rich warm mahogany wooden desk base along the bottom
 * - Studio accessories along desk: desk lamp with warm ambient glow cone,
 *   stack of hardcover books, white ceramic mug with logo on cork coaster,
 *   sleek dark laptop lid reflection, ceramic pen cup with pens, mini astronaut,
 *   and glass cloche terrarium with miniature succulent.
 * 
 * All elements are non-obstructing with pointer-events-none so interactions pass through.
 */
export const StudioWallAtmosphere: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          1. DIRECTIONAL WARM SUNLIGHT BEAMS & AMBIENT VIGNETTE
          ========================================================================= */}
      
      {/* Warm Directional Sunlight Beam entering from Top-Left */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 10% 0%, rgba(255, 248, 220, 0.42) 0%, rgba(254, 240, 180, 0.18) 35%, transparent 75%)',
        }}
      />
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 252, 235, 0.35) 0%, rgba(255, 243, 205, 0.15) 30%, transparent 60%)',
        }}
      />

      {/* Hanging Ivy Vine Leaves in Top-Left Corner (Studio Decoration) */}
      <div className="pointer-events-none fixed top-0 left-0 z-10 w-56 sm:w-64 h-72 sm:h-80 opacity-90 transition-opacity">
        <svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Main Vine Stems */}
          <path d="M 0 0 Q 40 40 50 120 T 70 240" stroke="#2d4a22" strokeWidth="2.5" fill="none" opacity="0.85" />
          <path d="M 0 10 Q 70 30 110 90 T 140 180" stroke="#365e26" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 0 0 Q 30 80 40 160 T 35 280" stroke="#233a1b" strokeWidth="2" fill="none" opacity="0.75" />
          
          {/* Leaves cluster 1 */}
          <path d="M 45 40 C 30 30 20 50 40 65 C 55 55 60 40 45 40 Z" fill="#4d7c0f" />
          <path d="M 52 50 C 40 45 35 60 50 72 C 62 65 65 52 52 50 Z" fill="#65a30d" />
          <path d="M 30 75 C 15 65 10 85 28 98 C 42 90 45 78 30 75 Z" fill="#3f6212" />
          
          {/* Leaves cluster 2 */}
          <path d="M 80 55 C 65 42 60 68 78 82 C 92 75 95 60 80 55 Z" fill="#4d7c0f" />
          <path d="M 105 85 C 90 70 85 95 102 110 C 118 102 120 88 105 85 Z" fill="#65a30d" />
          <path d="M 125 125 C 110 110 108 135 124 150 C 138 142 140 128 125 125 Z" fill="#3f6212" />
          
          {/* Lower delicate vine tips */}
          <path d="M 65 150 C 50 140 48 160 62 172 C 75 165 76 152 65 150 Z" fill="#65a30d" />
          <path d="M 68 200 C 55 190 52 210 65 220 C 76 214 78 202 68 200 Z" fill="#4d7c0f" />
          <path d="M 38 230 C 25 222 25 240 36 248 C 45 244 46 232 38 230 Z" fill="#365e26" />
        </svg>
      </div>

      {/* =========================================================================
          2. RICH WARM MAHOGANY WOODEN DESK BASE & ACCESSORIES
          ========================================================================= */}
      
      {/* Wooden Desk Surface Grounding along Viewport Bottom */}
      <div 
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-32 sm:h-36 z-0 overflow-hidden"
        style={{
          background: 'linear-gradient(to top, rgba(65, 36, 17, 0.98) 0%, rgba(95, 52, 25, 0.92) 48px, rgba(120, 68, 35, 0.70) 85px, transparent 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255, 230, 180, 0.25)',
        }}
      >
        {/* Desk Plank Highlight Line */}
        <div className="absolute top-16 sm:top-20 left-0 right-0 h-[1.5px] bg-amber-100/20" />
      </div>

      {/* Studio Desk Accessories along Bottom Surface */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-32 sm:h-36 z-10 max-w-[1720px] mx-auto px-4 sm:px-8 flex items-end justify-between overflow-hidden">
        
        {/* Left Desk Accessories: Hardcover Books + Warm Desk Lamp */}
        <div className="flex items-end gap-3 sm:gap-5 pl-1 sm:pl-2 pb-1.5">
          
          {/* Stack of Hardcover Books */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-28 sm:w-32 h-3.5 sm:h-4 rounded-sm bg-[#881337] border-t border-rose-400/40 shadow-xs flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/70 tracking-widest uppercase truncate">Productivity</span>
            </div>
            <div className="w-32 sm:w-36 h-4 sm:h-4.5 rounded-sm bg-[#1e293b] border-t border-slate-400/30 shadow-xs flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/70 tracking-widest uppercase truncate">Artificial Intelligence</span>
            </div>
            <div className="w-36 sm:w-40 h-4.5 sm:h-5 rounded-sm bg-[#3f3f46] border-t border-stone-300/40 shadow-sm flex items-center px-2">
              <span className="text-[7px] font-mono font-bold text-white/80 tracking-widest uppercase truncate">Build The Future</span>
            </div>
          </div>

          {/* Desk Lamp with Warm Radial Ambient Illumination Cone */}
          <div className="relative">
            <div 
              className="absolute -top-28 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(254, 240, 138, 0.6) 0%, rgba(245, 158, 11, 0.2) 45%, transparent 70%)',
              }}
            />
            {/* Lamp Silhouette SVG */}
            <svg width="50" height="75" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <ellipse cx="30" cy="85" rx="20" ry="4" fill="#18181b" />
              <path d="M 30 85 L 26 40 L 40 25" stroke="#27272a" strokeWidth="4" strokeLinecap="round" />
              <path d="M 28 20 L 52 32 L 42 45 L 20 28 Z" fill="#18181b" />
              <circle cx="44" cy="35" r="5" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 8px #fef08a)" />
            </svg>
          </div>

          {/* Ceramic White Coffee Mug with Logo on Cork Coaster */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-10 h-12 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-100 via-white to-stone-200 border border-stone-300 shadow-md flex items-center justify-center relative">
              <span className="text-[9px] font-black text-stone-700 tracking-tight">✦</span>
              {/* Mug Handle */}
              <div className="absolute top-2 -right-2.5 w-3 h-6 rounded-r-lg border-2 border-stone-300 border-l-0" />
            </div>
            {/* Cork Coaster */}
            <div className="w-14 h-1.5 rounded-full bg-[#c49258] border-t border-[#dfb37c] shadow-xs" />
          </div>

        </div>

        {/* Center: Sleek Dark Laptop Lid Reflection */}
        <div className="hidden lg:flex flex-col items-center mb-0.5 opacity-90">
          <div className="w-64 h-8 rounded-t-xl bg-gradient-to-b from-stone-900 to-black border-t border-stone-600/50 shadow-2xl flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-white/20" />
          </div>
          <div className="w-72 h-1 rounded-full bg-stone-700 shadow-md" />
        </div>

        {/* Right Desk Accessories: Pen Holder + Astronaut + Glass Cloche Terrarium */}
        <div className="flex items-end gap-3 sm:gap-4 pr-1 sm:pr-2 pb-1.5">
          
          {/* Black Ceramic Pen Pot with Fountain Pens and Stylus */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="flex items-end gap-1 mb-[-4px]">
              <div className="w-1.5 h-10 bg-amber-600 rounded-t-sm rotate-[-12deg]" />
              <div className="w-1.5 h-12 bg-stone-900 border-t border-white/60 rounded-t-sm rotate-[-4deg]" />
              <div className="w-1.5 h-9 bg-indigo-600 rounded-t-sm rotate-[8deg]" />
              <div className="w-2 h-11 bg-stone-700 rounded-t-sm rotate-[14deg]" />
            </div>
            <div className="w-10 h-10 rounded-b-xl rounded-t-sm bg-gradient-to-r from-stone-800 to-stone-950 border border-stone-700 shadow-md flex items-center justify-center">
              <span className="text-[8px] text-white/40">✦</span>
            </div>
          </div>

          {/* Mini Astronaut Figurine */}
          <div className="hidden md:flex flex-col items-center">
            <svg width="28" height="40" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="12" r="10" fill="#f4f4f5" stroke="#d4d4d8" />
              <ellipse cx="17" cy="12" rx="7" ry="5.5" fill="#ca8a04" stroke="#eab308" />
              <rect x="9" y="22" width="16" height="18" rx="5" fill="#f4f4f5" stroke="#d4d4d8" />
              <rect x="13" y="25" width="8" height="6" rx="2" fill="#3b82f6" />
              <rect x="11" y="40" width="4" height="6" rx="1.5" fill="#e4e4e7" />
              <rect x="19" y="40" width="4" height="6" rx="1.5" fill="#e4e4e7" />
            </svg>
          </div>

          {/* Glass Cloche Terrarium with Miniature Succulent */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-12 h-16 rounded-t-full border border-white/40 bg-white/10 backdrop-blur-xs shadow-md flex items-end justify-center pb-1.5 relative overflow-hidden">
              <div className="absolute top-2 left-1.5 w-1 h-8 rounded-full bg-white/40 rotate-12" />
              <div className="text-lg">🪴</div>
            </div>
            <div className="w-14 h-1.5 rounded-full bg-[#8c5828] border-t border-amber-300/40 shadow-xs" />
          </div>

        </div>

      </div>
    </>
  );
};


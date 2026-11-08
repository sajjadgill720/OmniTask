import React from 'react';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Sparkles,
  Columns3,
  Target,
  LayoutGrid,
  Network
} from 'lucide-react';
import { ViewMode, ThemeMode } from '../types';

interface ThingsHeaderProps {
  onToggleMobileNav: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCommandPalette: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenPermissions: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isProUser?: boolean;
}

/**
 * ThingsHeader
 * Sleek studio header bar:
 * - Centered dark translucent search pill with ⌘K / Ctrl K
 * - Theme toggle (Warm Studio Sunlight vs Cozy Ambient Night Studio)
 * - Notification Bell with badge
 * - Responsive mobile drawer trigger
 */
export const ThingsHeader: React.FC<ThingsHeaderProps> = ({
  onToggleMobileNav,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenPermissions,
  theme,
  onToggleTheme,
  viewMode,
  onChangeViewMode,
  isProUser,
}) => {
  return (
    <header className="relative z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 select-none">
      
      {/* Left: Mobile Navigation Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/90 shadow-md transition cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Small screen branding badge */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-300 shadow-sm flex items-center justify-center text-white font-black text-xs">
            ✦
          </div>
          <span className="font-extrabold text-sm text-white drop-shadow-xs">Knovera</span>
        </div>
      </div>

      {/* Center: Top Wall Search Pill (Reference Photo Search) */}
      <div className="flex-1 max-w-xl mx-auto">
        <div 
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-2xl bg-black/35 hover:bg-black/45 dark:bg-black/50 dark:hover:bg-black/65 backdrop-blur-xl border border-white/15 text-white/90 shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
          title="Search tasks, jump to views, or run actions (⌘K)"
        >
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            type="text"
            readOnly
            value={searchQuery}
            placeholder="Search tasks, notes, projects..."
            className="bg-transparent border-none text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none w-full cursor-pointer truncate"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded-lg border border-white/15 text-white/70 shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Utility Icons (Theme Toggle + Notification Bell) */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 sm:p-2.5 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white shadow-md transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Warm Studio Sunlight' : 'Switch to Cozy Ambient Night Studio'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-white/85" />
          )}
        </button>

        {/* Notifications Center Bell */}
        <button
          type="button"
          onClick={onOpenPermissions}
          className="relative p-2 sm:p-2.5 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white shadow-md transition cursor-pointer"
          title="Notifications & Permissions Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-black/40">
            2
          </span>
        </button>

      </div>

    </header>
  );
};

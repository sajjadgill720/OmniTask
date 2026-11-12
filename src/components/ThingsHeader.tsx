import React, { useMemo } from 'react';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Calendar
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
 * Sleek studio header bar matching Image 1 reference:
 * - Left: Mobile navigation drawer toggle (responsive)
 * - Right: Frosted Date Pill (📅 Nov 8, 2026) + Search Pill (🔍 Search tasks... Ctrl K) + Theme Toggle + Bell Notification
 */
export const ThingsHeader: React.FC<ThingsHeaderProps> = ({
  onToggleMobileNav,
  searchQuery,
  onOpenCommandPalette,
  onOpenPermissions,
  theme,
  onToggleTheme,
}) => {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <header className="relative z-30 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 select-none">
      
      {/* Left: Mobile Navigation Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-2xl bg-black/35 hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-xl border border-white/15 text-white shadow-md transition cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Small screen branding badge */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-300 shadow-sm flex items-center justify-center text-white font-black text-xs">
            ✦
          </div>
          <span className="font-extrabold text-sm text-stone-900 dark:text-white drop-shadow-xs">Omni Sticky</span>
        </div>
      </div>

      {/* Right: Frosted Utility Suite (Date Pill + Search Pill + Theme + Bell) matching Mockup Image 1 */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        
        {/* Date Pill: 📅 Nov 8, 2026 */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-black/25 dark:bg-black/45 backdrop-blur-xl border border-white/15 text-stone-900 dark:text-stone-200 text-xs font-semibold shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
          <span>{formattedDate}</span>
        </div>

        {/* Search Pill: 🔍 Search tasks... Ctrl K */}
        <div 
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-black/25 hover:bg-black/35 dark:bg-black/50 dark:hover:bg-black/65 backdrop-blur-xl border border-white/15 text-white shadow-sm cursor-pointer transition-all hover:scale-[1.01]"
          title="Search tasks, jump to views, or run actions (Ctrl K)"
        >
          <Search className="w-3.5 h-3.5 text-white/70 shrink-0" />
          <input
            type="text"
            readOnly
            value={searchQuery}
            placeholder="Search tasks..."
            className="bg-transparent border-none text-xs text-white placeholder-white/60 focus:outline-none w-24 sm:w-36 cursor-pointer truncate"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white/15 rounded-md border border-white/20 text-white/80 shrink-0">
            Ctrl K
          </kbd>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-2xl bg-black/25 hover:bg-black/35 dark:bg-black/50 dark:hover:bg-black/65 backdrop-blur-xl border border-white/15 text-amber-300 hover:text-amber-200 shadow-sm transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to warm daylight studio' : 'Switch to cozy ambient dark studio'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-stone-800" />}
        </button>

        {/* Notification Bell with Red Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={onOpenPermissions}
            className="p-2 rounded-2xl bg-black/25 hover:bg-black/35 dark:bg-black/50 dark:hover:bg-black/65 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white shadow-sm transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
            2
          </span>
        </div>

      </div>

    </header>
  );
};

import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Settings, 
  Target, 
  Columns3, 
  LayoutGrid, 
  Network,
  Sparkles
} from 'lucide-react';
import { ViewMode } from '../types';

interface ThingsHeaderProps {
  onToggleMobileNav: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCommandPalette: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isProUser?: boolean;
}

export const ThingsHeader: React.FC<ThingsHeaderProps> = ({
  onToggleMobileNav,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  onOpenQuickAdd,
  onOpenSettings,
  viewMode,
  onChangeViewMode,
  isProUser,
}) => {
  // Normalize legacy view strings to new streamlined 4 views
  const activeView: 'focus' | 'board' | 'canvas' | 'connections' = 
    viewMode === 'kanban' ? 'board' :
    viewMode === 'canvas_3d' || viewMode === 'sticky_wall' ? 'canvas' :
    viewMode === 'network_3d' ? 'connections' :
    'focus';

  return (
    <header className="sticky top-0 z-30 bg-[#f6f3eb]/95 dark:bg-[#19161e]/90 backdrop-blur-md border-b border-[#e8e2d5] dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu */}
        <button
          onClick={onToggleMobileNav}
          className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-[#ece7dc]/60 dark:hover:bg-white/10 md:hidden transition cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar — full-width clickable bar that also doubles as ⌘K trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 flex-1 max-w-md px-3.5 py-2 bg-white dark:bg-[#201c27] rounded-xl border border-[#ded7ca] dark:border-white/10 shadow-2xs hover:shadow-sm hover:border-stone-300 dark:hover:border-white/20 transition-all cursor-pointer group"
          title="Search, jump to views, or run actions (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition shrink-0" />
          <span className="text-xs text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300 font-medium truncate transition">
            Search notes, projects, actions…
          </span>
          <kbd className="ml-auto shrink-0 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-stone-500 bg-[#ece7dc] dark:bg-white/5 rounded border border-[#ded7ca] dark:border-white/10">
            ⌘K
          </kbd>
        </button>

        {/* Center: Streamlined View Switcher */}
        <div className="hidden md:flex items-center p-0.5 bg-[#ece7dc]/80 dark:bg-[#201c27]/90 rounded-xl border border-[#ded7ca]/60 dark:border-white/10">
          {([
            { id: 'focus' as const, label: 'Focus', Icon: Target },
            { id: 'board' as const, label: 'Board', Icon: Columns3 },
            { id: 'canvas' as const, label: 'Canvas', Icon: LayoutGrid },
            { id: 'connections' as const, label: 'Connections', Icon: Network },
          ] as const).map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => onChangeViewMode(v.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeView === v.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title={`Switch to ${v.label} view`}
            >
              <v.Icon className="w-3.5 h-3.5" />
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile View Switcher Dropdown */}
        <div className="md:hidden">
          <select
            value={activeView}
            onChange={(e) => onChangeViewMode(e.target.value as ViewMode)}
            className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="focus">🎯 Focus</option>
            <option value="board">📋 Board</option>
            <option value="canvas">🪐 Canvas</option>
            <option value="connections">🕸️ Connections</option>
          </select>
        </div>

        {/* Right Suite: Primary "New note" Button & Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Primary "New note" Action Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            title="Create a new note"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New note</span>
          </button>

          {/* Unified Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center relative"
            title="Settings & Preferences"
          >
            <Settings className="w-4 h-4" />
            {isProUser && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#11131a]" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};

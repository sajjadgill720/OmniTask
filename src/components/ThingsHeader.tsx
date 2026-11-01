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
  Command,
  User
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
    <header className="sticky top-0 z-30 bg-[#f8f9fa]/95 dark:bg-[#11131a]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu & Clean Search Bar with ⌘K Trigger */}
        <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md">
          <button
            onClick={onToggleMobileNav}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 md:hidden transition cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Real Interactive Search Bar with ⌘K Badge */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sticky notes, #tags..."
              className="w-full pl-9 pr-16 py-1.5 bg-white dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded border border-slate-200 dark:border-white/10 transition cursor-pointer"
              title="Open Command Palette (⌘K)"
            >
              ⌘K
            </button>
          </div>
        </div>

        {/* Center: Streamlined View Switcher (Focus | Board | Canvas | Connections) */}
        <div className="hidden md:flex items-center p-1 bg-slate-200/60 dark:bg-[#181a24]/90 rounded-xl border border-slate-300/40 dark:border-white/10">
          <button
            type="button"
            onClick={() => onChangeViewMode('focus')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'focus'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Focus: What needs attention right now"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'board'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Board: Kanban columns for pipeline workflow"
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'canvas'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Canvas: Freeform spatial board with tilt"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('connections')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'connections'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Connections: Visual task & project network graph"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Connections</span>
          </button>
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

        {/* Right Suite: Primary "New note" Button & Settings/Avatar */}
        <div className="flex items-center gap-2">
          
          {/* Primary "New note" Action Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            title="Create a new note"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New note</span>
          </button>

          {/* Unified Avatar & Settings Trigger */}
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

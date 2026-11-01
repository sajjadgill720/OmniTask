import React from 'react';
import { 
  Menu, 
  Search, 
  Download, 
  Upload, 
  Bell, 
  Flame, 
  Calendar, 
  Sparkles,
  LayoutGrid,
  Columns3,
  List,
  Sun,
  Moon,
  Crown,
  Box,
  Network
} from 'lucide-react';
import { exportTasksJSON, exportTasksMarkdown } from '../utils/storage';
import { Task, Area, Project, AppPermissionsState, ViewMode, ThemeMode } from '../types';

interface ThingsHeaderProps {
  onToggleMobileNav: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tasks: Task[];
  areas: Area[];
  projects: Project[];
  permissions: AppPermissionsState;
  onOpenPermissions: () => void;
  onOpenQuickAdd: () => void;
  onOpenSubscription?: () => void;
  isProUser?: boolean;
  onlyUrgent: boolean;
  onToggleUrgent: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const ThingsHeader: React.FC<ThingsHeaderProps> = ({
  onToggleMobileNav,
  searchQuery,
  onSearchChange,
  tasks,
  areas,
  projects,
  permissions,
  onOpenPermissions,
  onOpenQuickAdd,
  onOpenSubscription,
  isProUser,
  onlyUrgent,
  onToggleUrgent,
  viewMode,
  onChangeViewMode,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f8f9fa]/90 dark:bg-[#11131a]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 dark:shadow-[0_4px_24px_rgba(255,255,255,0.03)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu & Search Input */}
        <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md">
          <button
            onClick={onToggleMobileNav}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 md:hidden transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sticky notes, #tags..."
              className="w-full pl-9 pr-7 py-1.5 bg-white dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-white/40 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Center: View Switcher (Sticky Wall vs 3D Canvas vs 3D Network vs Kanban vs List) */}
        <div className="hidden lg:flex items-center p-1 bg-slate-200/60 dark:bg-[#181a24]/90 rounded-xl border border-slate-300/40 dark:border-white/10">
          <button
            type="button"
            onClick={() => onChangeViewMode('sticky_wall')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'sticky_wall'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Sticky Note Wall (Keep + Notezilla)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Wall</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('canvas_3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'canvas_3d'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="3D Spatial Canvas (Orbit & Depth Layers)"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('network_3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'network_3d'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="3D Task & Knowledge Constellation Graph"
          >
            <Network className="w-3.5 h-3.5" />
            <span>3D Network</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Kanban Board (Trello)"
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('things_list')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'things_list'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Things 3 Clean List"
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>

        {/* Mobile / Tablet View Switcher Dropdown */}
        <div className="lg:hidden">
          <select
            value={viewMode}
            onChange={(e) => onChangeViewMode(e.target.value as ViewMode)}
            className="px-2 py-1 text-xs font-bold bg-white dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="sticky_wall">📌 Wall</option>
            <option value="canvas_3d">🪐 3D Canvas</option>
            <option value="network_3d">🕸️ 3D Network</option>
            <option value="kanban">📋 Kanban</option>
            <option value="things_list">📝 List</option>
          </select>
        </div>

        {/* Right Action Suite */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Pro Subscription Trigger */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="OmniSticky Pro Subscription"
            >
              <Crown className="w-3.5 h-3.5 fill-white text-white" />
              <span>{isProUser ? 'PRO' : 'UPGRADE'}</span>
            </button>
          )}

          {/* Urgent Filter Toggle */}
          <button
            onClick={onToggleUrgent}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              onlyUrgent 
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400' 
                : 'bg-white dark:bg-[#181a24] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Toggle Urgent / P1 notes"
          >
            <Flame className={`w-3.5 h-3.5 ${onlyUrgent ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden md:inline">Urgent</span>
          </button>

          {/* Export Suite */}
          <button
            onClick={() => exportTasksMarkdown(tasks, areas, projects)}
            className="p-1.5 rounded-xl bg-white dark:bg-[#181a24] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold hidden md:flex items-center gap-1 transition cursor-pointer"
            title="Export to Markdown (Zero lock-in)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>MD</span>
          </button>

          <button
            onClick={() => exportTasksJSON(tasks)}
            className="p-1.5 rounded-xl bg-white dark:bg-[#181a24] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold hidden md:flex items-center gap-1 transition cursor-pointer"
            title="Export JSON Backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {/* Permissions Status Indicator */}
          <button
            onClick={onOpenPermissions}
            className={`p-1.5 rounded-xl border flex items-center justify-center transition cursor-pointer ${
              permissions.notifications === 'granted'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400'
                : 'bg-white dark:bg-[#181a24] border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={`Web Permissions: ${permissions.notifications === 'granted' ? 'Notifications Active' : 'Setup Notifications & Sound'}`}
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle (Light / Dark with Ambient White Hue) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-[#181a24] text-slate-600 dark:text-amber-300 hover:text-slate-900 dark:hover:text-amber-200 dark:shadow-[0_0_14px_rgba(255,255,255,0.12)] transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light Theme' : 'Dark Theme (Ambient White Hue)'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 animate-pop-in" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600 animate-pop-in" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile view switcher row */}
      <div className="flex sm:hidden items-center justify-around px-4 pb-2 border-t border-slate-200/50 dark:border-white/10 pt-1.5">
        <button
          onClick={() => onChangeViewMode('sticky_wall')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
            viewMode === 'sticky_wall' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Sticky Wall</span>
        </button>
        <button
          onClick={() => onChangeViewMode('kanban')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
            viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Kanban</span>
        </button>
        <button
          onClick={() => onChangeViewMode('things_list')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
            viewMode === 'things_list' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>List</span>
        </button>
      </div>
    </header>
  );
};

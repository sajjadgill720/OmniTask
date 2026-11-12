import React, { useState } from 'react';
import {
  Inbox,
  Star,
  Calendar,
  Compass,
  Archive,
  CheckCircle2,
  Plus,
  Columns3,
  Target,
  LayoutGrid,
  Network,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  Tag,
  Crown,
  Layout,
  Bell,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { ThingsSection, Area, Project, Task, AppPermissionsState, ThemeMode, ViewMode } from '../types';
import confetti from 'canvas-confetti';

interface SidebarProps {
  currentSection: ThingsSection;
  onSelectSection: (section: ThingsSection) => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  areas: Area[];
  projects: Project[];
  tasks: Task[];
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenNewProject: () => void;
  onOpenNewCategory: () => void;
  onOpenWidgets: () => void;
  onOpenPermissions: () => void;
  onOpenSubscription: () => void;
  onOpenSettings: () => void;
  isProUser: boolean;
  permissions: AppPermissionsState;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

/**
 * Sidebar
 * The sleek dark translucent glass navigation panel from the reference photo:
 * - Branding: ✦ Knovera (Plan • Focus • Achieve)
 * - Primary Views: My Board, Focus Room, Canvas Wall, Analytics
 * - Sections: Today, Inbox, Upcoming, Anytime, Someday, Logbook
 * - Projects & Areas with progress rings
 * - Inspiration Card ("Small steps. Big results.")
 * - User Profile Pill ("Sajjad Ur Rehman")
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  selectedProjectId,
  onSelectProject,
  areas,
  projects,
  tasks,
  viewMode,
  onChangeViewMode,
  onOpenNewProject,
  onOpenNewCategory,
  onOpenWidgets,
  onOpenPermissions,
  onOpenSubscription,
  onOpenSettings,
  isProUser,
  permissions,
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isSectionsExpanded, setIsSectionsExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  // Collapsed Sidebar State persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('omnisticky_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('omnisticky_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Section task counts
  const inboxCount = tasks.filter(t => t.section === 'inbox' && t.status !== 'done').length;
  const todayCount = tasks.filter(t => t.section === 'today' && t.status !== 'done').length;
  const upcomingCount = tasks.filter(t => (t.section === 'upcoming' || Boolean(t.dueDate)) && t.status !== 'done').length;
  const anytimeCount = tasks.filter(t => t.section === 'anytime' && t.status !== 'done').length;
  const somedayCount = tasks.filter(t => t.section === 'someday' && t.status !== 'done').length;
  const logbookCount = tasks.filter(t => t.status === 'done').length;

  const handleNavClick = (section: ThingsSection) => {
    onSelectProject(null);
    onSelectSection(section);
    onChangeViewMode('things_list');
    onCloseMobile();
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
    onCloseMobile();
  };

  const navSections = [
    { id: 'today' as ThingsSection, label: 'Today', icon: Star, count: todayCount, color: 'text-amber-400 fill-amber-400' },
    { id: 'inbox' as ThingsSection, label: 'Inbox', icon: Inbox, count: inboxCount, color: 'text-blue-400' },
    { id: 'upcoming' as ThingsSection, label: 'Upcoming', icon: Calendar, count: upcomingCount, color: 'text-rose-400' },
    { id: 'anytime' as ThingsSection, label: 'Anytime', icon: Compass, count: anytimeCount, color: 'text-emerald-400' },
    { id: 'someday' as ThingsSection, label: 'Someday', icon: Archive, count: somedayCount, color: 'text-purple-400' },
    { id: 'logbook' as ThingsSection, label: 'Logbook', icon: CheckCircle2, count: logbookCount, color: 'text-stone-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sleek Dark Translucent Glass Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-4 left-0 z-40 max-h-[calc(100vh-2rem)]
          ${isCollapsed ? 'lg:w-20' : 'lg:w-60'} w-72
          rounded-3xl p-4 sm:p-5 flex flex-col justify-between 
          bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white
          select-none transition-all duration-300 ease-in-out font-sans overflow-y-auto overflow-x-hidden
          ${isOpenMobile ? 'translate-x-4' : '-translate-x-full lg:translate-x-0'}
        `}
      >

        {/* Top Header & Branding */}
        <div>

          {/* Header Layout: Collapsed vs Expanded */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-300 shadow-md flex items-center justify-center text-white font-black text-base">
                  ✦
                </div>
                <div className="truncate">
                  <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                    Knovera
                  </h1>
                  <span className="text-[10px] text-white/50 font-medium">Plan • Focus • Achieve</span>
                </div>
              </div>

              {/* Collapse Sidebar Toggle */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-300 shadow-md flex items-center justify-center text-white font-black text-base">
                ✦
              </div>

              {/* Expand Sidebar Toggle */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ===================================================================
              PRIMARY WORKSPACE VIEWS (Reference Photo Navigation)
              =================================================================== */}
          <nav className="space-y-1 text-xs font-semibold pb-4 border-b border-white/10">

            {/* My Board (Executive Standup Wall & Desk Workspace) */}
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                onChangeViewMode('canvas_3d');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${(viewMode === 'board' || viewMode === 'canvas_3d') && !selectedProjectId
                  ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="My Board (Executive Standup Wall)"
            >
              <Columns3 className="w-4 h-4 text-amber-300 shrink-0" />
              {!isCollapsed && <span>My Board</span>}
            </button>

            {/* Focus Room */}
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                onChangeViewMode('focus');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${viewMode === 'focus' && !selectedProjectId
                  ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Focus Room (Hero Note + Quiet Queue)"
            >
              <Target className="w-4 h-4 text-rose-300 shrink-0" />
              {!isCollapsed && <span>Focus Room</span>}
            </button>

            {/* Canvas Wall */}
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                onChangeViewMode('canvas');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${viewMode === 'canvas' && !selectedProjectId
                  ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Canvas Wall (Visual Brainstorming Studio & Ideas Board)"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-300 shrink-0" />
              {!isCollapsed && <span>Canvas Wall</span>}
            </button>

            {/* Analytics */}
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                onChangeViewMode('analytics');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer ${viewMode === 'analytics' && !selectedProjectId
                  ? 'bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Analytics & Network Graph"
            >
              <Network className="w-4 h-4 text-cyan-300 shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </button>
          </nav>

          {/* ===================================================================
              SECTIONS / WORKFLOW LIST (Inbox, Today, Upcoming, Anytime, etc.)
              =================================================================== */}
          {!isCollapsed && (
            <div className="pt-3 pb-3 border-b border-white/10">
              <div
                onClick={() => setIsSectionsExpanded(!isSectionsExpanded)}
                className="flex items-center justify-between px-2 py-1 text-[10px] text-white/50 font-bold uppercase tracking-wider cursor-pointer hover:text-white transition"
              >
                <span>Workflow Stages</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isSectionsExpanded ? '' : '-rotate-90'}`} />
              </div>

              {isSectionsExpanded && (
                <div className="space-y-0.5 mt-1">
                  {navSections.map(sec => {
                    const isActive = currentSection === sec.id && !selectedProjectId && viewMode === 'things_list';
                    const Icon = sec.icon;

                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleNavClick(sec.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${isActive
                            ? 'bg-white/20 text-white font-bold backdrop-blur-xs'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-3.5 h-3.5 ${sec.color}`} />
                          <span className="truncate">{sec.label}</span>
                        </div>
                        {sec.count > 0 && (
                          <span className="text-[10px] font-mono text-white/50">{sec.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              PROJECTS & CATEGORIES HIERARCHY
              =================================================================== */}
          {!isCollapsed && (
            <div className="pt-3 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">
                <div className="flex items-center gap-1">
                  <span
                    onClick={() => {
                      onSelectProject(null);
                      onChangeViewMode('projects');
                      onCloseMobile();
                    }}
                    className={`cursor-pointer transition flex items-center gap-1 ${viewMode === 'projects' && !selectedProjectId ? 'text-amber-300 font-black' : 'hover:text-white'
                      }`}
                    title="View all projects hub"
                  >
                    <span>Projects</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                    className="p-0.5 text-white/50 hover:text-white"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isProjectsExpanded ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                    title="Add Project or Category"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Add Contextual Dropdown */}
                  {showAddMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-6 z-50 w-40 p-1 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 text-xs font-normal normal-case animate-pop-in"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenu(false);
                          onOpenNewProject();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-white hover:bg-white/15 transition cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-indigo-400" />
                        <span>New Project</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenu(false);
                          onOpenNewCategory();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-white hover:bg-white/15 transition cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span>New Category</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isProjectsExpanded && (
                <div className="space-y-2 mt-1">
                  {areas.map(area => {
                    const areaProjects = projects.filter(p => p.areaId === area.id);

                    return (
                      <div key={area.id} className="space-y-0.5">
                        <div className="flex items-center justify-between px-2 py-0.5 text-[11px] font-semibold text-white/80">
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{area.emoji}</span>
                            <span className="truncate">{area.name}</span>
                          </div>
                        </div>

                        {areaProjects.map(proj => {
                          const projTasks = tasks.filter(t => t.projectId === proj.id);
                          const doneTasks = projTasks.filter(t => t.status === 'done');
                          const isSelected = selectedProjectId === proj.id;

                          const radius = 5;
                          const circumference = 2 * Math.PI * radius;
                          const ratio = projTasks.length > 0 ? doneTasks.length / projTasks.length : 0;
                          const strokeDashoffset = circumference - ratio * circumference;

                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => handleProjectClick(proj.id)}
                              className={`w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-xl text-xs transition cursor-pointer ${isSelected
                                  ? 'bg-white/20 text-white font-bold backdrop-blur-xs'
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <svg className="w-3 h-3 shrink-0 -rotate-90">
                                  <circle
                                    cx="6"
                                    cy="6"
                                    r={radius}
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="1.8"
                                  />
                                  <circle
                                    cx="6"
                                    cy="6"
                                    r={radius}
                                    fill="transparent"
                                    stroke={proj.colorHex || '#3b82f6'}
                                    strokeWidth="1.8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="truncate">{proj.title}</span>
                              </div>

                              <span className="text-[10px] font-mono text-white/40">
                                {doneTasks.length}/{projTasks.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* + Add Category Button */}
                  <button
                    type="button"
                    onClick={onOpenNewCategory}
                    className="w-full mt-2 py-1.5 px-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-[11px] text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Category</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick System Tools / Utilities */}
          <div className="pt-2 space-y-1 text-xs font-medium">

            {/* Upgrade to Pro */}
            <button
              type="button"
              onClick={onOpenSubscription}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/20 transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
                }`}
              title="Upgrade to Pro"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span className="font-bold">Upgrade to Pro</span>}
              </div>
              {!isCollapsed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-stone-950">
                  {isProUser ? 'ACTIVE' : 'PRO'}
                </span>
              )}
            </button>

            {/* Widgets Suite */}
            <button
              type="button"
              onClick={onOpenWidgets}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
                }`}
              title="Widgets Suite"
            >
              <div className="flex items-center gap-3">
                <Layout className="w-4 h-4 text-purple-300 shrink-0" />
                {!isCollapsed && <span>Widgets Suite</span>}
              </div>
              {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
                }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-300 shrink-0" /> : <Sun className="w-4 h-4 text-amber-300 shrink-0" />}
                {!isCollapsed && <span>Theme</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-semibold text-white/50 px-2 py-0.5 rounded-lg bg-white/10">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              )}
            </button>

            {/* Permissions & Sound Center */}
            <button
              type="button"
              onClick={onOpenPermissions}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
                }`}
              title="Permissions & Notifications"
            >
              <Bell className="w-4 h-4 text-rose-300 shrink-0" />
              {!isCollapsed && <span>Permissions</span>}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
                }`}
              title="Settings"
            >
              <Settings className="w-4 h-4 text-stone-300 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </div>

        </div>

        {/* ===================================================================
            BOTTOM CARDS: Inspiration Gem & Sajjad Ur Rehman Profile Pill
            =================================================================== */}
        <div className="space-y-3 pt-4 border-t border-white/10 mt-4">

          {/* Inspiration Floating Card with Click Interaction */}
          {!isCollapsed && (
            <div
              onClick={() => {
                confetti({ particleCount: 35, spread: 55, origin: { y: 0.85, x: 0.1 } });
              }}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/40 border border-purple-400/20 backdrop-blur-md shadow-md text-left cursor-pointer hover:border-purple-400/40 hover:scale-[1.02] active:scale-95 transition-all"
              title="Click for a spark of focus energy!"
            >
              <div className="w-6 h-6 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-1.5 text-xs">
                💎
              </div>
              <p className="text-xs font-bold text-white leading-tight">
                Small steps.
              </p>
              <p className="text-[11px] text-white/60">
                Big results. ↗
              </p>
            </div>
          )}

          {/* User Profile Pill */}
          <div
            onClick={onOpenSettings}
            className={`flex items-center justify-between p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer ${isCollapsed ? 'justify-center p-1.5' : ''
              }`}
            title="User Profile & Settings"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs shrink-0">
                SR
              </div>
              {!isCollapsed && (
                <span className="text-xs font-semibold text-white/90 truncate">
                  Sajjad Ur Rehman
                </span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
            )}
          </div>

        </div>

      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { 
  Inbox, 
  Star, 
  Calendar, 
  Compass, 
  Archive, 
  CheckCircle2, 
  Plus, 
  Layout, 
  Bell, 
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Sun, 
  Moon,
  Crown,
  Folder,
  Tag
} from 'lucide-react';
import { ThingsSection, Area, Project, Task, AppPermissionsState, ThemeMode } from '../types';

interface SidebarProps {
  currentSection: ThingsSection;
  onSelectSection: (section: ThingsSection) => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  areas: Area[];
  projects: Project[];
  tasks: Task[];
  onOpenNewProject: () => void;
  onOpenNewCategory: () => void;
  onOpenWidgets: () => void;
  onOpenPermissions: () => void;
  onOpenSubscription: () => void;
  isProUser: boolean;
  permissions: AppPermissionsState;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  selectedProjectId,
  onSelectProject,
  areas,
  projects,
  tasks,
  onOpenNewProject,
  onOpenNewCategory,
  onOpenWidgets,
  onOpenPermissions,
  onOpenSubscription,
  isProUser,
  permissions,
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
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
  const upcomingCount = tasks.filter(t => t.section === 'upcoming' && t.status !== 'done').length;
  const anytimeCount = tasks.filter(t => t.section === 'anytime' && t.status !== 'done').length;
  const somedayCount = tasks.filter(t => t.section === 'someday' && t.status !== 'done').length;
  const logbookCount = tasks.filter(t => t.status === 'done').length;

  const handleNavClick = (section: ThingsSection) => {
    onSelectProject(null);
    onSelectSection(section);
    onCloseMobile();
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
    onCloseMobile();
  };

  const navItems = [
    { 
      id: 'inbox' as ThingsSection, 
      label: 'Inbox', 
      icon: Inbox, 
      count: inboxCount, 
      color: 'text-blue-500', 
      activeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
    },
    { 
      id: 'today' as ThingsSection, 
      label: 'Today', 
      icon: Star, 
      count: todayCount, 
      color: 'text-amber-500 fill-amber-500', 
      activeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
    },
    { 
      id: 'upcoming' as ThingsSection, 
      label: 'Upcoming', 
      icon: Calendar, 
      count: upcomingCount, 
      color: 'text-rose-500', 
      activeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
    },
    { 
      id: 'anytime' as ThingsSection, 
      label: 'Anytime', 
      icon: Compass, 
      count: anytimeCount, 
      color: 'text-emerald-500', 
      activeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
    },
    { 
      id: 'someday' as ThingsSection, 
      label: 'Someday', 
      icon: Archive, 
      count: somedayCount, 
      color: 'text-purple-400', 
      activeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
    },
    { 
      id: 'logbook' as ThingsSection, 
      label: 'Logbook', 
      icon: CheckCircle2, 
      count: logbookCount, 
      color: 'text-slate-400', 
      activeBg: 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white' 
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Responsive Collapsible Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen 
          ${isCollapsed ? 'md:w-16' : 'md:w-56'} w-64
          bg-[#f6f3eb] dark:bg-[#19161e]/98 
          border-r border-[#e8e2d5] dark:border-white/10 flex flex-col justify-between 
          select-none transition-all duration-300 ease-in-out font-sans
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        
        {/* Top Header & Branding */}
        <div className="p-3 pb-2">
          
          {/* Header Layout: Collapsed vs Expanded */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-blue-500 shadow-sm flex items-center justify-center text-white font-black text-xs">
                  ✓
                </div>
                <div className="truncate">
                  <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                    OmniSticky
                  </h1>
                  <span className="text-[10px] text-slate-400 font-medium">Motion Suite</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Collapse Sidebar Toggle */}
                <button
                  onClick={toggleCollapsed}
                  className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                  title="Collapse sidebar (show icons only)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 shadow-sm flex items-center justify-center text-white font-black text-sm">
                ✓
              </div>

              {/* Expand Sidebar Toggle */}
              <button
                onClick={toggleCollapsed}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="space-y-1 text-xs font-medium">
            {navItems.map(item => {
              const isActive = currentSection === item.id && !selectedProjectId;
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition cursor-pointer ${
                      isActive
                        ? `${item.activeBg} font-semibold shadow-xs`
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }`}
                    title={`${item.label} (${item.count})`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    {item.count > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#11131a]" />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                    isActive
                      ? `${item.activeBg} font-semibold`
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                  title={`${item.label} (${item.count})`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="text-[11px] font-mono text-slate-400">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Areas and Projects Hierarchy */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider px-2 relative mb-1">
                <span>Categories & Projects</span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={onOpenNewCategory}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition cursor-pointer text-[10px] font-bold"
                    title="Add new category or area"
                  >
                    <Plus className="w-3 h-3 text-blue-500 stroke-[2.5]" />
                    <span>Category</span>
                  </button>

                  <button
                    onClick={onOpenNewProject}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition cursor-pointer text-[10px] font-bold"
                    title="Add new project"
                  >
                    <Folder className="w-3 h-3 text-indigo-500" />
                    <span>Project</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 px-1">
                {areas.map(area => {
                  const areaProjects = projects.filter(p => p.areaId === area.id);

                  return (
                    <div key={area.id} className="space-y-1">
                      <div className="group/area flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{area.emoji}</span>
                          <span className="truncate">{area.name}</span>
                        </div>
                        <button
                          onClick={onOpenNewProject}
                          className="opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          title={`Add project under ${area.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
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
                            onClick={() => handleProjectClick(proj.id)}
                            className={`w-full flex items-center justify-between pl-5 pr-2 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <svg className="w-3.5 h-3.5 shrink-0 -rotate-90">
                                <circle
                                  cx="7"
                                  cy="7"
                                  r={radius}
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="text-slate-200 dark:text-slate-700"
                                />
                                <circle
                                  cx="7"
                                  cy="7"
                                  r={radius}
                                  fill="transparent"
                                  stroke={proj.colorHex || '#3b82f6'}
                                  strokeWidth="1.8"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  className="transition-all duration-300"
                                />
                              </svg>
                              <span className="truncate">{proj.title}</span>
                            </div>

                            <span className="text-[10px] font-mono text-slate-400">
                              {doneTasks.length}/{projTasks.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Prominent Quick-Add Category Action */}
                <div className="pt-2 px-1">
                  <button
                    onClick={onOpenNewCategory}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Projects Rail: Minimalist Icon Hub */
            <div className="flex flex-col items-center space-y-2 border-t border-slate-200/60 dark:border-white/10 pt-3">
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                  title="Add Category or Project"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {showAddMenu && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-11 top-0 z-50 w-44 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 text-xs animate-pop-in"
                  >
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenNewCategory();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      <span>New Category</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenNewProject();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition cursor-pointer"
                    >
                      <Folder className="w-3.5 h-3.5 text-indigo-500" />
                      <span>New Project</span>
                    </button>
                  </div>
                )}
              </div>

              {projects.map(proj => {
                const projTasks = tasks.filter(t => t.projectId === proj.id);
                const doneTasks = projTasks.filter(t => t.status === 'done');
                const isSelected = selectedProjectId === proj.id;
                const radius = 6;
                const circumference = 2 * Math.PI * radius;
                const ratio = projTasks.length > 0 ? doneTasks.length / projTasks.length : 0;
                const strokeDashoffset = circumference - ratio * circumference;

                return (
                  <button
                    key={proj.id}
                    onClick={() => handleProjectClick(proj.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-500/10 ring-2 ring-blue-500' 
                        : 'hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }`}
                    title={`${proj.title} (${doneTasks.length}/${projTasks.length})`}
                  >
                    <svg className="w-5 h-5 -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r={radius}
                        fill="transparent"
                        stroke={proj.colorHex || '#3b82f6'}
                        strokeWidth="2"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Strip: Theme Switcher & Widgets Hub & Pro Subscription */}
        <div className="p-2 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
          
          {!isCollapsed ? (
            <>
              {/* Pro Subscription Badge / Upgrade Pill */}
              <button
                type="button"
                onClick={onOpenSubscription}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-blue-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="truncate">{isProUser ? 'OmniSticky Pro' : 'Upgrade to Pro'}</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                  isProUser ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white'
                }`}>
                  {isProUser ? 'ACTIVE' : 'PRO'}
                </span>
              </button>

              {/* Theme Toggle Pill in Expanded Sidebar */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Theme</span>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 text-[11px] font-bold shadow-2xs dark:shadow-[0_0_10px_rgba(255,255,255,0.08)] cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3 h-3 text-amber-300" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3 text-slate-600" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Widgets Hub Trigger */}
              <button
                onClick={onOpenWidgets}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:from-amber-500/20 hover:to-indigo-500/20 transition cursor-pointer border border-indigo-200/50 dark:border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">Widgets Suite</span>
                </div>
                <ChevronRight className="w-3 h-3 text-indigo-400" />
              </button>
            </>
          ) : (
            /* Collapsed Bottom Strip: Minimal Icons */
            <div className="flex flex-col items-center space-y-1">
              <button
                type="button"
                onClick={onOpenSubscription}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                title={isProUser ? 'OmniSticky Pro (Active)' : 'Upgrade to OmniSticky Pro'}
              >
                <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-amber-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Ambient White Hue)'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={onOpenWidgets}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                title="Interactive Widgets Hub"
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </aside>
    </>
  );
};

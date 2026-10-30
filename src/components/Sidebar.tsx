import React from 'react';
import { 
  Inbox, 
  Star, 
  Calendar, 
  Compass, 
  Archive, 
  CheckCircle2, 
  Folder, 
  Plus, 
  Sliders, 
  Layout, 
  Bell, 
  ExternalLink,
  ChevronRight,
  Sun,
  Moon
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
  onOpenWidgets: () => void;
  onOpenPermissions: () => void;
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
  onOpenWidgets,
  onOpenPermissions,
  permissions,
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  // Counts
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#f8f9fa] dark:bg-[#11131a]/95 
        border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between 
        select-none transition-transform duration-200 ease-in-out font-sans
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top Header & Branding */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500 shadow-sm flex items-center justify-center text-white font-black text-xs">
                ✓
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  OmniSticky
                </h1>
                <span className="text-[10px] text-slate-400 font-medium">Motion Sticky Suite</span>
              </div>
            </div>

            {/* Permissions Status Indicator */}
            <button
              onClick={onOpenPermissions}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer relative ${
                permissions.notifications === 'granted'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
              }`}
              title="Permissions & Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {permissions.notifications !== 'granted' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-0.5 text-xs font-medium">
            <button
              onClick={() => handleNavClick('inbox')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'inbox' && !selectedProjectId
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-blue-500" />
                <span>Inbox</span>
              </div>
              {inboxCount > 0 && (
                <span className="text-[11px] font-mono text-slate-400">{inboxCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('today')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'today' && !selectedProjectId
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Today</span>
              </div>
              {todayCount > 0 && (
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">{todayCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('upcoming')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'upcoming' && !selectedProjectId
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>Upcoming</span>
              </div>
              {upcomingCount > 0 && (
                <span className="text-[11px] font-mono text-slate-400">{upcomingCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('anytime')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'anytime' && !selectedProjectId
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Anytime</span>
              </div>
              {anytimeCount > 0 && (
                <span className="text-[11px] font-mono text-slate-400">{anytimeCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('someday')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'someday' && !selectedProjectId
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 text-purple-400" />
                <span>Someday</span>
              </div>
              {somedayCount > 0 && (
                <span className="text-[11px] font-mono text-slate-400">{somedayCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('logbook')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                currentSection === 'logbook' && !selectedProjectId
                  ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Logbook</span>
              </div>
              {logbookCount > 0 && (
                <span className="text-[11px] font-mono text-slate-400">{logbookCount}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Areas and Projects Hierarchy */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
            <span>Projects & Areas</span>
            <button
              onClick={onOpenNewProject}
              className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {areas.map(area => {
              const areaProjects = projects.filter(p => p.areaId === area.id);

              return (
                <div key={area.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{area.emoji}</span>
                    <span className="truncate">{area.name}</span>
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
                        className={`w-full flex items-center justify-between pl-6 pr-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {/* Circular progress ring */}
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
          </div>
        </div>

        {/* Bottom Strip: Theme Switcher & Widgets Hub */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 space-y-2">
          
          {/* Theme Toggle Pill in Sidebar */}
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

          <button
            onClick={onOpenWidgets}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:from-amber-500/20 hover:to-indigo-500/20 transition cursor-pointer border border-indigo-200/50 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-indigo-500" />
              <span>Interactive Widgets</span>
            </div>
            <ChevronRight className="w-3 h-3 text-indigo-400" />
          </button>
        </div>

      </aside>
    </>
  );
};

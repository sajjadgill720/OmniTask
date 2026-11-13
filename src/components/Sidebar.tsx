import { safeStorage } from '../utils/safeStorage';
import { localDateString } from '../utils/dates';
import React, { useEffect, useState } from 'react';
import {
  Archive,
  Bell,
  Calendar,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Columns3,
  Compass,
  Folder,
  Inbox,
  Layout,
  LayoutGrid,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
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

const rowBase = 'group flex min-h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80';
const rowIdle = 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]';
const rowActive = 'bg-[var(--sidebar-active)] text-[var(--sidebar-text)] shadow-[inset_2px_0_0_#c78a2d]';

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
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => safeStorage.getItem('omnisticky_sidebar_collapsed') === 'true');
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [collapsedAreaIds, setCollapsedAreaIds] = useState<Set<string>>(() => new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const isCompact = isCollapsed && !isOpenMobile;

  useEffect(() => {
    if (!isOpenMobile) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpenMobile, onCloseMobile]);

  const toggleCollapsed = () => setIsCollapsed(previous => {
    const next = !previous;
    safeStorage.setItem('omnisticky_sidebar_collapsed', String(next));
    return next;
  });

  const inboxCount = tasks.filter(task => task.section === 'inbox' && task.status !== 'done').length;
  const todayCount = tasks.filter(task => task.status !== 'done' && (task.section === 'today' || (task.dueDate && task.dueDate <= localDateString()))).length;
  const upcomingCount = tasks.filter(task => (task.section === 'upcoming' || Boolean(task.dueDate)) && task.status !== 'done').length;
  const anytimeCount = tasks.filter(task => task.section === 'anytime' && task.status !== 'done').length;
  const somedayCount = tasks.filter(task => task.section === 'someday' && task.status !== 'done').length;
  const logbookCount = tasks.filter(task => task.status === 'done').length;

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
    { id: 'today' as ThingsSection, label: 'Today', icon: Star, count: todayCount, tone: 'text-amber-300' },
    { id: 'inbox' as ThingsSection, label: 'Inbox', icon: Inbox, count: inboxCount, tone: 'text-sky-300' },
    { id: 'upcoming' as ThingsSection, label: 'Upcoming', icon: Calendar, count: upcomingCount, tone: 'text-rose-300' },
    { id: 'anytime' as ThingsSection, label: 'Anytime', icon: Compass, count: anytimeCount, tone: 'text-emerald-300' },
    { id: 'someday' as ThingsSection, label: 'Someday', icon: Archive, count: somedayCount, tone: 'text-violet-300' },
    { id: 'logbook' as ThingsSection, label: 'Logbook', icon: CheckCircle2, count: logbookCount, tone: 'text-stone-300' },
  ];

  const mainItems = [
    { label: 'My Board', icon: Columns3, active: ['board', 'canvas_3d'].includes(viewMode) && !selectedProjectId, action: () => { onSelectProject(null); onChangeViewMode('board'); } },
    { label: 'Focus Room', icon: Target, active: viewMode === 'focus' && !selectedProjectId, action: () => { onSelectProject(null); onChangeViewMode('focus'); } },
    { label: 'Canvas Wall', icon: LayoutGrid, active: viewMode === 'canvas' && !selectedProjectId, action: () => { onSelectProject(null); onChangeViewMode('canvas'); } },
    { label: 'Analytics', icon: ChartNoAxesCombined, active: viewMode === 'analytics' && !selectedProjectId, action: () => { onSelectProject(null); onChangeViewMode('analytics'); } },
  ];

  const toggleArea = (areaId: string) => setCollapsedAreaIds(previous => {
    const next = new Set(previous);
    if (next.has(areaId)) next.delete(areaId);
    else next.add(areaId);
    return next;
  });

  const goToProjects = () => {
    onSelectProject(null);
    onChangeViewMode('projects');
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <button
          type="button"
          aria-label="Close navigation drawer"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={`omni-sidebar ${theme === 'dark' ? 'omni-sidebar--light' : 'omni-sidebar--dark'} fixed inset-y-3 left-0 z-50 flex h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-r-2xl border border-l-0 text-[var(--sidebar-text)] shadow-[0_18px_55px_rgba(0,0,0,.22)] backdrop-blur-2xl transition-[width,transform] duration-200 ease-out lg:sticky lg:top-3 lg:rounded-2xl lg:border-l ${isCompact ? 'w-[min(17rem,calc(100vw-1rem))] lg:w-[76px]' : 'w-[min(17rem,calc(100vw-1rem))] lg:w-[260px]'} ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          '--sidebar-bg': theme === 'dark' ? 'rgba(218, 208, 187, .93)' : 'rgba(53, 45, 36, .87)',
          '--sidebar-footer': theme === 'dark' ? 'rgba(202, 190, 166, .97)' : 'rgba(43, 36, 29, .93)',
          '--sidebar-menu': theme === 'dark' ? 'rgba(229, 219, 199, .99)' : 'rgba(45, 35, 29, .99)',
          '--sidebar-text': theme === 'dark' ? '#332a21' : '#f2eadc',
          '--sidebar-muted': theme === 'dark' ? '#62564a' : '#c4b7a5',
          '--sidebar-border': theme === 'dark' ? 'rgba(76, 57, 37, .18)' : 'rgba(247, 232, 212, .15)',
          '--sidebar-hover': theme === 'dark' ? 'rgba(91, 67, 42, .07)' : 'rgba(247, 230, 205, .07)',
          '--sidebar-active': theme === 'dark' ? 'rgba(91, 67, 42, .11)' : 'rgba(223, 178, 112, .14)',
          '--sidebar-scrollbar': theme === 'dark' ? 'rgba(65, 50, 36, .28)' : 'rgba(245, 231, 209, .24)',
        } as React.CSSProperties}
      >
        <div className={`flex h-[60px] shrink-0 items-center border-b border-white/[0.09] ${isCompact ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
          <div className={`flex min-w-0 items-center gap-2.5 ${isCompact ? 'justify-center' : ''}`}>
            <div aria-hidden="true" className="omni-sidebar-brand-mark grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-[17px] font-black text-white shadow-sm">✦</div>
            {!isCompact && <div className="min-w-0 leading-tight">
              <div className="truncate text-[14px] font-bold tracking-tight text-white">Omni Sticky</div>
              <div className="mt-0.5 text-[10px] text-stone-300/70">Plan · Focus · Achieve</div>
            </div>}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-1.5 text-stone-300/70 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 lg:inline-flex"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-3 [scrollbar-color:var(--sidebar-scrollbar)_transparent] [scrollbar-width:thin]">
          <nav aria-label="Main" className="space-y-0.5">
            {!isCompact && <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-stone-300/55">Main</div>}
            {mainItems.map(({ label, icon: Icon, active, action }) => (
              <button
                key={label}
                type="button"
                title={isCompact ? label : undefined}
                aria-current={active ? 'page' : undefined}
                onClick={() => { action(); onCloseMobile(); }}
                className={`${rowBase} ${isCompact ? 'justify-center px-0' : ''} ${active ? rowActive : rowIdle}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-200' : 'text-stone-300/80'}`} strokeWidth={1.8} />
                {!isCompact && <span className="truncate">{label}</span>}
              </button>
            ))}
          </nav>

          <section className="mt-4 border-t border-white/[0.08] pt-2.5" aria-label="Workflow navigation">
            <button type="button" aria-expanded={isWorkflowExpanded} onClick={() => setIsWorkflowExpanded(value => !value)} className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-stone-300/65 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${isCompact ? 'justify-center' : ''}`}>
              {!isCompact && <span>Workflow</span>}
              {isWorkflowExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            {isWorkflowExpanded && <nav aria-label="Workflow" className="mt-1 space-y-0.5">
              {navSections.map(({ id, label, icon: Icon, count, tone }) => {
                const active = currentSection === id && !selectedProjectId && viewMode === 'things_list';
                return <button key={id} type="button" title={isCompact ? `${label}${count ? `, ${count} tasks` : ''}` : undefined} aria-current={active ? 'page' : undefined} onClick={() => handleNavClick(id)} className={`${rowBase} ${isCompact ? 'justify-center px-0' : 'justify-between'} ${active ? rowActive : rowIdle}`}>
                  <span className={`flex min-w-0 items-center gap-2.5 ${isCompact ? '' : 'truncate'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${tone}`} strokeWidth={1.8} />
                    {!isCompact && <span className="truncate">{label}</span>}
                  </span>
                  {!isCompact && count > 0 && <span className="min-w-5 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-center text-[10px] tabular-nums text-stone-200/75">{count}</span>}
                </button>;
              })}
            </nav>}
          </section>

          <section className="mt-4 border-t border-white/[0.08] pt-2.5" aria-label="Projects navigation">
            <div className="flex items-center gap-1">
              <button type="button" onClick={goToProjects} aria-current={viewMode === 'projects' && !selectedProjectId ? 'page' : undefined} className={`flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-[10px] font-semibold uppercase tracking-[0.13em] transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${viewMode === 'projects' && !selectedProjectId ? 'text-amber-200' : 'text-stone-300/65 hover:text-white'}`}>
                {isCompact ? <Folder className="h-4 w-4" /> : <span>Projects</span>}
              </button>
              <button type="button" aria-label={isProjectsExpanded ? 'Collapse project groups' : 'Expand project groups'} aria-expanded={isProjectsExpanded} onClick={() => setIsProjectsExpanded(value => !value)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-300/70 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80">
                {isProjectsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              <div className="relative">
                <button type="button" aria-label="Create project or group" title="Create project or group" onClick={() => setShowAddMenu(value => !value)} className="grid h-8 w-8 place-items-center rounded-lg text-stone-300/70 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80">
                  <Plus className="h-4 w-4" />
                </button>
                {showAddMenu && <div className="absolute right-0 top-9 z-[60] w-44 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-menu)] p-1.5 text-sm shadow-xl backdrop-blur-xl">
                  <button type="button" onClick={() => { setShowAddMenu(false); onOpenNewProject(); }} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]"><Folder className="h-4 w-4 text-amber-600" />New Project</button>
                  <button type="button" onClick={() => { setShowAddMenu(false); onOpenNewCategory(); }} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]"><Tag className="h-4 w-4 text-stone-500" />New Group</button>
                </div>}
              </div>
            </div>

            {isProjectsExpanded && !isCompact && <div className="mt-1 space-y-1">
              {areas.map(area => {
                const areaProjects = projects.filter(project => project.areaId === area.id);
                const areaCollapsed = collapsedAreaIds.has(area.id);
                return <div key={area.id}>
                  <button type="button" aria-expanded={!areaCollapsed} onClick={() => toggleArea(area.id)} className="flex min-h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[12px] font-medium text-stone-200/80 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80">
                    <ChevronRight className={`h-3 w-3 shrink-0 text-stone-400 transition-transform ${areaCollapsed ? '' : 'rotate-90'}`} />
                    <span className="shrink-0 text-[13px]">{area.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{area.name}</span>
                    {areaProjects.length > 0 && <span className="text-[10px] tabular-nums text-stone-400/80">{areaProjects.length}</span>}
                  </button>
                  {!areaCollapsed && <div className="ml-3 border-l border-white/[0.09] pl-2">
                    {areaProjects.map(project => {
                      const projectTasks = tasks.filter(task => task.projectId === project.id);
                      const completeCount = projectTasks.filter(task => task.status === 'done').length;
                      const selected = selectedProjectId === project.id;
                      const radius = 5;
                      const circumference = 2 * Math.PI * radius;
                      const ratio = projectTasks.length ? completeCount / projectTasks.length : 0;
                      return <button key={project.id} type="button" title={project.title} aria-current={selected ? 'page' : undefined} onClick={() => handleProjectClick(project.id)} className={`${rowBase} min-h-8 gap-2 px-2 text-[12px] ${selected ? rowActive : rowIdle}`}>
                        <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 -rotate-90" viewBox="0 0 12 12">
                          <circle cx="6" cy="6" r={radius} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.6" />
                          <circle cx="6" cy="6" r={radius} fill="none" stroke={project.colorHex || '#d6b46c'} strokeWidth="1.6" strokeDasharray={circumference} strokeDashoffset={circumference - ratio * circumference} strokeLinecap="round" />
                        </svg>
                        <span className="min-w-0 flex-1 truncate">{project.title}</span>
                        <span className="text-[10px] tabular-nums text-stone-400/75">{completeCount}/{projectTasks.length}</span>
                      </button>;
                    })}
                  </div>}
                </div>;
              })}
              {projects.filter(p => !p.areaId || !areas.some(a => a.id === p.areaId)).map(project => <button key={project.id} type="button" onClick={() => handleProjectClick(project.id)} className={`${rowBase} ${rowIdle} min-h-8 px-2 text-xs`}><Folder className="h-4 w-4" /><span className="truncate">{project.title}</span></button>)}
              {areas.length === 0 && <p className="px-3 py-2 text-xs text-stone-400">No project groups yet</p>}
            </div>}
          </section>

          <section className="mt-4 border-t border-white/[0.08] pt-2.5" aria-label="Tools">
            <button type="button" aria-expanded={isToolsExpanded} onClick={() => {
              if (isCompact) {
                setIsCollapsed(false);
                safeStorage.setItem('omnisticky_sidebar_collapsed', 'false');
              }
              setIsToolsExpanded(value => !value);
            }} title={isCompact ? 'Tools' : undefined} className={`flex min-h-8 w-full items-center justify-between rounded-lg px-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-stone-300/65 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${isCompact ? 'justify-center' : ''}`}>
              {!isCompact && <span>Tools</span>}
              {isToolsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : isCompact ? <Settings className="h-4 w-4" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            {isToolsExpanded && <div className="mt-1 space-y-0.5">
              <button type="button" onClick={onOpenSubscription} title={'About Omni Sticky'} className={`${rowBase} ${isCompact ? 'justify-center px-0' : 'justify-between'} ${rowIdle}`}>
                <span className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 shrink-0 text-amber-200/80" />{!isCompact && <span>{'Free beta & help'}</span>}</span>
                {!isCompact && <span className="text-[10px] text-stone-400">{'Info'}</span>}
              </button>
              <button type="button" onClick={onOpenWidgets} title="Widgets Suite" className={`${rowBase} ${isCompact ? 'justify-center px-0' : ''} ${rowIdle}`}><Layout className="h-4 w-4 shrink-0 text-stone-300/80" />{!isCompact && <span>Widgets</span>}</button>
              <button type="button" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} className={`${rowBase} ${isCompact ? 'justify-center px-0' : 'justify-between'} ${rowIdle}`}>
                <span className="flex items-center gap-2.5">{theme === 'dark' ? <Moon className="h-4 w-4 shrink-0 text-stone-300/80" /> : <Sun className="h-4 w-4 shrink-0 text-stone-300/80" />}{!isCompact && <span>Appearance</span>}</span>
                {!isCompact && <span className="text-[10px] text-stone-400">{theme === 'dark' ? 'Dark' : 'Light'}</span>}
              </button>
              <button type="button" onClick={onOpenPermissions} title="Permissions and notifications" className={`${rowBase} ${isCompact ? 'justify-center px-0' : ''} ${rowIdle}`}><Bell className="h-4 w-4 shrink-0 text-stone-300/80" />{!isCompact && <span>Permissions</span>}</button>
            </div>}
          </section>
        </div>

        <div className="shrink-0 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-footer)] p-2.5">
          {!isCompact && <button type="button" onClick={() => confetti({ particleCount: 24, spread: 45, origin: { y: 0.9, x: 0.1 } })} className="mb-2 flex min-h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[11px] text-[var(--sidebar-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80">
            <Sparkles className="h-3.5 w-3.5 text-amber-200/80" />Small steps. Big results.
          </button>}
          <button type="button" onClick={onOpenSettings} title="Settings and backups" className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2 transition hover:bg-[var(--sidebar-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${isCompact ? 'justify-center' : ''}`}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-700 text-[10px] font-bold text-white shadow-sm">OS</span>
            {!isCompact && <><span className="min-w-0 flex-1 truncate text-left text-xs font-medium text-stone-100/90">Local workspace</span><Settings className="h-3.5 w-3.5 text-stone-400" /></>}
          </button>
        </div>
      </aside>
    </>
  );
};

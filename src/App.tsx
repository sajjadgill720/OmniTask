import { WelcomeScreen } from './components/WelcomeScreen';
import { getStorageError, protectStorageKey, reportStorageError } from './utils/safeStorage';
import type { Workspace } from './utils/backup';
import { safeStorage } from './utils/safeStorage';
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThingsHeader } from './components/ThingsHeader';
import { StudioBoardView } from './components/StudioBoardView';
import { StudioWallAtmosphere } from './components/StudioWallAtmosphere';
import { StudioTopMural } from './components/StudioTopMural';
import { StudioRightPanel } from './components/StudioRightPanel';
const FocusRoomView = lazy(() => import('./components/FocusRoomView').then(module => ({ default: module.FocusRoomView })));
const CanvasWallView = lazy(() => import('./components/CanvasWallView').then(module => ({ default: module.CanvasWallView })));
const AnalyticsDashboardView = lazy(() => import('./components/AnalyticsDashboardView').then(module => ({ default: module.AnalyticsDashboardView })));
import { WorkflowStageView } from './components/WorkflowStageView';
import { ProjectsHubView } from './components/ProjectsHubView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { MagicPlusButton } from './components/MagicPlusButton';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { WidgetCenterModal } from './components/WidgetCenterModal';
import { PermissionsModal } from './components/PermissionsModal';
import { ProjectModal } from './components/ProjectModal';
import { CategoryModal } from './components/CategoryModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ToastProvider } from './components/ToastNotification';
import { 
  Task, 
  Area, 
  Project, 
  ThingsSection, 
  AppPermissionsState, 
  Priority,
  ViewMode,
  DensityMode,
  ThemeMode,
  CanvasElement,
  CanvasConnection
} from './types';
import { 
  saveStoredWorkspace, WORKSPACE_STORAGE_KEY,
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredAreas, 
  saveStoredAreas, 
  loadStoredProjects, 
  saveStoredProjects, 
  loadStoredCanvasElements,
  saveStoredCanvasElements,
  loadStoredCanvasConnections,
  saveStoredCanvasConnections,
  DEFAULT_TASKS,
  generateId 
} from './utils/storage';
import { checkPermissions, updateAppBadge } from './utils/permissions';
import { STICKY_COLORS } from './constants/theme';

export function App() {
  // Main data collections
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [areas, setAreas] = useState<Area[]>(() => loadStoredAreas());
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>(() => loadStoredCanvasElements());
  const [canvasConnections, setCanvasConnections] = useState<CanvasConnection[]>(() => loadStoredCanvasConnections());

  const [hasStarted, setHasStarted] = useState(() => safeStorage.getItem('omnisticky_started') === 'true' || tasks.length > 0 || projects.length > 0 || canvasElements.length > 0);
  const [storageError, setStorageError] = useState(getStorageError);
  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    const update = () => setStorageError(getStorageError());
    window.addEventListener('omnisticky-storage-error', update);
    update();
    return () => window.removeEventListener('omnisticky-storage-error', update);
  }, []);
  const startWorkspace = (demo = false) => {
    if (demo) setTasks(DEFAULT_TASKS.map(t => ({ ...t, id: generateId() })));
    safeStorage.setItem('omnisticky_started', 'true');
    setHasStarted(true); setShowGuide(true);
  };
  const restoreWorkspace = (workspace: Workspace) => {
    if (!saveStoredWorkspace(workspace)) throw new Error('The workspace could not be saved. Resolve the storage warning before restoring. Your current workspace has not been replaced.');
    setTasks(workspace.tasks); setAreas(workspace.areas); setProjects(workspace.projects);
    setCanvasElements(workspace.canvasElements); setCanvasConnections(workspace.canvasConnections);
    setSelectedTask(null); setSelectedProjectId(null);
  };

  // Theme Mode: 'light' | 'dark' (Dark features ambient luminous white hue)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem('omnisticky_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Sync theme with HTML document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeStorage.setItem('omnisticky_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // View Mode: 'canvas_3d' (Executive Corkboard Studio) | 'board' | 'focus' | 'canvas' | 'analytics' | 'projects'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = safeStorage.getItem('omnisticky_view_mode');
    if (saved === 'kanban') return 'board';
    if (saved === 'sticky_wall') return 'canvas';
    if (saved === 'things_list' || saved === 'focus' || saved === 'canvas' || saved === 'canvas_3d' || saved === 'analytics' || saved === 'projects' || saved === 'board') return saved as ViewMode;
    return window.matchMedia('(max-width: 639px)').matches ? 'things_list' : 'board';
  });

  // Density Mode: 'comfortable' | 'compact'
  const [density, setDensity] = useState<DensityMode>(() => {
    return (safeStorage.getItem('omnisticky_density') as DensityMode) || 'comfortable';
  });

  const handleToggleDensity = () => {
    setDensity(prev => {
      const next = prev === 'comfortable' ? 'compact' : 'comfortable';
      safeStorage.setItem('omnisticky_density', next);
      return next;
    });
  };

  // 3D Debug Mode: camera pitch/yaw/scale metrics overlay
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return safeStorage.getItem('omnisticky_debug_mode') === 'true';
  });

  const handleToggleDebugMode = () => {
    setDebugMode(prev => {
      const next = !prev;
      safeStorage.setItem('omnisticky_debug_mode', String(next));
      return next;
    });
  };

  // Navigation state
  const [currentSection, setCurrentSection] = useState<ThingsSection>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Search and quick filters
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Modals & Drawers state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [desktopQuickAddSignal, setDesktopQuickAddSignal] = useState(0);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const isProUser = false;
  useEffect(() => {
    return window.omniStickyDesktop?.onQuickAdd(() => setDesktopQuickAddSignal(signal => signal + 1));
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Permissions state
  const [permissions, setPermissions] = useState<AppPermissionsState>({
    notifications: 'default',
    audioEnabled: true,
    persistentStorage: false,
    badgingSupported: false,
  });

  // Load permissions on mount
  useEffect(() => {
    checkPermissions().then(setPermissions);
  }, []);

  const refreshPermissions = () => {
    checkPermissions().then(setPermissions);
  };

  // Commit related data together; legacy keys are read only for migration.
  useEffect(() => {
    if (!hasStarted) return;
    const save = () => saveStoredWorkspace({ tasks, areas, projects, canvasElements, canvasConnections });
    const timer = setTimeout(save, 200);
    window.addEventListener('pagehide', save);
    return () => { clearTimeout(timer); window.removeEventListener('pagehide', save); };
  }, [tasks, areas, projects, canvasElements, canvasConnections, hasStarted]);
  useEffect(() => {
    updateAppBadge(tasks.filter(t => t.section === 'today' && t.status !== 'done').length);
  }, [tasks]);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === WORKSPACE_STORAGE_KEY || event.key === null) {
        protectStorageKey(WORKSPACE_STORAGE_KEY);
        reportStorageError('This workspace changed in another tab. Saving in this tab is paused to avoid overwriting that work. Export any changes you need, then reload. Use one tab at a time.');
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);

  // Persist view mode preference
  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedProjectId(null);
    safeStorage.setItem('omnisticky_view_mode', mode);
    if (mode === 'focus') {
      setTasks(prev => prev.map(t => t.isTimerRunning ? { ...t, isTimerRunning: false } : t));
      setSelectedProjectId(null);
      setCurrentSection('today');
    }
  };

  // Stopwatch focus timer ticker engine
  const hasRunningTimer = tasks.some(t => t.isTimerRunning);
  useEffect(() => {
    if (!hasRunningTimer) return;
    let lastTick = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastTick) / 1000);
      if (elapsed <= 0) return;
      lastTick += elapsed * 1000;
      setTasks(prev =>
        prev.map(t =>
          t.isTimerRunning
            ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + elapsed }
            : t
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [hasRunningTimer]);

  // Filter tasks based on active section or project
  const visibleTasks = useMemo(() => {
    return tasks.filter(t => {
      // If a project is selected
      if (selectedProjectId) {
        if (t.projectId !== selectedProjectId) return false;
      } else {
        // Filter by section
        if (currentSection === 'logbook') {
          if (t.status !== 'done') return false;
        } else {
          if (t.section !== currentSection) return false;
          if (t.status === 'done' && currentSection !== 'today' && viewMode === 'things_list') {
            return false;
          }
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(q);
        const notesMatch = t.notes?.toLowerCase().includes(q) || false;
        const tagMatch = t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!titleMatch && !notesMatch && !tagMatch) return false;
      }

      // Urgent filter
      if (onlyUrgent && t.priority !== 'urgent') return false;

      return true;
    });
  }, [tasks, currentSection, selectedProjectId, searchQuery, onlyUrgent, viewMode]);

  // Handlers
  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const isDone = t.status === 'done';
        return {
          ...t,
          status: isDone ? 'todo' : 'done',
          completedAt: isDone ? undefined : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTimerRunning: false,
        };
      })
    );
  };

  const handleToggleTimer = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t.isTimerRunning ? { ...t, isTimerRunning: false } : t;
        return { ...t, isTimerRunning: t.status !== 'done' && !t.isTimerRunning };
      })
    );
  };

  const handleSaveTask = (updated: Task) => {
    updated = { ...updated, updatedAt: new Date().toISOString(), completedAt: updated.status === 'done' ? updated.completedAt || new Date().toISOString() : undefined, isTimerRunning: updated.status === 'done' ? false : updated.isTimerRunning };
    setTasks(prev => {
      const exists = prev.some(t => t.id === updated.id);
      if (exists) {
        return prev.map(t => t.id === updated.id ? updated : t);
      }
      return [updated, ...prev];
    });
    if (selectedTask && selectedTask.id === updated.id) {
      setSelectedTask(updated);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  // Reorder tasks via Drag and Drop
  const handleReorderTasks = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTasks(prev => {
      const sourceIndex = prev.findIndex(t => t.id === sourceId);
      const targetIndex = prev.findIndex(t => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  // Move task status via Kanban Drag and Drop
  const handleMoveTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: newStatus,
          isTimerRunning: newStatus === 'done' ? false : t.isTimerRunning,
          updatedAt: new Date().toISOString(),
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleAddProject = (project: Project) => {
    setProjects(prev => prev.some(p => p.id === project.id) ? prev.map(p => p.id === project.id ? project : p) : [...prev, project]);
    setSelectedProjectId(project.id);
  };

  const handleAddArea = (area: Area) => {
    setAreas(prev => [...prev, area]);
  };

  const handleMagicAdd = (parsed: {
    title: string;
    dueDate?: string;
    isThisEvening?: boolean;
    priority: Priority;
    tags: string[];
    section: ThingsSection;
    colorHex?: string;
    status?: Task['status'];
    projectId?: string;
  }) => {
    const defaultColor = parsed.colorHex || '#fef08a';

    const newTask: Task = {
      id: generateId(),
      title: parsed.title.trim() || 'Untitled note',
      notes: '',
      checklists: [],
      section: parsed.section,
      isThisEvening: parsed.isThisEvening || false,
      projectId: parsed.projectId || selectedProjectId || undefined,
      priority: parsed.priority,
      status: parsed.status || 'todo',
      tags: parsed.tags,
      dueDate: parsed.dueDate,
      timeSpentSeconds: 0,
      isTimerRunning: false,
      colorHex: defaultColor,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // View Title and Subtitle generator
  const currentViewMeta = useMemo(() => {
    if (selectedProject) {
      return {
        title: selectedProject.title,
        subtitle: selectedProject.description || 'Project Notes & Milestones',
      };
    }
    const titles: Record<ThingsSection, { title: string; subtitle: string }> = {
      today: { title: 'Today', subtitle: 'Focus on your highest priority notes for today' },
      inbox: { title: 'Inbox', subtitle: 'Quick captures and raw sticky notes' },
      upcoming: { title: 'Upcoming', subtitle: 'Scheduled deadlines and events' },
      anytime: { title: 'Anytime', subtitle: 'Actionable notes ready whenever you have time' },
      someday: { title: 'Someday', subtitle: 'Inspirations, future ideas, and long-term goals' },
      logbook: { title: 'Logbook', subtitle: 'Completed accomplishments and historical log' },
    };
    return titles[currentSection] || { title: 'Sticky Notes', subtitle: 'All active notes' };
  }, [selectedProject, currentSection]);

  if (!hasStarted) return <><WelcomeScreen onStart={() => startWorkspace()} onDemo={() => startWorkspace(true)} />{storageError && <div role="alert" className="storage-alert">{storageError}</div>}</>;

  return (
    <ToastProvider>
      <div className="studio-wall-background relative isolate w-full min-h-screen overflow-x-hidden font-sans select-none text-stone-900 dark:text-stone-100">

      {storageError && <div role="alert" className="storage-alert">{storageError}<button onClick={() => setIsSettingsOpen(true)}>Open backups</button></div>}
      {showGuide && <div className="first-run-guide" role="status"><strong>Your space is ready.</strong> Use + to capture a note. Select a note to edit it. Your work stays on this device—keep a backup in Settings.<button onClick={() => setShowGuide(false)} aria-label="Dismiss getting started tip">Got it</button></div>}
      <StudioWallAtmosphere />

      {/* 2. Top Sleek Frosted Glass Search & Utilities Bar */}
      <ThingsHeader
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenQuickAdd={() => setDesktopQuickAddSignal(signal => signal + 1)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        isProUser={isProUser}
      />

      {/* 3. Main Workspace: Left Glass Sidebar + Center Wall Stage + Right Glass Panels */}
      <div className={`relative z-10 max-w-[1720px] mx-auto px-2 sm:px-4 xl:px-6 flex items-start gap-3 xl:gap-6 ${viewMode === 'canvas_3d' ? 'pb-20' : viewMode === 'board' ? 'pb-8' : 'pb-24'}`}>
        
        {/* Left Floating Translucent Glass Panel (Omni Sticky Navigation) */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          areas={areas}
          projects={projects}
          tasks={tasks}
          viewMode={viewMode}
          onChangeViewMode={handleChangeViewMode}
          onOpenNewProject={() => { setIsEditingProject(false); setIsProjectModalOpen(true); }}
          onOpenNewCategory={() => setIsCategoryModalOpen(true)}
          onOpenWidgets={() => setIsWidgetsOpen(true)}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
          onOpenSubscription={() => setIsSettingsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isProUser={isProUser}
          permissions={permissions}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Center Main Stage on Wall */}
        <main className="flex-1 min-w-0 flex flex-col items-center">
          
          {/* Top Wall Art: "Dream Big Plan Better" with Golden Crown + Daily Rotating Quote System */}
          <StudioTopMural compact={viewMode === 'canvas' || viewMode === 'canvas_3d'} />

          {/* Active View Container */}
          <div className="w-full flex-1"><Suspense fallback={<p role="status" className="p-8 text-center">Opening your workspace…</p>}>
            {selectedProject ? (
              /* Project Details View */
              <ProjectDetailView
                project={selectedProject}
                tasks={tasks}
                onBack={() => { setSelectedProjectId(null); setViewMode('projects'); }}
                onSelectTask={setSelectedTask}
                onToggleComplete={handleToggleComplete}
                onQuickAdd={(title, priority) => handleMagicAdd({
                  title,
                  priority: priority || 'normal',
                  tags: [],
                  section: 'today',
                  projectId: selectedProject.id,
                })}
                onOpenEditProject={() => { setIsEditingProject(true); setIsProjectModalOpen(true); }}
              />
            ) : viewMode === 'projects' ? (
              /* Projects Hub Overview */
              <ProjectsHubView
                projects={projects}
                tasks={tasks}
                areas={areas}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenNewProject={() => { setIsEditingProject(false); setIsProjectModalOpen(true); }}
              />
            ) : viewMode === 'board' || viewMode === 'canvas_3d' ? (
              /* Executive Standup Wall: compact interactive corkboard */
              <StudioBoardView
                executiveWall={viewMode === 'canvas_3d'}
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onSelectTask={setSelectedTask}
                onToggleTimer={handleToggleTimer}
                onUpdateTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                onMoveTaskStatus={handleMoveTaskStatus}
                audioEnabled={permissions.audioEnabled}
                onNavigateToAnalytics={() => handleChangeViewMode('analytics')}
                onToggleStandupWall={() => handleChangeViewMode(viewMode === 'canvas_3d' ? 'board' : 'canvas_3d')}
                onQuickAdd={() => setDesktopQuickAddSignal(signal => signal + 1)}
              />
            ) : viewMode === 'focus' ? (
              /* Focus Room: Immersive Study Room with Circular Timer, Sounds & Progress */
              <FocusRoomView
                tasks={visibleTasks}
                projects={projects}
                onSelectTask={setSelectedTask}
                onToggleComplete={handleToggleComplete}
                onUpdateTask={handleSaveTask}
                audioEnabled={permissions.audioEnabled}
              />
            ) : viewMode === 'canvas' ? (
              /* Canvas Wall: Visual Thinking Studio & Brainstorming Ideas Board */
              <CanvasWallView
                tasks={visibleTasks}
                projects={projects}
                elements={canvasElements}
                onUpdateElements={setCanvasElements}
                connections={canvasConnections}
                onUpdateConnections={setCanvasConnections}
                onSelectTask={setSelectedTask}
                onQuickAdd={() => setDesktopQuickAddSignal(signal => signal + 1)}
              />
            ) : viewMode === 'analytics' ? (
              /* Productivity analytics and momentum insights */
              <AnalyticsDashboardView
                tasks={tasks}
                projects={projects}
                onSelectTask={setSelectedTask}
              />
            ) : (
              /* Workflow Stages: Today, Inbox, Upcoming, Anytime, Someday, Logbook */
              <WorkflowStageView
                section={currentSection}
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onSelectTask={setSelectedTask}
                onQuickAdd={(title, priority) => handleMagicAdd({
                  title: title || 'New note',
                  priority: priority || 'normal',
                  tags: [],
                  section: currentSection,
                  colorHex: '#F8D979',
                })}
              />
            )}
          </Suspense></div>

        </main>

        {/* Right Floating Translucent Glass Panels (Upcoming & Quick Actions) */}
        <StudioRightPanel
          tasks={tasks}
          onSelectTask={setSelectedTask}
          onQuickAdd={() => setDesktopQuickAddSignal(signal => signal + 1)}
          onOpenProjectModal={() => { setIsEditingProject(false); setIsProjectModalOpen(true); }}
          onViewAllUpcoming={() => {
            setSelectedProjectId(null);
            setCurrentSection('upcoming');
            handleChangeViewMode('things_list');
          }}
        />

      </div>

      {/* Floating Magic Sticky Quick-Add Button */}
      <MagicPlusButton
        onAddTask={handleMagicAdd}
        currentSection={currentSection}
        desktopQuickAddSignal={desktopQuickAddSignal}
      />

      {/* Slide-over Task Inspector / Detail Drawer */}
      <TaskDetailDrawer
        task={tasks.find(t => t.id === selectedTask?.id) || null}
        projects={projects}
        areas={areas}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onToggleTimer={handleToggleTimer}
      />

      {/* Interactive Widgets Hub Modal */}
      <WidgetCenterModal
        isOpen={isWidgetsOpen}
        onClose={() => setIsWidgetsOpen(false)}
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onToggleTimer={handleToggleTimer}
        onAddTask={(title, section, colorHex) => handleMagicAdd({
          title,
          priority: 'normal',
          tags: [],
          section: (section as any) || currentSection,
          colorHex,
        })}
        audioEnabled={permissions.audioEnabled}
        onRecordFocus={(id, seconds) => setTasks(prev => prev.map(t => t.id === id ? { ...t, timeSpentSeconds: t.timeSpentSeconds + seconds, updatedAt: new Date().toISOString() } : t))}
      />

      {/* Web & OS Permissions Hub Modal */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        permissions={permissions}
        onUpdatePermissions={refreshPermissions}
      />

      {/* New Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        areas={areas}
        onAddProject={handleAddProject}
        project={isEditingProject ? selectedProject || undefined : undefined}
      />

      {/* New Category / Area Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddArea}
      />

      {/* Global Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        permissions={permissions}
        onUpdatePermissions={refreshPermissions}
        tasks={tasks}
        areas={areas}
        projects={projects}
        canvasElements={canvasElements}
        canvasConnections={canvasConnections}
        onRestore={restoreWorkspace}
      />

      {/* ⌘K / Ctrl+K Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        onSelectTask={setSelectedTask}
        onNavigateSection={(sec) => {
          setSelectedProjectId(null);
          setCurrentSection(sec);
          handleChangeViewMode('things_list');
        }}
        onNavigateProject={(projId) => {
          setSelectedProjectId(projId);
        }}
        onChangeViewMode={handleChangeViewMode}
        onOpenNewNote={() => setDesktopQuickAddSignal(signal => signal + 1)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />

      </div>
    </ToastProvider>
  );
}

export default App;

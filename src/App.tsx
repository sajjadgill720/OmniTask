import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThingsHeader } from './components/ThingsHeader';
import { StudioBoardView } from './components/StudioBoardView';
import { StudioWallAtmosphere } from './components/StudioWallAtmosphere';
import { StudioTopMural } from './components/StudioTopMural';
import { StudioRightPanel } from './components/StudioRightPanel';
import { FocusRoomView } from './components/FocusRoomView';
import { CanvasWallView } from './components/CanvasWallView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { SpatialCanvas3DView } from './components/SpatialCanvas3DView';
import { WorkflowStageView } from './components/WorkflowStageView';
import { ProjectsHubView } from './components/ProjectsHubView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { MagicPlusButton } from './components/MagicPlusButton';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { WidgetCenterModal } from './components/WidgetCenterModal';
import { PermissionsModal } from './components/PermissionsModal';
import { ProjectModal } from './components/ProjectModal';
import { CategoryModal } from './components/CategoryModal';
import { SubscriptionModal } from './components/SubscriptionModal';
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

  // Theme Mode: 'light' | 'dark' (Dark features ambient luminous white hue)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('omnisticky_theme') as ThemeMode;
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
    localStorage.setItem('omnisticky_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // View Mode: 'board' (default Studio Wall) | 'focus' | 'canvas' | 'canvas_3d' | 'analytics' | 'projects'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('omnisticky_view_mode');
    if (saved === 'kanban' || saved === 'board') return 'board';
    if (saved === 'sticky_wall') return 'canvas';
    if (saved === 'focus' || saved === 'canvas' || saved === 'canvas_3d' || saved === 'analytics' || saved === 'projects') return saved as ViewMode;
    return 'board';
  });

  // Density Mode: 'comfortable' | 'compact'
  const [density, setDensity] = useState<DensityMode>(() => {
    return (localStorage.getItem('omnisticky_density') as DensityMode) || 'comfortable';
  });

  const handleToggleDensity = () => {
    setDensity(prev => {
      const next = prev === 'comfortable' ? 'compact' : 'comfortable';
      localStorage.setItem('omnisticky_density', next);
      return next;
    });
  };

  // 3D Debug Mode: camera pitch/yaw/scale metrics overlay
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('omnisticky_debug_mode') === 'true';
  });

  const handleToggleDebugMode = () => {
    setDebugMode(prev => {
      const next = !prev;
      localStorage.setItem('omnisticky_debug_mode', String(next));
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    return localStorage.getItem('omnisticky_pro_user') === 'true';
  });

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

  const handleUpgradeSuccess = () => {
    setIsProUser(true);
    localStorage.setItem('omnisticky_pro_user', 'true');
  };

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

  // Auto-save collections on change
  useEffect(() => {
    saveStoredTasks(tasks);
    const pendingToday = tasks.filter(t => t.section === 'today' && t.status !== 'done').length;
    updateAppBadge(pendingToday);
  }, [tasks]);

  useEffect(() => {
    saveStoredAreas(areas);
  }, [areas]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveStoredCanvasElements(canvasElements);
  }, [canvasElements]);

  useEffect(() => {
    saveStoredCanvasConnections(canvasConnections);
  }, [canvasConnections]);

  // Persist view mode preference
  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('omnisticky_view_mode', mode);
    if (mode === 'focus') {
      setSelectedProjectId(null);
      setCurrentSection('today');
    }
  };

  // Stopwatch focus timer ticker engine
  useEffect(() => {
    const hasRunningTimer = tasks.some(t => t.isTimerRunning);
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      setTasks(prev =>
        prev.map(t =>
          t.isTimerRunning
            ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + 1 }
            : t
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

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
          isTimerRunning: false,
        };
      })
    );
  };

  const handleToggleTimer = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        return { ...t, isTimerRunning: !t.isTimerRunning };
      })
    );
  };

  const handleSaveTask = (updated: Task) => {
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
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleAddProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
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
      title: parsed.title,
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

  return (
    <ToastProvider>
      <div className="relative w-full min-h-screen overflow-x-hidden font-sans select-none studio-wall-background text-stone-900 dark:text-stone-100">
      
      {/* 1. Global Photorealistic Studio Wall Atmosphere (Sunlight, Ivy Leaves, Wooden Desk, Lamp, Books, Mug, Astronaut, Terrarium) */}
      <StudioWallAtmosphere />

      {/* 2. Top Sleek Frosted Glass Search & Utilities Bar */}
      <ThingsHeader
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenQuickAdd={() => handleMagicAdd({
          title: 'New note',
          priority: 'normal',
          tags: [],
          section: currentSection,
        })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        isProUser={isProUser}
      />

      {/* 3. Main Workspace: Left Glass Sidebar + Center Wall Stage + Right Glass Panels */}
      <div className={`relative z-10 max-w-[1720px] mx-auto px-4 sm:px-6 flex items-start gap-6 ${viewMode === 'board' ? 'pb-8' : 'pb-24'}`}>
        
        {/* Left Floating Translucent Glass Panel (Knovera Navigation) */}
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
          onOpenNewProject={() => setIsProjectModalOpen(true)}
          onOpenNewCategory={() => setIsCategoryModalOpen(true)}
          onOpenWidgets={() => setIsWidgetsOpen(true)}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
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
          <div className="w-full flex-1">
            {selectedProject ? (
              /* Project Details View */
              <ProjectDetailView
                project={selectedProject}
                tasks={tasks}
                onBack={() => setSelectedProjectId(null)}
                onSelectTask={setSelectedTask}
                onToggleComplete={handleToggleComplete}
                onQuickAdd={(title, priority) => handleMagicAdd({
                  title,
                  priority: priority || 'normal',
                  tags: [],
                  section: 'today',
                  projectId: selectedProject.id,
                })}
                onOpenEditProject={() => setIsProjectModalOpen(true)}
              />
            ) : viewMode === 'projects' ? (
              /* Projects Hub Overview */
              <ProjectsHubView
                projects={projects}
                tasks={tasks}
                areas={areas}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenNewProject={() => setIsProjectModalOpen(true)}
              />
            ) : viewMode === 'board' ? (
              /* My Board: 3-Column Sticky Note Kanban */
              <StudioBoardView
                tasks={tasks}
                projects={projects}
                onToggleComplete={handleToggleComplete}
                onSelectTask={setSelectedTask}
                onToggleTimer={handleToggleTimer}
                onUpdateTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                onMoveTaskStatus={handleMoveTaskStatus}
                audioEnabled={permissions.audioEnabled}
                onNavigateToNetwork={() => handleChangeViewMode('analytics')}
                onQuickAdd={() => handleMagicAdd({
                  title: 'New note',
                  priority: 'normal',
                  tags: ['Study'],
                  section: 'today',
                  colorHex: '#F8D979',
                })}
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
                onQuickAdd={() => handleMagicAdd({
                  title: 'New note',
                  priority: 'normal',
                  tags: [],
                  section: currentSection,
                  colorHex: '#F8D979',
                })}
                onToggle3DSpatial={() => handleChangeViewMode('canvas_3d')}
              />
            ) : viewMode === 'canvas_3d' ? (
              /* Knovera Wall — 3D Spatial Canvas (Status Pedestals & 3D Ideas Space) */
              <SpatialCanvas3DView
                title="Knovera Wall"
                subtitle="Visual Brainstorming Studio"
                tasks={tasks}
                projects={projects}
                elements={canvasElements}
                onUpdateElements={setCanvasElements}
                connections={canvasConnections}
                onUpdateConnections={setCanvasConnections}
                onToggleComplete={handleToggleComplete}
                onSelectTask={setSelectedTask}
                onToggleTimer={handleToggleTimer}
                onUpdateTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                audioEnabled={permissions.audioEnabled}
                onQuickAdd={(status) => handleMagicAdd({
                  title: 'New note',
                  status: status || 'todo',
                  priority: 'normal',
                  tags: [],
                  section: currentSection,
                  colorHex: '#F8D979',
                })}
                onReorderTasks={handleReorderTasks}
                onMoveTaskStatus={handleMoveTaskStatus}
                onBack={() => handleChangeViewMode('canvas')}
              />
            ) : viewMode === 'analytics' ? (
              /* Analytics & Interactive Network Graph */
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
                projects={projects}
                onToggleComplete={handleToggleComplete}
                onSelectTask={setSelectedTask}
                onToggleTimer={handleToggleTimer}
                onQuickAdd={(title, priority) => handleMagicAdd({
                  title: title || 'New note',
                  priority: priority || 'normal',
                  tags: [],
                  section: currentSection,
                  colorHex: '#F8D979',
                })}
              />
            )}
          </div>

        </main>

        {/* Right Floating Translucent Glass Panels (Upcoming & Quick Actions) */}
        <StudioRightPanel
          tasks={tasks}
          onSelectTask={setSelectedTask}
          onQuickAdd={() => handleMagicAdd({
            title: 'New note',
            priority: 'normal',
            tags: [],
            section: currentSection,
            colorHex: '#FFF380',
          })}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
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
      />

      {/* Slide-over Task Inspector / Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
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
      />

      {/* Commercial Subscription & Pro Tier Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        isProUser={isProUser}
        onUpgradeSuccess={handleUpgradeSuccess}
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
        isProUser={isProUser}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        tasks={tasks}
        areas={areas}
        projects={projects}
        debugMode={debugMode}
        onToggleDebugMode={handleToggleDebugMode}
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
        }}
        onNavigateProject={(projId) => {
          setSelectedProjectId(projId);
        }}
        onChangeViewMode={handleChangeViewMode}
        onOpenNewNote={() => handleMagicAdd({
          title: 'New note',
          priority: 'normal',
          tags: [],
          section: currentSection,
        })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />

      </div>
    </ToastProvider>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThingsHeader } from './components/ThingsHeader';
import { TodayView } from './components/TodayView';
import { TaskListView } from './components/TaskListView';
import { StickyWallView } from './components/StickyWallView';
import { SpatialCanvas3DView } from './components/SpatialCanvas3DView';
import { NetworkGraph3DView } from './components/NetworkGraph3DView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { MagicPlusButton } from './components/MagicPlusButton';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { WidgetCenterModal } from './components/WidgetCenterModal';
import { PermissionsModal } from './components/PermissionsModal';
import { ProjectModal } from './components/ProjectModal';
import { CategoryModal } from './components/CategoryModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { 
  Task, 
  Area, 
  Project, 
  ThingsSection, 
  AppPermissionsState, 
  Priority,
  ViewMode,
  ThemeMode
} from './types';
import { 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredAreas, 
  saveStoredAreas, 
  loadStoredProjects, 
  saveStoredProjects, 
  generateId 
} from './utils/storage';
import { checkPermissions, updateAppBadge } from './utils/permissions';
import { STICKY_COLORS } from './constants/theme';

export function App() {
  // Main data collections
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [areas, setAreas] = useState<Area[]>(() => loadStoredAreas());
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());

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

  // View Mode: 'sticky_wall' (Google Keep + Notezilla) | 'kanban' (Trello) | 'things_list' (Things 3)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('omnisticky_view_mode') as ViewMode) || 'sticky_wall';
  });

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
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    return localStorage.getItem('omnisticky_pro_user') === 'true';
  });

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

  // Persist view mode preference
  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('omnisticky_view_mode', mode);
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
  }) => {
    const defaultColor = parsed.colorHex || '#fef08a';

    const newTask: Task = {
      id: generateId(),
      title: parsed.title,
      notes: '',
      checklists: [],
      section: parsed.section,
      isThisEvening: parsed.isThisEvening || false,
      projectId: selectedProjectId || undefined,
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
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d0f15] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        areas={areas}
        projects={projects}
        tasks={tasks}
        onOpenNewProject={() => setIsProjectModalOpen(true)}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        onOpenWidgets={() => setIsWidgetsOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        isProUser={isProUser}
        permissions={permissions}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header with Search, Switcher & Action Suite */}
        <ThingsHeader
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tasks={tasks}
          areas={areas}
          projects={projects}
          permissions={permissions}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
          onOpenQuickAdd={() => handleMagicAdd({
            title: 'New Sticky Note',
            priority: 'normal',
            tags: [],
            section: currentSection,
          })}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
          isProUser={isProUser}
          onlyUrgent={onlyUrgent}
          onToggleUrgent={() => setOnlyUrgent(!onlyUrgent)}
          viewMode={viewMode}
          onChangeViewMode={handleChangeViewMode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Multi-Experience Views */}
        <main className="flex-1 pb-24">
          {viewMode === 'sticky_wall' ? (
            /* Google Keep + Notezilla Motion Sticky Wall with Corporate Whiteboard Option */
            <StickyWallView
              title={currentViewMeta.title}
              subtitle={currentViewMeta.subtitle}
              tasks={visibleTasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={setSelectedTask}
              onToggleTimer={handleToggleTimer}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              audioEnabled={permissions.audioEnabled}
              onQuickAdd={(status) => handleMagicAdd({
                title: 'New Post-it',
                priority: 'normal',
                tags: [],
                section: currentSection,
                status: status || 'todo',
              })}
              onReorderTasks={handleReorderTasks}
              onMoveTaskStatus={handleMoveTaskStatus}
            />
          ) : viewMode === 'canvas_3d' ? (
            /* 3D Spatial Canvas with Real Orbit & Z-axis Elevation */
            <SpatialCanvas3DView
              title={currentViewMeta.title}
              subtitle={currentViewMeta.subtitle}
              tasks={visibleTasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={setSelectedTask}
              onToggleTimer={handleToggleTimer}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              audioEnabled={permissions.audioEnabled}
              onQuickAdd={(status) => handleMagicAdd({
                title: 'New Post-it',
                priority: 'normal',
                tags: [],
                section: currentSection,
                status: status || 'todo',
              })}
              onReorderTasks={handleReorderTasks}
              onMoveTaskStatus={handleMoveTaskStatus}
            />
          ) : viewMode === 'network_3d' ? (
            /* 3D Knowledge & Task Constellation Graph */
            <NetworkGraph3DView
              tasks={visibleTasks}
              projects={projects}
              onSelectTask={setSelectedTask}
              onToggleComplete={handleToggleComplete}
              onQuickAdd={() => handleMagicAdd({
                title: 'New Task Node',
                priority: 'normal',
                tags: [],
                section: currentSection,
              })}
            />
          ) : viewMode === 'kanban' ? (
            /* Trello Kanban Board with Sticky Notes */
            <KanbanBoardView
              title={currentViewMeta.title}
              subtitle={currentViewMeta.subtitle}
              tasks={visibleTasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={setSelectedTask}
              onToggleTimer={handleToggleTimer}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              audioEnabled={permissions.audioEnabled}
              onQuickAdd={() => handleMagicAdd({
                title: 'New Sticky Note',
                priority: 'normal',
                tags: [],
                section: currentSection,
              })}
              onMoveTaskStatus={handleMoveTaskStatus}
            />
          ) : currentSection === 'today' && !selectedProjectId ? (
            /* Things 3 Enhanced Today View */
            <TodayView
              tasks={visibleTasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={setSelectedTask}
              onToggleTimer={handleToggleTimer}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onReorderTasks={handleReorderTasks}
              audioEnabled={permissions.audioEnabled}
              onQuickAdd={(title, priority) => handleMagicAdd({
                title: title || 'New Task',
                priority: priority || 'normal',
                tags: [],
                section: 'today',
              })}
            />
          ) : (
            /* Things 3 Enhanced Standard List View */
            <TaskListView
              section={currentSection}
              selectedProject={selectedProject}
              tasks={visibleTasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={setSelectedTask}
              onToggleTimer={handleToggleTimer}
              onUpdateTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onReorderTasks={handleReorderTasks}
              audioEnabled={permissions.audioEnabled}
              onQuickAdd={(title, priority) => handleMagicAdd({
                title: title || 'New Task',
                priority: priority || 'normal',
                tags: [],
                section: currentSection,
              })}
            />
          )}
        </main>

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

    </div>
  );
}

export default App;

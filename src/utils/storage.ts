import { Task, Area, Project } from '../types';

const TASKS_STORAGE_KEY = 'omnisticky_tasks_v2';
const AREAS_STORAGE_KEY = 'omnisticky_areas_v2';
const PROJECTS_STORAGE_KEY = 'omnisticky_projects_v2';

export const DEFAULT_AREAS: Area[] = [
  { id: 'area_work', name: 'Work & Projects', emoji: '💼', colorHex: '#3b82f6' },
  { id: 'area_personal', name: 'Personal Life', emoji: '🌱', colorHex: '#10b981' },
  { id: 'area_study', name: 'Learning & Growth', emoji: '📚', colorHex: '#f59e0b' },
];

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'proj_launch', areaId: 'area_work', title: 'Q4 Product Launch', colorHex: '#3b82f6' },
  { id: 'proj_fitness', areaId: 'area_personal', title: 'Health & Workout Routine', colorHex: '#10b981' },
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 't_simplified',
    title: 'Simplified',
    notes: 'Redesigned\nIntuitive !',
    checklists: [
      { id: 'c1', text: 'Tactile 3D Red Pushpin', completed: true },
      { id: 'c2', text: 'Curled 3D Post-it Note Paper', completed: true },
      { id: 'c3', text: 'Full RGB Color Selection & Ink Effects', completed: true },
    ],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    projectId: 'proj_launch',
    priority: 'urgent',
    status: 'in_progress',
    tags: ['Design', 'PostIt'],
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentSeconds: 720,
    isTimerRunning: false,
    colorHex: 'rgb(254, 240, 138)',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_2',
    title: 'Evening wind-down & journal reflections',
    notes: 'Reflect on 3 high-impact accomplishments of the day.',
    checklists: [
      { id: 'c4', text: 'Log day focus minutes', completed: false },
      { id: 'c5', text: 'Plan top 3 MITs for tomorrow morning', completed: false },
    ],
    section: 'today',
    isThisEvening: true, // Appears in "This Evening" in Things 3!
    areaId: 'area_personal',
    priority: 'normal',
    status: 'todo',
    tags: ['Mindfulness'],
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_3',
    title: 'Weekly grocery run & meal planning',
    notes: 'Organic oats, almond milk, greens, and fruits.',
    checklists: [],
    section: 'upcoming',
    isThisEvening: false,
    areaId: 'area_personal',
    projectId: 'proj_fitness',
    priority: 'high',
    status: 'todo',
    tags: ['Health'],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_4',
    title: 'Explore WebAssembly audio modules',
    notes: 'For advanced client-side sound processing in future updates.',
    checklists: [],
    section: 'someday',
    isThisEvening: false,
    areaId: 'area_study',
    priority: 'low',
    status: 'todo',
    tags: ['R&D'],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function generateId(): string {
  return 'item_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TASKS;
    
    // Ensure the reference photo note "Simplified Redesigned Intuitive !" is present
    const hasPhotoNote = parsed.some((t: Task) => t.id === 't_simplified');
    if (!hasPhotoNote) {
      return [DEFAULT_TASKS[0], ...parsed];
    }
    return parsed;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function loadStoredAreas(): Area[] {
  try {
    const raw = localStorage.getItem(AREAS_STORAGE_KEY);
    if (!raw) return DEFAULT_AREAS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AREAS;
  } catch {
    return DEFAULT_AREAS;
  }
}

export function saveStoredAreas(areas: Area[]): void {
  try {
    localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(areas));
  } catch (err) {
    console.error('Failed to save areas:', err);
  }
}

export function loadStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects:', err);
  }
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function checkDueDate(dateString?: string): { isToday: boolean; isOverdue: boolean; label: string } {
  if (!dateString) return { isToday: false, isOverdue: false, label: '' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { isToday: true, isOverdue: false, label: 'Today' };
  if (diffDays === 1) return { isToday: false, isOverdue: false, label: 'Tomorrow' };
  if (diffDays === -1) return { isToday: false, isOverdue: true, label: 'Yesterday' };
  if (diffDays < -1) return { isToday: false, isOverdue: true, label: `${Math.abs(diffDays)}d overdue` };
  if (diffDays <= 7) return { isToday: false, isOverdue: false, label: `In ${diffDays}d` };

  return {
    isToday: false,
    isOverdue: false,
    label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  };
}

export function exportTasksJSON(tasks: Task[]): void {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `things-omnisticky-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksMarkdown(tasks: Task[], areas: Area[], projects: Project[]): void {
  let md = `# OmniSticky (Things 3 Edition) Export\nExported: ${new Date().toLocaleDateString()}\nTotal Tasks: ${tasks.length}\n\n`;

  tasks.forEach((task, idx) => {
    const area = areas.find(a => a.id === task.areaId);
    const proj = projects.find(p => p.id === task.projectId);

    md += `## ${idx + 1}. [${task.status === 'done' ? 'x' : ' '}] ${task.title}\n`;
    md += `**Section:** ${task.section.toUpperCase()} ${task.isThisEvening ? '(This Evening)' : ''}\n`;
    if (area) md += `**Area:** ${area.emoji} ${area.name} | `;
    if (proj) md += `**Project:** ${proj.title} | `;
    md += `**Priority:** ${task.priority.toUpperCase()}\n`;
    if (task.dueDate) md += `**Due:** ${task.dueDate}\n`;
    if (task.timeSpentSeconds > 0) md += `**Focus Time:** ${formatDuration(task.timeSpentSeconds)}\n`;
    if (task.contextUrl) md += `**Link:** ${task.contextUrl}\n`;

    if (task.notes) {
      md += `\n${task.notes}\n`;
    }

    if (task.checklists.length > 0) {
      md += `\n### Checklists:\n`;
      task.checklists.forEach(c => {
        md += `- [${c.completed ? 'x' : ' '}] ${c.text}\n`;
      });
    }

    md += `\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `things-omnisticky-export-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

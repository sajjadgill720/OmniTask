import { safeStorage, protectStorageKey } from './safeStorage';
import { parseLocalDate } from './dates';
import { Task, Area, Project, CanvasElement, CanvasConnection } from '../types';

const TASKS_STORAGE_KEY = 'omnisticky_tasks_v2';
const AREAS_STORAGE_KEY = 'omnisticky_areas_v2';
const PROJECTS_STORAGE_KEY = 'omnisticky_projects_v2';
const CANVAS_ELEMENTS_STORAGE_KEY = 'omnisticky_canvas_elements_v1';
const CANVAS_CONNECTIONS_STORAGE_KEY = 'omnisticky_canvas_connections_v1';
export const WORKSPACE_STORAGE_KEY = 'omnisticky_workspace_v1';
const fields: Record<string, string> = {
  [TASKS_STORAGE_KEY]: 'tasks', [AREAS_STORAGE_KEY]: 'areas', [PROJECTS_STORAGE_KEY]: 'projects',
  [CANVAS_ELEMENTS_STORAGE_KEY]: 'canvasElements', [CANVAS_CONNECTIONS_STORAGE_KEY]: 'canvasConnections',
};

// A single write commits all related collections, preventing a partial restore.
export function saveStoredWorkspace(workspace: { tasks: Task[]; areas: Area[]; projects: Project[]; canvasElements: CanvasElement[]; canvasConnections: CanvasConnection[] }): boolean {
  const portable = { ...workspace, canvasElements: workspace.canvasElements.map(el => el.imageStorageId ? { ...el, imageUrl: el.thumbnailUrl || '' } : el) };
  return safeStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(portable));
}

export const DEFAULT_AREAS: Area[] = [
  { id: 'area_work', name: 'Work & Projects', emoji: '💼', colorHex: '#3b82f6' },
  { id: 'area_personal', name: 'Personal Life', emoji: '🌱', colorHex: '#10b981' },
  { id: 'area_study', name: 'Learning & Growth', emoji: '📚', colorHex: '#f59e0b' },
];

export const DEFAULT_TASKS: Task[] = ['Write down your first idea', 'Choose one task to focus on', 'Explore your new workspace'].map((title, index) => ({
  id: `sample_${index}`, title, notes: 'This is a sample note. Edit it or delete it to make this workspace yours.',
  tags: ['Sample'], checklists: [], section: 'today', priority: 'normal', status: 'todo',
  timeSpentSeconds: 0, isTimerRunning: false, colorHex: ['#FFF380', '#B5EAD7', '#FF9AA2'][index],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}));

export function generateId(): string {
  return 'item_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

function loadCollection<T>(key: string, fallback: T[]): T[] {
  const strings = (record: any, names: string[]) => names.every(name => record[name] === undefined || typeof record[name] === 'string');
  const validRecord = (item: any) => {
    if (!item || typeof item.id !== 'string') return false;
    if (key === TASKS_STORAGE_KEY) return strings(item, ['title', 'notes', 'priority', 'section', 'dueDate', 'colorHex', 'paperColor', 'createdAt', 'updatedAt'])
      && (item.tags === undefined || (Array.isArray(item.tags) && item.tags.every(tag => typeof tag === 'string')))
      && (item.checklists === undefined || (Array.isArray(item.checklists) && item.checklists.every(c => c && typeof c.id === 'string' && typeof c.text === 'string')));
    if (key === AREAS_STORAGE_KEY) return typeof item.name === 'string' && typeof item.emoji === 'string' && typeof item.colorHex === 'string';
    if (key === PROJECTS_STORAGE_KEY) return typeof item.title === 'string' && strings(item, ['description', 'colorHex', 'areaId', 'dueDate']);
    if (key === CANVAS_ELEMENTS_STORAGE_KEY) return typeof item.title === 'string' && ['sticky', 'hub', 'photo', 'shape'].includes(item.type) && Number.isFinite(item.x) && Number.isFinite(item.y) && strings(item, ['caption', 'category', 'imageUrl', 'thumbnailUrl', 'imageStorageId']);
    return typeof item.fromId === 'string' && typeof item.toId === 'string' && ['curved', 'straight', 'dashed'].includes(item.style);
  };
  const snapshot = safeStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (snapshot !== null) {
    try {
      const parsed = JSON.parse(snapshot);
      const collection = parsed[fields[key]];
      if (!Array.isArray(collection) || !collection.every(validRecord)) throw new Error('Invalid workspace');
      return collection;
    } catch { protectStorageKey(WORKSPACE_STORAGE_KEY); return []; }
  }
  const raw = safeStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(validRecord)) throw new Error('Invalid collection');
    return parsed;
  } catch {
    protectStorageKey(key);
    protectStorageKey(WORKSPACE_STORAGE_KEY);
    return [];
  }
}
export function loadStoredTasks(): Task[] {
  return loadCollection<Task>(TASKS_STORAGE_KEY, []).map(t => ({
    ...t, tags: Array.isArray(t.tags) ? t.tags : [], checklists: Array.isArray(t.checklists) ? t.checklists : [],
    title: typeof t.title === 'string' ? t.title : 'Untitled note',
    status: ['todo', 'in_progress', 'done'].includes(t.status) ? t.status : 'todo',
    section: ['inbox', 'today', 'upcoming', 'anytime', 'someday', 'logbook'].includes(t.section) ? t.section : 'inbox', priority: ['urgent', 'high', 'normal', 'low'].includes(t.priority) ? t.priority : 'normal',
    timeSpentSeconds: Number.isFinite(t.timeSpentSeconds) ? t.timeSpentSeconds : 0,
    isTimerRunning: false,
  }));
}
export function saveStoredTasks(tasks: Task[]) { safeStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)); }
export function loadStoredAreas(): Area[] { return loadCollection(AREAS_STORAGE_KEY, DEFAULT_AREAS); }
export function saveStoredAreas(areas: Area[]) { safeStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(areas)); }
export function loadStoredProjects(): Project[] { return loadCollection(PROJECTS_STORAGE_KEY, []); }
export function saveStoredProjects(projects: Project[]) { safeStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects)); }

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0m';
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

  const due = parseLocalDate(dateString);
  if (!Number.isFinite(due.getTime())) return { isToday: false, isOverdue: false, label: '' };
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

export function exportTasksMarkdown(tasks: Task[], areas: Area[], projects: Project[]): void {
  let md = `# Omni Sticky Export\nExported: ${new Date().toLocaleDateString()}\nTotal Tasks: ${tasks.length}\n\n`;

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
  a.download = `omnisticky-export-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function loadStoredCanvasElements(): CanvasElement[] { return loadCollection(CANVAS_ELEMENTS_STORAGE_KEY, []); }
export function saveStoredCanvasElements(elements: CanvasElement[]) {
  // Blob URLs are temporary. IndexedDB owns uploaded images; keep the thumbnail as fallback.
  const portable = elements.map(el => el.imageStorageId && el.imageUrl?.startsWith('blob:') ? { ...el, imageUrl: el.thumbnailUrl || '' } : el);
  safeStorage.setItem(CANVAS_ELEMENTS_STORAGE_KEY, JSON.stringify(portable));
}
export function loadStoredCanvasConnections(): CanvasConnection[] { return loadCollection(CANVAS_CONNECTIONS_STORAGE_KEY, []); }
export function saveStoredCanvasConnections(connections: CanvasConnection[]) { safeStorage.setItem(CANVAS_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections)); }

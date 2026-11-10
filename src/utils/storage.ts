import { Task, Area, Project, CanvasElement, CanvasConnection } from '../types';

const TASKS_STORAGE_KEY = 'omnisticky_tasks_v2';
const AREAS_STORAGE_KEY = 'omnisticky_areas_v2';
const PROJECTS_STORAGE_KEY = 'omnisticky_projects_v2';
const CANVAS_ELEMENTS_STORAGE_KEY = 'omnisticky_canvas_elements_v1';
const CANVAS_CONNECTIONS_STORAGE_KEY = 'omnisticky_canvas_connections_v1';

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
    colorHex: '#FFF380',
    paperColor: '#FFF380',
    shape: 'square',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    rotation: -1.5,
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_sage_focus',
    title: 'Deep focus on core essentials',
    notes: 'Eliminate friction, quiet distractions, and build with clarity.',
    checklists: [
      { id: 'cs1', text: 'Clean horizontal rules', completed: true },
      { id: 'cs2', text: 'Serene sage green paper', completed: true },
      { id: 'cs3', text: 'Choose from 5 tactile note shapes', completed: false },
    ],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    priority: 'normal',
    status: 'todo',
    tags: ['Mindset', 'Sage'],
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    colorHex: '#A8C3B2',
    paperColor: '#A8C3B2',
    shape: 'wide',
    lineStyle: 'lines',
    pinStyle: 'adhesive',
    rotation: 1.2,
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
    colorHex: '#B5EAD7',
    paperColor: '#B5EAD7',
    lineStyle: 'dots',
    pinStyle: 'tape',
    rotation: 1.8,
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
    colorHex: '#E6CCB2',
    paperColor: '#E6CCB2',
    lineStyle: 'grid',
    pinStyle: 'adhesive',
    rotation: -0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_reteco',
    title: 'Finish RETECO paper summary',
    notes: 'Draft executive abstract and synthesize comparative benchmark results.',
    checklists: [
      { id: 'rc1', text: 'Analyze retrieval efficiency', completed: true },
      { id: 'rc2', text: 'Document latency metrics', completed: false },
    ],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    priority: 'high',
    status: 'todo',
    tags: ['Research'],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    colorHex: '#FF9AA2',
    paperColor: '#FF9AA2',
    shape: 'square',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: -1.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_cs417',
    title: 'Prepare for CS417 LLMs exam',
    notes: 'Attention heads, RoPE embeddings, KV cache optimizations.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_study',
    priority: 'urgent',
    status: 'todo',
    tags: ['Study'],
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    colorHex: '#FFF380',
    paperColor: '#FFF380',
    shape: 'square',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: 1.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_demoflow',
    title: 'Build DemoFlow v2.0',
    notes: 'Clean reactive canvas transitions and audio cues.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    priority: 'normal',
    status: 'todo',
    tags: ['Project'],
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    timeSpentSeconds: 0,
    isTimerRunning: false,
    colorHex: '#C7CEEA',
    paperColor: '#C7CEEA',
    shape: 'wide',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    rotation: -1.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_portfolio',
    title: 'Update portfolio with new projects',
    notes: 'Include interactive live previews and architecture breakdowns.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_personal',
    priority: 'normal',
    status: 'in_progress',
    tags: ['Personal'],
    dueDate: new Date().toISOString().split('T')[0],
    timeSpentSeconds: 1200,
    isTimerRunning: false,
    colorHex: '#B5EAD7',
    paperColor: '#B5EAD7',
    shape: 'wide',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: 0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_eval',
    title: 'Research LLM evaluation methods',
    notes: 'Automated judge frameworks, win-rate benchmarking, rubric matrices.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    priority: 'high',
    status: 'in_progress',
    tags: ['Research'],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSpentSeconds: 900,
    isTimerRunning: false,
    colorHex: '#C7CEEA',
    paperColor: '#C7CEEA',
    shape: 'square',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    rotation: -1.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_gym',
    title: 'Gym dashboard UI improvements',
    notes: 'Refactor chart components and add dark glassmorphic panels.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_personal',
    priority: 'normal',
    status: 'done',
    tags: ['Design'],
    timeSpentSeconds: 1800,
    isTimerRunning: false,
    colorHex: '#D9F99D',
    paperColor: '#D9F99D',
    shape: 'square',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: 1.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_langgraph',
    title: 'Setup LangGraph agents',
    notes: 'Multi-agent state graph with conditional routing checkpoints.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_work',
    priority: 'high',
    status: 'done',
    tags: ['AI'],
    timeSpentSeconds: 2400,
    isTimerRunning: false,
    colorHex: '#FF9AA2',
    paperColor: '#FF9AA2',
    shape: 'square',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: -1.4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_email',
    title: 'Email professor (Shaif Chowdhury)',
    notes: 'Send draft thesis proposal and confirm schedule for weekly 1:1.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_study',
    priority: 'normal',
    status: 'done',
    tags: ['Academic'],
    timeSpentSeconds: 600,
    isTimerRunning: false,
    colorHex: '#FFF380',
    paperColor: '#FFF380',
    shape: 'square',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    rotation: 1.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't_bart',
    title: 'Read BART paper',
    notes: 'Sequence-to-sequence pre-training for language generation.',
    checklists: [],
    section: 'today',
    isThisEvening: false,
    areaId: 'area_study',
    priority: 'normal',
    status: 'done',
    tags: ['Research'],
    timeSpentSeconds: 1500,
    isTimerRunning: false,
    colorHex: '#E9D5FF',
    paperColor: '#E9D5FF',
    shape: 'square',
    lineStyle: 'lines',
    pinStyle: 'pin',
    rotation: -1.0,
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
    
    // Ensure the reference photo notes are present without overwriting user data
    const hasReteco = parsed.some((t: Task) => t.id === 't_reteco');
    const baseList = !hasReteco 
      ? [...parsed, ...DEFAULT_TASKS.filter(d => !parsed.some((p: Task) => p.id === d.id))] 
      : parsed;

    return baseList.map((t: Task, idx: number) => {
      const angleOffsets = [-1.5, 1.8, -0.9, 2.1, -1.8, 1.2, -2.2, 1.6];
      const defaultAngle = angleOffsets[idx % angleOffsets.length];
      return {
        ...t,
        paperColor: t.paperColor || t.colorHex || '#FFF380',
        shape: t.shape || 'square',
        lineStyle: t.lineStyle || 'ruled',
        pinStyle: t.pinStyle || (t.isPinned ? 'pin' : t.status === 'in_progress' ? 'tape' : 'adhesive'),
        rotation: t.rotation !== undefined ? t.rotation : defaultAngle,
      };
    });
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

export const DEFAULT_CANVAS_ELEMENTS: CanvasElement[] = [
  {
    id: 'hub_main',
    type: 'hub',
    title: 'Knovera\nVision',
    category: 'Mission',
    x: 440,
    y: 220,
    width: 144,
    height: 96,
    rotation: 0,
    colorHex: '#F8D979',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_ai',
    type: 'sticky',
    title: 'AI Powered\nProductivity',
    category: 'Feature',
    x: 170,
    y: 90,
    width: 130,
    height: 130,
    rotation: -2,
    colorHex: '#F8D979',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_gamified',
    type: 'sticky',
    title: 'Gamified\nLearning',
    category: 'Feature',
    x: 440,
    y: 50,
    width: 130,
    height: 130,
    rotation: 1.5,
    colorHex: '#F1A6A6',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_growth',
    type: 'sticky',
    title: 'Personal\nGrowth',
    category: 'Goal',
    x: 710,
    y: 80,
    width: 130,
    height: 130,
    rotation: -1.2,
    colorHex: '#C6DF9C',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_financial',
    type: 'sticky',
    title: 'Financial\nLiteracy',
    category: 'Goal',
    x: 180,
    y: 350,
    width: 130,
    height: 130,
    rotation: 2.2,
    colorHex: '#D7B7EE',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_impact',
    type: 'sticky',
    title: 'Global\nImpact',
    category: 'Goal',
    x: 450,
    y: 400,
    width: 130,
    height: 130,
    rotation: -1.8,
    colorHex: '#A9C9E9',
    lineStyle: 'ruled',
    pinStyle: 'pin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'polaroid_mountains',
    type: 'photo',
    title: 'Aspiration 2026',
    caption: 'Aspiration 2026',
    x: 720,
    y: 270,
    width: 140,
    height: 175,
    rotation: 2.8,
    colorHex: '#ffffff',
    pinStyle: 'tape',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CANVAS_CONNECTIONS: CanvasConnection[] = [
  { id: 'c1', fromId: 'hub_main', toId: 'node_ai', style: 'curved' },
  { id: 'c2', fromId: 'hub_main', toId: 'node_gamified', style: 'curved' },
  { id: 'c3', fromId: 'hub_main', toId: 'node_growth', style: 'curved' },
  { id: 'c4', fromId: 'hub_main', toId: 'node_financial', style: 'curved' },
  { id: 'c5', fromId: 'hub_main', toId: 'node_impact', style: 'curved' },
  { id: 'c6', fromId: 'hub_main', toId: 'polaroid_mountains', style: 'dashed' },
];

export function loadStoredCanvasElements(): CanvasElement[] {
  try {
    const raw = localStorage.getItem(CANVAS_ELEMENTS_STORAGE_KEY);
    if (!raw) return DEFAULT_CANVAS_ELEMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CANVAS_ELEMENTS;
  } catch (err) {
    console.error('Failed to load canvas elements from localStorage:', err);
    return DEFAULT_CANVAS_ELEMENTS;
  }
}

export function saveStoredCanvasElements(elements: CanvasElement[]): void {
  try {
    // Exclude full-resolution dataUrls from localStorage to avoid quota limits
    const sanitized = elements.map(el => {
      if (el.imageUrl && el.imageUrl.startsWith('data:') && el.imageUrl.length > 50000) {
        return { ...el, imageUrl: el.thumbnailUrl || '' };
      }
      return el;
    });
    localStorage.setItem(CANVAS_ELEMENTS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save canvas elements to localStorage:', err);
  }
}

export function loadStoredCanvasConnections(): CanvasConnection[] {
  try {
    const raw = localStorage.getItem(CANVAS_CONNECTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_CANVAS_CONNECTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CANVAS_CONNECTIONS;
  } catch (err) {
    console.error('Failed to load canvas connections from localStorage:', err);
    return DEFAULT_CANVAS_CONNECTIONS;
  }
}

export function saveStoredCanvasConnections(connections: CanvasConnection[]): void {
  try {
    localStorage.setItem(CANVAS_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
  } catch (err) {
    console.error('Failed to save canvas connections to localStorage:', err);
  }
}


export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export type Status = 'todo' | 'in_progress' | 'done';

export type ThingsSection = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook';

export type ViewMode = 'focus' | 'board' | 'canvas' | 'connections' | 'analytics' | 'projects' | 'sticky_wall' | 'canvas_3d' | 'network_3d' | 'kanban' | 'things_list';

export type DensityMode = 'comfortable' | 'compact';

export type ThemeMode = 'light' | 'dark';

export type LineStyle = 'blank' | 'ruled' | 'lines' | 'grid' | 'dots' | 'stencil';

export type NoteShape = 'square' | 'wide' | 'tall' | 'round' | 'tabbed';

export type PinStyle = 'auto' | 'pin' | 'tape' | 'adhesive';

export type WallTexture = 'cork' | 'plaster' | 'pegboard';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Area {
  id: string;
  name: string;
  emoji: string;
  colorHex: string;
}

export interface Project {
  id: string;
  areaId?: string;
  title: string;
  description?: string;
  colorHex: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  checklists: ChecklistItem[];
  section: ThingsSection;
  isThisEvening?: boolean; // Things 3 iconic "This Evening" separator
  projectId?: string;
  areaId?: string;
  priority: Priority;
  status: Status;
  tags: string[];
  dueDate?: string; // YYYY-MM-DD
  reminderTime?: string; // HH:mm
  timeSpentSeconds: number; // Stopwatch focus tracking
  isTimerRunning: boolean;
  contextUrl?: string; // Anchored website/doc link
  colorHex?: string;
  paperColor?: string; // Authentic Post-it palette: #FFF380, #A8C3B2, #FF9AA2, #B5EAD7, #C7CEEA, #E6CCB2, #2B2B2B
  shape?: NoteShape; // square | wide | tall | round | tabbed
  lineStyle?: LineStyle; // blank | ruled | lines | grid | dots | stencil
  pinStyle?: PinStyle; // auto | pin | tape | adhesive
  rotation?: number; // Deterministic natural imperfection angle in degrees (-2.5 to +2.5)
  inkType?: 'auto' | 'ballpoint_blue' | 'black' | 'white' | 'red'; // HCI contrast-compliant ink
  isPinned?: boolean; // Google Keep & Notezilla pinning
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppPermissionsState {
  notifications: NotificationPermission;
  audioEnabled: boolean;
  persistentStorage: boolean;
  badgingSupported: boolean;
}

export type WidgetType = 'today_focus' | 'standby_clock' | 'pomodoro' | 'sticky_pad';

export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime';

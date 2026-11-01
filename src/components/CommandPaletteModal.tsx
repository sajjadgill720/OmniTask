import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Target, 
  Columns3, 
  LayoutGrid, 
  Network, 
  Plus, 
  Sun, 
  Moon, 
  Settings, 
  CheckCircle2, 
  Folder, 
  Star, 
  Inbox, 
  Calendar, 
  Compass, 
  Archive,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Task, Project, ThingsSection, ViewMode } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onNavigateSection: (section: ThingsSection) => void;
  onNavigateProject: (projectId: string) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenNewNote: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

interface CommandItem {
  id: string;
  title: string;
  category: 'views' | 'sections' | 'tasks' | 'actions' | 'projects';
  icon: React.FC<{ className?: string }>;
  detail?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  onSelectTask,
  onNavigateSection,
  onNavigateProject,
  onChangeViewMode,
  onOpenNewNote,
  onOpenSettings,
  onToggleTheme,
  theme,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Construct search items
  const items: CommandItem[] = [];

  // Primary Actions
  items.push({
    id: 'act_new_note',
    title: 'New note',
    category: 'actions',
    icon: Plus,
    detail: 'Create a fresh sticky note',
    action: () => {
      onClose();
      onOpenNewNote();
    },
  });

  // Views
  items.push(
    {
      id: 'view_focus',
      title: 'Go to Focus View',
      category: 'views',
      icon: Target,
      detail: 'Default daily execution',
      action: () => {
        onChangeViewMode('focus');
        onClose();
      },
    },
    {
      id: 'view_board',
      title: 'Go to Board View',
      category: 'views',
      icon: Columns3,
      detail: 'Kanban columns',
      action: () => {
        onChangeViewMode('board');
        onClose();
      },
    },
    {
      id: 'view_canvas',
      title: 'Go to Canvas View',
      category: 'views',
      icon: LayoutGrid,
      detail: 'Freeform visual board',
      action: () => {
        onChangeViewMode('canvas');
        onClose();
      },
    },
    {
      id: 'view_connections',
      title: 'Go to Connections Graph',
      category: 'views',
      icon: Network,
      detail: 'Interactive 3D network',
      action: () => {
        onChangeViewMode('connections');
        onClose();
      },
    }
  );

  // Sections
  items.push(
    {
      id: 'sec_today',
      title: 'Open Today',
      category: 'sections',
      icon: Star,
      action: () => {
        onNavigateSection('today');
        onClose();
      },
    },
    {
      id: 'sec_inbox',
      title: 'Open Inbox',
      category: 'sections',
      icon: Inbox,
      action: () => {
        onNavigateSection('inbox');
        onClose();
      },
    },
    {
      id: 'sec_upcoming',
      title: 'Open Upcoming',
      category: 'sections',
      icon: Calendar,
      action: () => {
        onNavigateSection('upcoming');
        onClose();
      },
    },
    {
      id: 'sec_logbook',
      title: 'Open Logbook',
      category: 'sections',
      icon: CheckCircle2,
      detail: 'Completed task history',
      action: () => {
        onNavigateSection('logbook');
        onClose();
      },
    }
  );

  // General utilities
  items.push(
    {
      id: 'act_theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'actions',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'act_settings',
      title: 'Open Settings',
      category: 'actions',
      icon: Settings,
      detail: 'Preferences, audio, backups',
      action: () => {
        onClose();
        onOpenSettings();
      },
    }
  );

  // Projects
  projects.forEach(p => {
    items.push({
      id: `proj_${p.id}`,
      title: `Project: ${p.title}`,
      category: 'projects',
      icon: Folder,
      detail: 'Filter to project',
      action: () => {
        onNavigateProject(p.id);
        onClose();
      },
    });
  });

  // Matching Tasks
  if (query.trim()) {
    const q = query.toLowerCase();
    tasks
      .filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)))
      .slice(0, 8)
      .forEach(t => {
        items.push({
          id: `task_${t.id}`,
          title: t.title,
          category: 'tasks',
          icon: CheckCircle2,
          detail: t.dueDate ? `Due ${t.dueDate}` : 'Task note',
          action: () => {
            onClose();
            onSelectTask(t);
          },
        });
      });
  }

  // Filter items
  const filtered = query.trim()
    ? items.filter(
        i =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.detail && i.detail.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#14161f] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/10">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, jump to view, or type an action..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono font-bold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or notes found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.detail && (
                    <span className={`text-[10px] truncate ml-2 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.detail}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Navigate with ↑ ↓ • Press Enter to run</span>
          <span>OmniSticky Palette</span>
        </div>
      </div>
    </div>
  );
};

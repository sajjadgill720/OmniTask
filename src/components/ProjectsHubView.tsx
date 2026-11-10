import React from 'react';
import { Folder, Plus, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Project, Task, Area } from '../types';

interface ProjectsHubViewProps {
  projects: Project[];
  tasks: Task[];
  areas: Area[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const ProjectsHubView: React.FC<ProjectsHubViewProps> = ({
  projects,
  tasks,
  areas,
  onSelectProject,
  onOpenNewProject,
}) => {
  // Curated project aesthetic photos matching the reference mockup
  const projectPhotos: Record<string, string> = {
    proj_launch: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    proj_fitness: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60',
    default_work: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60',
    default_growth: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
    default_wellness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 select-none space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-300/60 dark:border-white/10 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight drop-shadow-xs">
            Projects
          </h1>
          <p className="text-xs text-stone-600 dark:text-white/60 font-medium">
            Organize. Build. Grow.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Visual Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {projects.map((proj, idx) => {
          const projTasks = tasks.filter(t => t.projectId === proj.id);
          const doneTasks = projTasks.filter(t => t.status === 'done');
          const totalCount = projTasks.length || 1;
          const progressPercent = Math.round((doneTasks.length / totalCount) * 100);

          const fallbackPhotos = [
            projectPhotos.default_work,
            projectPhotos.default_growth,
            projectPhotos.default_wellness,
            projectPhotos.proj_launch,
          ];
          const photoUrl = projectPhotos[proj.id] || fallbackPhotos[idx % fallbackPhotos.length];

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group p-3.5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl hover:bg-black/55 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
            >
              {/* Photo Thumbnail */}
              <div className="w-full h-32 rounded-2xl overflow-hidden bg-stone-800 mb-3 shadow-inner relative">
                <img 
                  src={photoUrl} 
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span 
                  className="absolute bottom-2 left-2.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md backdrop-blur-md"
                  style={{ backgroundColor: `${proj.colorHex}dd`, color: '#ffffff' }}
                >
                  {proj.title}
                </span>
              </div>

              {/* Title & Stats */}
              <div>
                <h3 className="text-sm font-bold text-white truncate mb-1">
                  {proj.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
                  <span>{projTasks.length} tasks</span>
                  <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: proj.colorHex || '#10b981'
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 group-hover:text-amber-300 transition">
                <span>View workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Feed */}
      <div className="p-5 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Recent Activity</span>
          </h3>
          <span className="text-[10px] text-white/50 font-mono">Live log ({tasks.length} total)</span>
        </div>

        <div className="space-y-2.5 text-xs">
          {tasks.slice(0, 4).map((task, idx) => {
            const isDone = task.status === 'done';
            const isInProgress = task.status === 'in_progress';
            const proj = projects.find(p => p.id === task.projectId);
            const timeLabels = ['Just now', '12m ago', '45m ago', '2h ago'];

            return (
              <div 
                key={task.id}
                onClick={() => task.projectId && onSelectProject(task.projectId)}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                title={task.projectId ? `Jump to ${proj?.title || 'project'}` : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isDone ? 'bg-emerald-400' : isInProgress ? 'bg-blue-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-white/90 truncate">
                    <span className="font-semibold text-white/60 mr-1.5">
                      {isDone ? 'Completed' : isInProgress ? 'Working on' : 'Pinned'}
                    </span>
                    <span className="font-bold">{task.title}</span>
                    {proj && (
                      <span className="text-white/40 ml-1.5 font-normal">
                        in {proj.title}
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono shrink-0 ml-2">
                  {timeLabels[idx % timeLabels.length]}
                </span>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <p className="text-xs text-white/40 text-center py-2">
              No recent task activity recorded yet.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};


import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Project, Task, Area } from '../types';

interface ProjectsHubViewProps {
  projects: Project[];
  tasks: Task[];
  areas: Area[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

/**
 * ProjectsHubView
 * Large frosted glass workspace matching Image 4 reference:
 * - Header: All Projects v dropdown + "+ New Project" button
 * - 3 Large Project Cards with banner photography & gold progress bars:
 *   1. Work & Projects (12 tasks - 62%)
 *   2. Learning & Growth (8 tasks - 75%)
 *   3. Health & Wellness (6 tasks - 83%)
 */
export const ProjectsHubView: React.FC<ProjectsHubViewProps> = ({
  projects,
  tasks,
  onSelectProject,
  onOpenNewProject,
}) => {
  // Curated project photography matching Image 4
  const curatedPhotos: Record<string, string> = {
    proj_launch: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    proj_fitness: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    default_work: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    default_growth: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    default_wellness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
  };

  const defaultProjectsDisplay = [
    {
      id: projects[0]?.id || 'p_work',
      title: 'Work & Projects',
      tasksCount: 12,
      percent: 62,
      photo: curatedPhotos.default_work,
    },
    {
      id: projects[1]?.id || 'p_growth',
      title: 'Learning & Growth',
      tasksCount: 8,
      percent: 75,
      photo: curatedPhotos.default_growth,
    },
    {
      id: projects[2]?.id || 'p_wellness',
      title: 'Health & Wellness',
      tasksCount: 6,
      percent: 83,
      photo: curatedPhotos.default_wellness,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 select-none">
      
      {/* Translucent Frosted Glass Panel Container matching Image 4 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/45 dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-2xl">
        
        {/* Top Action Row: All Projects v + New Project Button */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 cursor-pointer group">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              All Projects
            </h2>
            <ChevronDown className="w-5 h-5 text-stone-700 dark:text-white/70 group-hover:translate-y-0.5 transition-transform" />
          </div>

          <button
            type="button"
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/25 dark:bg-white/15 hover:bg-black/35 dark:hover:bg-white/25 text-stone-900 dark:text-white font-bold text-xs shadow-sm transition cursor-pointer backdrop-blur-md border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* 3 Large Project Cards matching Image 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultProjectsDisplay.map((proj) => {
            const liveProj = projects.find(p => p.id === proj.id) || projects.find(p => p.title.toLowerCase().includes(proj.title.toLowerCase()));
            const projTasks = liveProj ? tasks.filter(t => t.projectId === liveProj.id) : [];
            const doneTasks = projTasks.filter(t => t.status === 'done');
            const totalTasks = projTasks.length > 0 ? projTasks.length : proj.tasksCount;
            const progress = projTasks.length > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : proj.percent;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(liveProj?.id || proj.id)}
                className="group p-4 rounded-3xl bg-white/70 dark:bg-black/45 backdrop-blur-xl border border-white/50 dark:border-white/15 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
              >
                {/* Visual Banner Photo */}
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 mb-4 shadow-sm relative">
                  <img 
                    src={proj.photo} 
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Title & Task Progress */}
                <div className="space-y-3">
                  <h3 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                    {proj.title}
                  </h3>

                  <div className="text-xs font-semibold text-stone-600 dark:text-white/70 font-mono">
                    {totalTasks} tasks - {progress}%
                  </div>

                  {/* Gold Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-white/15 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

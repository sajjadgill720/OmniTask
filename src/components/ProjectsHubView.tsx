import React from 'react';
import { Folder, Plus } from 'lucide-react';
import type { Project, Task, Area } from '../types';
interface ProjectsHubViewProps {
  projects: Project[]; tasks: Task[]; areas: Area[];
  onSelectProject: (id: string) => void; onOpenNewProject: () => void;
}
export function ProjectsHubView({ projects, tasks, areas, onSelectProject, onOpenNewProject }: ProjectsHubViewProps) {
  return <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4">
    <div className="rounded-3xl bg-white/75 dark:bg-stone-950/75 border border-white/40 p-5 sm:p-8 shadow-xl">
      <header className="flex flex-wrap gap-3 items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Your projects</h1><p className="text-sm text-stone-600 dark:text-stone-300 mt-1">Keep related notes and next steps together.</p></div><button onClick={onOpenNewProject} className="launch-button"><Plus size={16} />New Project</button></header>
      {projects.length === 0 ? <div className="text-center py-12 border border-dashed border-stone-400 rounded-2xl"><Folder className="mx-auto mb-3 text-amber-700" /><h2 className="font-bold">Room for your first project</h2><p className="text-sm text-stone-600 dark:text-stone-300 mt-2 mb-4">Start with a goal, a class, or an idea you want to move forward.</p><button className="launch-button" onClick={onOpenNewProject}>Create a project</button></div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{projects.map(project => {
        const related = tasks.filter(t => t.projectId === project.id);
        const done = related.filter(t => t.status === 'done').length;
        const progress = related.length ? Math.round(done / related.length * 100) : 0;
        const area = areas.find(a => a.id === project.areaId);
        return <button key={project.id} onClick={() => onSelectProject(project.id)} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-left p-5 hover:shadow-lg transition">
          <div className="rounded-xl h-20 flex items-center p-4 mb-4" style={{ backgroundColor: project.colorHex || '#e6c78b' }}><Folder size={32} className="text-white drop-shadow" /></div>
          <h2 className="font-bold text-lg break-words">{project.title}</h2><p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{area ? `${area.emoji} ${area.name}` : 'Independent project'}</p>
          <p className="text-sm mt-4 mb-2">{done} of {related.length} notes complete · {progress}%</p><div className="h-2 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${progress}%` }} /></div>
        </button>;
      })}</div>}
    </div>
  </section>;
}

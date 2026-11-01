import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Network, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Search, 
  Folder, 
  Tag, 
  CheckCircle2, 
  Check,
  Clock, 
  ExternalLink, 
  Plus, 
  Eye, 
  Filter,
  Sparkles,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { Task, Project } from '../types';
import { getPostitPaperStyle } from '../utils/colorUtils';
import { formatDuration, checkDueDate } from '../utils/storage';
import { RedPushPin } from './RedPushPin';
import confetti from 'canvas-confetti';

interface NetworkGraph3DViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onToggleTimer?: (id: string) => void;
  onUpdateTask?: (task: Task) => void;
  onQuickAdd: () => void;
}

interface Node3D {
  id: string;
  label: string;
  type: 'task' | 'project' | 'tag';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  task?: Task;
  project?: Project;
}

interface Edge3D {
  sourceId: string;
  targetId: string;
  color: string;
}

export const NetworkGraph3DView: React.FC<NetworkGraph3DViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onToggleComplete,
  onToggleTimer,
  onUpdateTask,
  onQuickAdd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [popTilt, setPopTilt] = useState({ x: 0, y: 0 });

  // 3D Camera Angles
  const rotX = useRef(0.2);
  const rotY = useRef(0.3);
  const zoom = useRef(1.0);
  const isDragging = useRef(false);
  const lastMouse = useRef<{ x: number; y: number } | null>(null);

  // Generate 3D Nodes and Edges from Tasks, Projects, and Tags
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node3D[] = [];
    const edgeList: Edge3D[] = [];

    // Filter tasks if project selected
    const activeTasks = tasks.filter(t => {
      if (filterProject !== 'all' && t.projectId !== filterProject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.tags.some(tg => tg.toLowerCase().includes(q));
      }
      return true;
    });

    // 1. Project Anchor Nodes
    const activeProjectIds = new Set(activeTasks.map(t => t.projectId).filter(Boolean));
    const activeProjects = projects.filter(p => activeProjectIds.has(p.id));

    activeProjects.forEach((proj, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / Math.max(1, activeProjects.length));
      const theta = Math.sqrt(activeProjects.length * Math.PI) * phi;
      const radius = 240;

      nodeList.push({
        id: `proj_${proj.id}`,
        label: proj.title,
        type: 'project',
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        vx: 0,
        vy: 0,
        vz: 0,
        radius: 14,
        color: proj.colorHex || '#3b82f6',
        project: proj,
      });
    });

    // 2. Task Nodes (Fibonacci sphere distribution around center or projects)
    activeTasks.forEach((task, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / Math.max(1, activeTasks.length));
      const theta = Math.sqrt(activeTasks.length * Math.PI) * phi;
      const radius = 170 + (idx % 3) * 45;

      const taskColor = task.colorHex || '#fef08a';

      const taskNode: Node3D = {
        id: `task_${task.id}`,
        label: task.title || 'Untitled',
        type: 'task',
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        vx: 0,
        vy: 0,
        vz: 0,
        radius: task.isPinned ? 12 : 9,
        color: taskColor,
        task,
      };

      nodeList.push(taskNode);

      // Link to Project
      if (task.projectId) {
        edgeList.push({
          sourceId: taskNode.id,
          targetId: `proj_${task.projectId}`,
          color: task.colorHex || '#3b82f6',
        });
      }
    });

    // 3. Connect tasks that share tags
    for (let i = 0; i < activeTasks.length; i++) {
      for (let j = i + 1; j < activeTasks.length; j++) {
        const shared = activeTasks[i].tags.filter(t => activeTasks[j].tags.includes(t));
        if (shared.length > 0) {
          edgeList.push({
            sourceId: `task_${activeTasks[i].id}`,
            targetId: `task_${activeTasks[j].id}`,
            color: 'rgba(148, 163, 184, 0.4)',
          });
        }
      }
    }

    return { nodes: nodeList, edges: edgeList };
  }, [tasks, projects, filterProject, searchQuery]);

  // Main 3D Rendering Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particleOffset = 0;

    const render = () => {
      particleOffset += 0.02;

      // Handle DPR for crisp HiDPI screens
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Auto rotation
      if (autoRotate && !isDragging.current && !selectedNode) {
        rotY.current += 0.003;
      }

      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);
      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);

      const fov = 500;

      // Project 3D coordinates to 2D screen
      const projectedNodes = nodes.map(node => {
        let x1 = node.x * cosY + node.z * sinY;
        let z1 = -node.x * sinY + node.z * cosY;

        let y2 = node.y * cosX - z1 * sinX;
        let z2 = node.y * sinX + z1 * cosX;

        const scale = (fov / (fov + z2)) * zoom.current;
        const x2d = cx + x1 * scale;
        const y2d = cy + y2 * scale;

        return {
          ...node,
          x2d,
          y2d,
          scale,
          zDepth: z2,
        };
      });

      // Sort by depth (painter's algorithm)
      projectedNodes.sort((a, b) => b.zDepth - a.zDepth);

      const nodeMap = new Map(projectedNodes.map(n => [n.id, n]));

      // 1. Draw 3D Edges
      edges.forEach(edge => {
        const s = nodeMap.get(edge.sourceId);
        const t = nodeMap.get(edge.targetId);
        if (!s || !t) return;

        if (s.scale <= 0 || t.scale <= 0) return;

        const isHovered = hoveredNode && (hoveredNode.id === s.id || hoveredNode.id === t.id);

        ctx.beginPath();
        ctx.moveTo(s.x2d, s.y2d);
        ctx.lineTo(t.x2d, t.y2d);
        ctx.strokeStyle = isHovered ? '#3b82f6' : edge.color;
        ctx.lineWidth = isHovered ? 2.5 : Math.max(0.6, 1.2 * s.scale);
        ctx.globalAlpha = isHovered ? 0.9 : Math.min(0.6, Math.max(0.12, s.scale * 0.45));
        ctx.stroke();

        // Energy Particle along connection
        const tProgress = (particleOffset + (s.x + t.y) * 0.01) % 1;
        const px = s.x2d + (t.x2d - s.x2d) * tProgress;
        const py = s.y2d + (t.y2d - s.y2d) * tProgress;

        ctx.beginPath();
        ctx.arc(px, py, 2 * s.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.globalAlpha = Math.min(1, s.scale * 0.8);
        ctx.fill();
      });

      // 2. Draw 3D Nodes
      projectedNodes.forEach(node => {
        if (node.scale <= 0) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const drawRadius = node.radius * node.scale * (isHovered || isSelected ? 1.3 : 1);

        ctx.globalAlpha = Math.min(1, Math.max(0.3, node.scale * 0.9));

        // Node Glow
        const grad = ctx.createRadialGradient(node.x2d, node.y2d, 0, node.x2d, node.y2d, drawRadius * 2);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, drawRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Node Label
        if (node.scale > 0.75 || isHovered || isSelected) {
          ctx.font = `${Math.round(11 * node.scale)}px sans-serif`;
          ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(
            node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label, 
            node.x2d, 
            node.y2d + drawRadius + 12 * node.scale
          );
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [nodes, edges, autoRotate, hoveredNode, selectedNode]);

  // Mouse drag interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging.current && lastMouse.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotY.current += dx * 0.006;
      rotX.current -= dy * 0.006;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover test
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const cx = width / 2;
    const cy = height / 2;

    const cosX = Math.cos(rotX.current);
    const sinX = Math.sin(rotX.current);
    const cosY = Math.cos(rotY.current);
    const sinY = Math.sin(rotY.current);

    let found: Node3D | null = null;
    let foundCoords: { x: number; y: number } | null = null;

    for (const node of nodes) {
      let x1 = node.x * cosY + node.z * sinY;
      let z1 = -node.x * sinY + node.z * cosY;
      let y2 = node.y * cosX - z1 * sinX;
      let z2 = node.y * sinX + z1 * cosX;

      const fov = 500;
      const scale = (fov / (fov + z2)) * zoom.current;
      const x2d = cx + x1 * scale;
      const y2d = cy + y2 * scale;

      const dist = Math.hypot(mx - x2d, my - y2d);
      if (dist < (node.radius * scale + 8)) {
        found = node;
        foundCoords = { x: x2d, y: y2d };
        break;
      }
    }

    setHoveredNode(found);
    setHoverCoords(foundCoords);
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    lastMouse.current = null;
    setHoveredNode(null);
    setHoverCoords(null);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    lastMouse.current = null;
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  const selectedTask = selectedNode?.task;
  const selectedPaper = selectedTask ? getPostitPaperStyle(selectedTask.colorHex || '#fef08a', selectedTask.inkType || 'auto') : null;
  const selectedDue = selectedTask ? checkDueDate(selectedTask.dueDate) : null;
  const selectedProject = selectedNode?.project || (selectedTask?.projectId ? projects.find(p => p.id === selectedTask.projectId) : undefined);

  const handleToggleChecklist = (itemId: string) => {
    if (!selectedTask || !onUpdateTask) return;
    const updated = selectedTask.checklists.map(c => 
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    onUpdateTask({ ...selectedTask, checklists: updated });
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    onToggleComplete(selectedTask.id);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 select-none font-sans">
      
      {/* 3D Network Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🕸️</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Connections — 3D Network
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {nodes.length} Nodes • {edges.length} Edges
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Click on any circle to pop up its sticky note in 3D • Drag to orbit the constellation
          </p>
        </div>

        {/* Controls Suite */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2 text-xs"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Auto Orbit Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              autoRotate
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400'
                : 'bg-white dark:bg-[#181a24] border-slate-200 dark:border-white/10 text-slate-500'
            }`}
            title={autoRotate ? 'Pause Auto-Orbit' : 'Resume Auto-Orbit'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Orbit</span>
          </button>

          {/* Zoom In / Out */}
          <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10">
            <button
              onClick={() => { zoom.current = Math.max(0.6, zoom.current - 0.15); }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-300 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { zoom.current = Math.min(2.0, zoom.current + 0.15); }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-300 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New note</span>
          </button>
        </div>
      </div>

      {/* 3D Network Canvas Container with Premium Studio / Cosmos Background */}
      <div 
        className="relative w-full h-[620px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#101728] to-[#070b14] border border-indigo-900/40 shadow-[0_25px_60px_-15px_rgba(2,6,23,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        
        {/* Ambient Cosmic Studio Lighting & Stardust Grid */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 70% 60% at 20% 15%, rgba(99, 102, 241, 0.16) 0%, transparent 65%),
              radial-gradient(ellipse 60% 50% at 80% 85%, rgba(139, 92, 246, 0.14) 0%, transparent 70%),
              radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px'
          }}
        />

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating Glassmorphic On-Hover Preview Card */}
        {hoveredNode && hoverCoords && !selectedNode && (
          <div 
            className="pointer-events-none absolute z-20 px-3.5 py-3 rounded-2xl bg-[#0f172a]/92 backdrop-blur-md border border-white/20 shadow-2xl text-white text-xs max-w-[270px] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1.5"
            style={{
              left: `${Math.min(Math.max(16, hoverCoords.x + 14), (canvasRef.current?.clientWidth || 600) - 280)}px`,
              top: `${Math.min(Math.max(16, hoverCoords.y - 36), (canvasRef.current?.clientHeight || 600) - 170)}px`,
            }}
          >
            {/* Header / Type badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
                {hoveredNode.type === 'task' ? 'Sticky Note' : hoveredNode.type === 'project' ? 'Project' : 'Tag'}
              </span>
              {hoveredNode.task?.priority === 'urgent' && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[9px]">
                  Urgent
                </span>
              )}
            </div>

            {/* Title */}
            <div className="font-bold text-sm text-slate-100 leading-snug line-clamp-2">
              {hoveredNode.label}
            </div>

            {/* Task specific metadata */}
            {hoveredNode.task && (
              <>
                {hoveredNode.task.checklists && hoveredNode.task.checklists.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {hoveredNode.task.checklists.filter(c => c.completed).length} of {hoveredNode.task.checklists.length} subtasks done
                    </span>
                  </div>
                )}

                {hoveredNode.task.dueDate && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-300">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Due {hoveredNode.task.dueDate}</span>
                  </div>
                )}

                {hoveredNode.task.tags && hoveredNode.task.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {hoveredNode.task.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Call to action hint */}
            <div className="pt-1 mt-0.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Click to pop up 3D note</span>
              <span className="text-amber-400 font-bold">🪐 3D</span>
            </div>
          </div>
        )}

        {/* 3D POP-UP STICKY NOTE MODAL OVER NODE */}
        {selectedNode && selectedTask && selectedPaper && (
          <div 
            onClick={() => setSelectedNode(null)}
            className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                setPopTilt({ x: -(y / (rect.height / 2)) * 8, y: (x / (rect.width / 2)) * 8 });
              }}
              onMouseLeave={() => setPopTilt({ x: 0, y: 0 })}
              style={{
                transform: `perspective(1000px) rotateX(${popTilt.x}deg) rotateY(${popTilt.y}deg) translateZ(40px) scale(1.02)`,
                transformStyle: 'preserve-3d',
                backgroundColor: selectedPaper.baseRgb,
                backgroundImage: `linear-gradient(145deg, ${selectedPaper.lightRgb} 0%, ${selectedPaper.baseRgb} 55%, ${selectedPaper.darkRgb} 100%)`,
                borderColor: selectedPaper.borderRgb,
                color: selectedPaper.inkColor,
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              }}
              className="relative w-full max-w-[360px] min-h-[350px] p-6 pt-9 rounded-2xl border transition-transform duration-100 ease-out flex flex-col justify-between animate-in zoom-in-90 duration-200 select-none shadow-2xl"
            >
              {/* 3D Red Pushpin Centered at Top */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <RedPushPin size={34} />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-current opacity-60 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Meta: Due Date & Project */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDue && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        selectedDue.isOverdue ? 'bg-red-500/20 text-red-700' : 'bg-black/5 dark:bg-white/10'
                      }`}>
                        {selectedDue.label}
                      </span>
                    )}
                    {selectedProject && (
                      <span className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProject.colorHex }} />
                        <span className="truncate max-w-[120px]">{selectedProject.title}</span>
                      </span>
                    )}
                  </div>

                  {/* Stopwatch Live Timer */}
                  {onToggleTimer && (
                    <button
                      onClick={() => onToggleTimer(selectedTask.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        selectedTask.isTimerRunning
                          ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                          : 'bg-black/10 dark:bg-white/15 hover:bg-black/15'
                      }`}
                      title={selectedTask.isTimerRunning ? 'Pause timer' : 'Start timer'}
                    >
                      {selectedTask.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                      <span className="font-mono text-[11px]">{formatDuration(selectedTask.timeSpentSeconds || 0)}</span>
                    </button>
                  )}
                </div>

                {/* Title & Body */}
                <h3 
                  className="text-lg sm:text-xl font-bold tracking-tight leading-snug mb-2 font-display"
                  style={{ fontFamily: "'Caveat', 'Segoe Print', cursive, sans-serif" }}
                >
                  {selectedTask.title}
                </h3>

                {selectedTask.notes && (
                  <p className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap mb-3 font-sans">
                    {selectedTask.notes}
                  </p>
                )}

                {/* Checklists */}
                {selectedTask.checklists.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5">
                    {selectedTask.checklists.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none group"
                      >
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition ${
                          item.completed 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-black/30 dark:border-white/30 group-hover:border-black/60'
                        }`}>
                          {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className={`text-[11px] ${item.completed ? 'line-through opacity-50' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-black/10 dark:border-white/10 gap-2">
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    onSelectTask(selectedTask);
                  }}
                  className="text-[11px] font-bold opacity-75 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Drawer</span>
                </button>

                <button
                  onClick={handleCompleteTask}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{selectedTask.status === 'done' ? 'Reopen' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3D POP-UP FOR PROJECT NODE */}
        {selectedNode && selectedNode.project && (
          <div 
            onClick={() => setSelectedNode(null)}
            className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] p-6 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl animate-in zoom-in-95 duration-150"
              style={{
                transform: 'perspective(1000px) rotateX(4deg) translateZ(30px)',
              }}
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Project</span>
              </div>

              <h3 className="text-lg font-black mb-2">{selectedNode.project.title}</h3>
              {selectedNode.project.description && (
                <p className="text-xs text-slate-400 mb-4">{selectedNode.project.description}</p>
              )}

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Total tasks in project:</span>
                <span className="font-bold text-white">
                  {tasks.filter(t => t.projectId === selectedNode.project?.id).length}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

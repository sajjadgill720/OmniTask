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
  Clock, 
  ExternalLink,
  Plus,
  Eye,
  Filter
} from 'lucide-react';
import { Task, Project } from '../types';
import { parseColorToRgb } from '../utils/colorUtils';

interface NetworkGraph3DViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
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
  onQuickAdd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

    // 2. Task Nodes (Fibonacci sphere distribution around corresponding projects or center)
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
        radius: task.isPinned ? 11 : 8.5,
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
      if (autoRotate && !isDragging.current) {
        rotY.current += 0.003;
      }

      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);
      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);

      // Project 3D nodes into 2D camera coordinates
      const projectedNodes = nodes.map(node => {
        // Rotate Y
        let x1 = node.x * cosY + node.z * sinY;
        let z1 = -node.x * sinY + node.z * cosY;

        // Rotate X
        let y2 = node.y * cosX - z1 * sinX;
        let z2 = node.y * sinX + z1 * cosX;

        // Perspective division
        const fov = 500;
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

        // Skip if behind camera
        if (s.scale <= 0 || t.scale <= 0) return;

        const isHovered = hoveredNode && (hoveredNode.id === s.id || hoveredNode.id === t.id);

        ctx.beginPath();
        ctx.moveTo(s.x2d, s.y2d);
        ctx.lineTo(t.x2d, t.y2d);
        ctx.strokeStyle = isHovered ? '#3b82f6' : edge.color;
        ctx.lineWidth = isHovered ? 2.5 : Math.max(0.6, 1.2 * s.scale);
        ctx.globalAlpha = isHovered ? 0.9 : Math.min(0.6, Math.max(0.12, s.scale * 0.45));
        ctx.stroke();

        // Animated Energy Particle along connection
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

        // Node Outer Glow
        const grad = ctx.createRadialGradient(node.x2d, node.y2d, 0, node.x2d, node.y2d, drawRadius * 2);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, drawRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Node Label
        if (node.scale > 0.75 || isHovered || isSelected) {
          ctx.font = `${Math.round(11 * node.scale)}px sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label, node.x2d, node.y2d + drawRadius + 12 * node.scale);
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
      if (dist < (node.radius * scale + 6)) {
        found = node;
        break;
      }
    }

    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    lastMouse.current = null;
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      if (hoveredNode.task) {
        onSelectTask(hoveredNode.task);
      }
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 select-none">
      
      {/* 3D Network Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🕸️</span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              3D Knowledge & Task Constellation
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {nodes.length} Nodes • {edges.length} Edges
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
            <span>Visualizes connections between tasks, projects, and shared tags in real 3D</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Drag to orbit • Click node to preview
            </span>
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-200/70 dark:bg-[#181a24] rounded-xl border border-slate-300/40 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Node</span>
          </button>
        </div>
      </div>

      {/* 3D Network Canvas Container */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
        
        {/* Ambient Cosmic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Selected Node Inspector Flyout */}
        {selectedNode && selectedNode.task && (
          <div className="absolute bottom-5 right-5 z-20 w-80 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl text-white animate-pop-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                Node Inspector
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <h4 className="font-bold text-sm text-white mb-1 leading-snug">
              {selectedNode.task.title}
            </h4>

            {selectedNode.task.notes && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {selectedNode.task.notes}
              </p>
            )}

            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedNode.task.status === 'done' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
              }`}>
                {selectedNode.task.status}
              </span>
              {selectedNode.task.tags.map(t => (
                <span key={t} className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleComplete(selectedNode.task!.id)}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {selectedNode.task.status === 'done' ? 'Reopen' : 'Complete Task'}
              </button>
              <button
                onClick={() => onSelectTask(selectedNode.task!)}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>Edit</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

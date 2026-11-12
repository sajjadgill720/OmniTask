import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Network, 
  Search, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
} from 'lucide-react';
import { Task, Project } from '../types';

export type GraphEntityType = 'project' | 'task' | 'note';

export type RelationshipType = 
  | 'project_task'    // Project -> Task
  | 'task_note'       // Task -> Note
  | 'shared_tag';     // Task <-> Task (shared domain tag)

export interface GraphNode {
  id: string;
  title: string;
  type: GraphEntityType;
  status?: string;        // 'todo' | 'in_progress' | 'done'
  priority?: string;      // 'urgent' | 'high' | 'normal' | 'low'
  color: string;          // Hex color
  baseRadius: number;
  radius: number;         // Computed based on degree/importance
  degree: number;         // Relationship count
  projectId?: string;
  projectTitle?: string;
  rawTask?: Task;
  rawProject?: Project;
  noteSnippet?: string;
  checklistsCount?: number;
  completedChecklistsCount?: number;
  dueDate?: string;
  createdAt?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  directed: boolean;
  color?: string;
}

interface NetworkGraphProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onSelectProject?: (projectId: string) => void;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 650;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

const stableUnit = (seed: string, salt = 0) => {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  tasks,
  projects,
  onSelectTask,
  onSelectProject,
}) => {
  // UI Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Camera Transformation (Pan & Zoom)
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  // Node Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Live Animated Node Positions (Simulated in memory)
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const simFrameRef = useRef<number | null>(null);

  // 1. EXTRACT REAL ENTITIES & ACTUAL DATABASE RELATIONSHIPS
  const { rawNodes, rawEdges } = useMemo(() => {
    const extractedNodes: GraphNode[] = [];
    const extractedEdges: GraphEdge[] = [];
    const edgeDegreeMap: Record<string, number> = {};

    const incrementDegree = (idA: string, idB: string) => {
      edgeDegreeMap[idA] = (edgeDegreeMap[idA] || 0) + 1;
      edgeDegreeMap[idB] = (edgeDegreeMap[idB] || 0) + 1;
    };

    // Projects and tasks are graph nodes; only real project membership creates an edge.
    const projectMap = new Map<string, Project>();
    projects.forEach((proj, idx) => {
      projectMap.set(proj.id, proj);
      const angle = idx * 2.399963229728653;
      const radius = 140 + Math.sqrt(idx + 1) * 24;
      const initX = CENTER_X + Math.cos(angle) * radius;
      const initY = CENTER_Y + Math.sin(angle) * radius * 0.68;

      extractedNodes.push({
        id: proj.id,
        title: proj.title,
        type: 'project',
        color: '#10B981',
        baseRadius: 16,
        radius: 16,
        degree: 0,
        rawProject: proj,
        dueDate: proj.dueDate,
        x: initX,
        y: initY,
        vx: 0,
        vy: 0,
      });

    });

    // Tasks orbit their project or use a deterministic spiral when unassigned.
    tasks.forEach((task, idx) => {
      const parentProj = task.projectId ? projectMap.get(task.projectId) : undefined;
      const angle = idx * 2.399963229728653;
      const parentIndex = parentProj ? projects.findIndex(project => project.id === parentProj.id) : -1;
      const parentAngle = parentIndex >= 0 ? parentIndex * 2.399963229728653 : 0;
      const parentRadius = parentIndex >= 0 ? 140 + Math.sqrt(parentIndex + 1) * 24 : 0;
      const anchorX = parentIndex >= 0 ? CENTER_X + Math.cos(parentAngle) * parentRadius : CENTER_X;
      const anchorY = parentIndex >= 0 ? CENTER_Y + Math.sin(parentAngle) * parentRadius * 0.68 : CENTER_Y;
      const orbit = parentIndex >= 0 ? 90 + stableUnit(task.id, 3) * 30 : 74 + Math.sqrt(idx + 1) * 54;
      const taskAngle = parentIndex >= 0 ? parentAngle + (stableUnit(task.id, 4) * 1.1 - 0.55) : angle;
      const initX = anchorX + Math.cos(taskAngle) * orbit + (stableUnit(task.id, 1) * 24 - 12);
      const initY = anchorY + Math.sin(taskAngle) * orbit * 0.72 + (stableUnit(task.id, 2) * 24 - 12);

      const completedSubtasks = (task.checklists || []).filter(c => c.completed).length;

      extractedNodes.push({
        id: task.id,
        title: task.title,
        type: 'task',
        status: task.status,
        priority: task.priority,
        color: '#F59E0B',
        baseRadius: 12,
        radius: 12,
        degree: 0,
        projectId: task.projectId,
        projectTitle: parentProj?.title,
        rawTask: task,
        checklistsCount: (task.checklists || []).length,
        completedChecklistsCount: completedSubtasks,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        x: initX,
        y: initY,
        vx: 0,
        vy: 0,
      });

      // Only project membership creates a containment edge.
      if (task.projectId && projectMap.has(task.projectId)) {
        extractedEdges.push({
          id: `edge-${task.projectId}-${task.id}`,
          source: task.projectId,
          target: task.id,
          type: 'project_task',
          label: 'Contains Task',
          directed: true,
          color: parentProj?.colorHex || '#10B981',
        });
        incrementDegree(task.projectId, task.id);
      }

      // D. Note / Documentation Entity (only if task has actual notes)
      if (task.notes && task.notes.trim().length > 0) {
        const noteId = `note-${task.id}`;
        extractedNodes.push({
          id: noteId,
          title: `${task.title} Notes`,
          type: 'note',
          color: '#38BDF8',
          baseRadius: 10,
          radius: 10,
          degree: 0,
          projectId: task.projectId,
          projectTitle: parentProj?.title,
          noteSnippet: task.notes.trim(),
          createdAt: task.updatedAt || task.createdAt,
          x: initX + (stableUnit(noteId, 1) * 50 - 25),
          y: initY + (stableUnit(noteId, 2) * 50 - 25),
          vx: 0,
          vy: 0,
        });

        extractedEdges.push({
          id: `edge-${task.id}-${noteId}`,
          source: task.id,
          target: noteId,
          type: 'task_note',
          label: 'Documentation & Notes',
          directed: false,
          color: '#38BDF8',
        });
        incrementDegree(task.id, noteId);
      }
    });

    // E. Shared Domain Tag Relationships (Tasks sharing specific tags)
    const tagMap: Record<string, string[]> = {};
    tasks.forEach(t => {
      (t.tags || []).forEach(tag => {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag) {
          if (!tagMap[cleanTag]) tagMap[cleanTag] = [];
          tagMap[cleanTag].push(t.id);
        }
      });
    });

    Object.entries(tagMap).forEach(([tag, taskIds]) => {
      // Connect first 2 pairs per tag to avoid exponential edge clutter
      if (taskIds.length >= 2) {
        for (let i = 0; i < Math.min(taskIds.length - 1, 2); i++) {
          const tA = taskIds[i];
          const tB = taskIds[i + 1];
          const edgeId = `edge-tag-${tA}-${tB}-${tag}`;
          extractedEdges.push({
            id: edgeId,
            source: tA,
            target: tB,
            type: 'shared_tag',
            label: `Shared Tag #${tag}`,
            directed: false,
            color: '#FCD34D',
          });
          incrementDegree(tA, tB);
        }
      }
    });

    // Finalize node radius based on actual degree metric
    extractedNodes.forEach(n => {
      n.degree = edgeDegreeMap[n.id] || 0;
      n.radius = Math.max(9, Math.min(26, n.baseRadius + Math.sqrt(n.degree) * 2.5));
    });

    return { rawNodes: extractedNodes, rawEdges: extractedEdges };
  }, [tasks, projects]);

  // 2. SEARCH & HOVERED NEIGHBORS
  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase().trim();
    const matches = new Set<string>();
    rawNodes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || (n.rawTask?.tags || []).some(t => t.toLowerCase().includes(q))) {
        matches.add(n.id);
      }
    });
    return matches;
  }, [searchQuery, rawNodes]);

  const hoveredNeighborIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const neighbors = new Set([hoveredNodeId]);
    rawEdges.forEach(edge => {
      if (edge.source === hoveredNodeId) neighbors.add(edge.target);
      if (edge.target === hoveredNodeId) neighbors.add(edge.source);
    });
    return neighbors;
  }, [hoveredNodeId, rawEdges]);

  // 3. Force-directed graph layout (a single global graph, without alternate modes).
  const computeInitialLayout = useCallback((currentNodes: GraphNode[]): GraphNode[] => currentNodes.map(node => ({
    ...node,
    pinned: false,
    x: node.x || CENTER_X + (stableUnit(node.id, 4) * 200 - 100),
    y: node.y || CENTER_Y + (stableUnit(node.id, 5) * 200 - 100),
  })), []);

  // Initialize or update graph nodes while preserving positions after edits.
  useEffect(() => {
    setNodes(prev => {
      const merged = rawNodes.map(fn => {
        const existing = prev.find(p => p.id === fn.id);
        if (existing) {
          return {
            ...fn,
            x: existing.x,
            y: existing.y,
            vx: existing.vx,
            vy: existing.vy,
            pinned: existing.pinned,
          };
        }
        return fn;
      });
      return computeInitialLayout(merged);
    });
  }, [rawNodes, computeInitialLayout]);

  // 5. FORCE-DIRECTED PHYSICS SIMULATION STEP
  useEffect(() => {
    let iterations = 0;
    const maxIterations = 140;

    const tick = () => {
      setNodes(prevNodes => {
        const next = prevNodes.map(n => ({ ...n }));
        const nodeMap = new Map(next.map(n => [n.id, n]));

        // A. Repulsion between all node pairs (Coulomb force)
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i];
            const b = next[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy || 1;
            const dist = Math.sqrt(distSq);

            // Min distance collision boundary to prevent overlap
            const minAllowedDist = a.radius + b.radius + 24;
            const repStrength = dist < minAllowedDist ? 4500 : 1800;

            const force = repStrength / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!a.pinned) {
              a.vx -= fx;
              a.vy -= fy;
            }
            if (!b.pinned) {
              b.vx += fx;
              b.vy += fy;
            }
          }
        }

        // B. Edge Attraction (Hooke's spring force)
        rawEdges.forEach(e => {
          const src = nodeMap.get(e.source);
          const tgt = nodeMap.get(e.target);
          if (!src || !tgt) return;

          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const idealDist = e.type === 'project_task' ? 120 : e.type === 'task_note' ? 70 : 160;
          const spring = 0.045;
          const force = (dist - idealDist) * spring;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!src.pinned) {
            src.vx += fx;
            src.vy += fy;
          }
          if (!tgt.pinned) {
            tgt.vx -= fx;
            tgt.vy -= fy;
          }
        });

        // C. Center Gravity & Velocity Dampening
        next.forEach(n => {
          if (n.pinned) return;

          const toCenterX = CENTER_X - n.x;
          const toCenterY = CENTER_Y - n.y;
          n.vx += toCenterX * 0.012;
          n.vy += toCenterY * 0.012;

          // Friction damping
          n.vx *= 0.82;
          n.vy *= 0.82;

          n.x += n.vx;
          n.y += n.vy;

          // Boundary clamping
          n.x = Math.max(n.radius + 15, Math.min(CANVAS_WIDTH - n.radius - 15, n.x));
          n.y = Math.max(n.radius + 15, Math.min(CANVAS_HEIGHT - n.radius - 15, n.y));
        });

        return next;
      });

      iterations++;
      if (iterations < maxIterations) {
        simFrameRef.current = requestAnimationFrame(tick);
      }
    };

    simFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
    };
  }, [rawEdges]);

  // 6. PAN & ZOOM CONTROLS
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewScale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT) || 1;
    const offsetX = (rect.width - CANVAS_WIDTH * viewScale) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT * viewScale) / 2;
    const pointerX = (e.clientX - rect.left - offsetX) / viewScale;
    const pointerY = (e.clientY - rect.top - offsetY) / viewScale;
    const zoomFactor = Math.exp(-e.deltaY * 0.0012);
    setCamera(prev => {
      const zoom = Math.max(0.25, Math.min(2.8, prev.zoom * zoomFactor));
      const worldX = (pointerX - prev.x) / prev.zoom;
      const worldY = (pointerY - prev.y) / prev.zoom;
      return { x: pointerX - worldX * zoom, y: pointerY - worldY * zoom, zoom };
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        camX: camera.x,
        camY: camera.y,
      };
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewScale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT) || 1;
      const dx = (e.clientX - panStartRef.current.x) / viewScale;
      const dy = (e.clientY - panStartRef.current.y) / viewScale;
      setCamera(prev => ({
        ...prev,
        x: panStartRef.current.camX + dx,
        y: panStartRef.current.camY + dy,
      }));
    } else if (draggedNodeId) {
      // Reposition dragged node
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewScale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT) || 1;
      const offsetX = (rect.width - CANVAS_WIDTH * viewScale) / 2;
      const offsetY = (rect.height - CANVAS_HEIGHT * viewScale) / 2;
      const viewX = (e.clientX - rect.left - offsetX) / viewScale;
      const viewY = (e.clientY - rect.top - offsetY) / viewScale;
      const mouseX = (viewX - camera.x) / camera.zoom;
      const mouseY = (viewY - camera.y) / camera.zoom;

      setNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return {
            ...n,
            x: Math.max(n.radius, Math.min(CANVAS_WIDTH - n.radius, mouseX)),
            y: Math.max(n.radius, Math.min(CANVAS_HEIGHT - n.radius, mouseY)),
            vx: 0,
            vy: 0,
            pinned: true,
          };
        }
        return n;
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    if (draggedNodeId) {
      setDraggedNodeId(null);
    }
  };

  const resetCamera = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  };

  const fitToScreen = () => {
    if (nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x - n.radius);
      maxX = Math.max(maxX, n.x + n.radius);
      minY = Math.min(minY, n.y - n.radius);
      maxY = Math.max(maxY, n.y + n.radius);
    });

    const w = maxX - minX || CANVAS_WIDTH;
    const h = maxY - minY || CANVAS_HEIGHT;
    const zoom = Math.min(2.0, Math.max(0.25, Math.min(CANVAS_WIDTH / (w + 80), CANVAS_HEIGHT / (h + 80))));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    setCamera({
      x: CANVAS_WIDTH / 2 - cx * zoom,
      y: CANVAS_HEIGHT / 2 - cy * zoom,
      zoom,
    });
  };

  // Escape clears the graph search.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lookup node coordinate helper for edge rendering
  const liveNodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className="w-full flex flex-col gap-4 select-none font-sans">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/20 bg-stone-950/55 p-4 text-white shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500 shadow-lg">
            <Network className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-base font-extrabold tracking-tight">Knowledge Graph</h3>
              <span className="text-xs text-white/65">{rawNodes.length} items · {rawEdges.length} links</span>
            </div>
            <p className="text-xs text-white/60">Explore how tasks, projects, and notes connect.</p>
          </div>
        </div>
        <label className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a task, project, or note"
            aria-label="Search graph"
            className="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-10 pr-10 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/40"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear graph search" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/65 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </header>

      {/* =======================================================================
          MAIN GRAPH CANVAS + CONTEXTUAL INSPECTOR PANEL
          ======================================================================= */}
      <div className="w-full">
        
        {/* GRAPH CANVAS STAGE */}
        <div className="relative h-[min(76vh,900px)] min-h-[460px] rounded-3xl border border-white/15 bg-gradient-to-br from-[#121019] via-[#161224] to-[#0d0b14] shadow-2xl overflow-hidden select-none sm:min-h-[560px]">
          
          {/* Subtle Stardust Ambient Background Grid */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Ambient Purple Central Glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 65%)',
            }}
          />

          {/* Floating Navigation Controls (Zoom in, Zoom out, Fit, Reset) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl text-white">
            <button
              type="button"
              onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(2.8, prev.zoom * 1.2) }))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.4, prev.zoom * 0.8) }))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={fitToScreen}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetCamera}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          {/* SVG RENDERING LAYER */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`w-full h-full cursor-${isPanning ? 'grabbing' : 'grab'}`}
          >
            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
              
              {/* 1. EDGES LAYER */}
              <g className="edges-layer">
                {rawEdges.map(edge => {
                  const src = liveNodeMap.get(edge.source);
                  const tgt = liveNodeMap.get(edge.target);
                  if (!src || !tgt) return null;
                  const isEdgeActive = hoveredNodeId ? edge.source === hoveredNodeId || edge.target === hoveredNodeId : false;
                  const isDimmed = Boolean(hoveredNodeId && !isEdgeActive) || Boolean(searchQuery.trim() && !searchMatchIds.has(edge.source) && !searchMatchIds.has(edge.target));
                  const strokeColor = isEdgeActive ? (edge.color || '#FBBF24') : 'rgba(255,255,255,0.22)';
                  const strokeWidth = isEdgeActive ? 2.6 : 1.2;
                  const isDashed = edge.type === 'task_note' || edge.type === 'shared_tag';

                  return (
                    <g 
                      key={edge.id}
                      onMouseEnter={() => setHoveredEdgeId(edge.id)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
                      className="cursor-pointer"
                    >
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isDashed ? '4 4' : undefined}
                        opacity={isDimmed ? 0.08 : isEdgeActive ? 0.95 : 0.45}

                        className="transition-all duration-300"
                      />
                      {/* Edge Tooltip on Hover */}
                      {hoveredEdgeId === edge.id && (
                        <text
                          x={(src.x + tgt.x) / 2}
                          y={(src.y + tgt.y) / 2 - 8}
                          fill="#ffffff"
                          fontSize={10}
                          textAnchor="middle"
                          className="font-mono font-bold bg-black px-1 pointer-events-none drop-shadow-md"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 2. NODES LAYER */}
              <g className="nodes-layer">
                {nodes.map(node => {
                  const isHovered = hoveredNodeId === node.id;
                  const isSearchMatch = searchMatchIds.has(node.id);
                  const isDimmed = Boolean(hoveredNodeId && !hoveredNeighborIds.has(node.id)) || Boolean(searchQuery.trim() && !isSearchMatch);
                  const displayRadius = isHovered || isSearchMatch ? node.radius + 3 : node.radius;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggedNodeId(node.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (node.rawTask) onSelectTask(node.rawTask);
                        else if (node.type === 'note') {
                          const parentTask = tasks.find(task => 'note-' + task.id === node.id);
                          if (parentTask) onSelectTask(parentTask);
                        } else if (node.rawProject && onSelectProject) onSelectProject(node.rawProject.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      opacity={isDimmed ? 0.15 : 1}
                      className="cursor-pointer transition-opacity duration-300 group"
                    >
                      {/* Glow Halo for Selected or Search Match */}
                      {(isHovered || isSearchMatch) && (
                        <circle
                          r={displayRadius + 10}
                          fill="none"
                          stroke={isSearchMatch ? '#F59E0B' : '#ffffff'}
                          strokeWidth="2.5"
                          strokeDasharray={isSearchMatch ? '4 3' : undefined}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Body */}
                      <circle r={displayRadius} fill={node.color} stroke={isHovered || isSearchMatch ? '#ffffff' : 'rgba(255,255,255,0.35)'} strokeWidth={isHovered || isSearchMatch ? 2.5 : 1.5} className="drop-shadow-md transition-all duration-200" />
                      {node.status === 'done' && (
                        <text
                          y={4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={10}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          ✓
                        </text>
                      )}

                      {/* Keep labels quiet until a node is focused to prevent collisions. */}
                      {(isHovered || isSearchMatch) && (
                      <text
                        y={displayRadius + 14}
                        textAnchor="middle"
                        fill={isHovered || isSearchMatch ? '#ffffff' : 'rgba(255,255,255,0.85)'}
                        fontSize={isHovered || isSearchMatch ? 11 : 9.5}
                        fontWeight={isHovered || isSearchMatch ? 'bold' : '600'}
                        className="pointer-events-none select-none font-sans drop-shadow-sm"
                      >
                        {node.title.length > 18 ? node.title.slice(0, 16) + '…' : node.title}
                      </text>
                      )}
                    </g>
                  );
                })}
              </g>

            </g>
          </svg>

          {/* Quick Graph Footer Guide */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white/50 pointer-events-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Tasks
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Projects
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Notes
              </span>
            </div>
            <span>Hover to trace links · Click to open · Drag to move · Scroll to zoom</span>
          </div>

        </div>



      </div>
    </div>
  );
};


import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowUpRight, 
  Folder, 
  CheckCircle2, 
  Clock, 
  Tag, 
  FileText, 
  CheckSquare, 
  X, 
  Crosshair, 
  GitFork,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { Task, Project } from '../types';

export type GraphEntityType = 'user' | 'project' | 'task' | 'note';

export type RelationshipType = 
  | 'user_project'    // User -> Project
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

export type LayoutMode = 'force' | 'radial' | 'hierarchical';
export type GroupingMode = 'type' | 'project' | 'status';
export type FilterTab = 'all' | 'tasks' | 'projects' | 'notes';

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

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  tasks,
  projects,
  onSelectTask,
  onSelectProject,
}) => {
  // UI Controls State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('type');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [showSecondDegree, setShowSecondDegree] = useState(false);

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

    // A. Central User Identity Node
    const userNodeId = 'user-root';
    extractedNodes.push({
      id: userNodeId,
      title: 'Knovera Workspace',
      type: 'user',
      color: '#A855F7',
      baseRadius: 18,
      radius: 18,
      degree: 0,
      x: CENTER_X,
      y: CENTER_Y,
      vx: 0,
      vy: 0,
      pinned: true,
    });

    // B. Project Nodes
    const projectMap = new Map<string, Project>();
    projects.forEach((proj, idx) => {
      projectMap.set(proj.id, proj);
      const angle = (idx / Math.max(1, projects.length)) * 2 * Math.PI;
      const initX = CENTER_X + Math.cos(angle) * 180;
      const initY = CENTER_Y + Math.sin(angle) * 150;

      extractedNodes.push({
        id: proj.id,
        title: proj.title,
        type: 'project',
        color: proj.colorHex || '#10B981',
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

      // User owns Project edge
      extractedEdges.push({
        id: `edge-${userNodeId}-${proj.id}`,
        source: userNodeId,
        target: proj.id,
        type: 'user_project',
        label: 'Workspace Project',
        directed: true,
        color: '#A855F7',
      });
      incrementDegree(userNodeId, proj.id);
    });

    // C. Task Nodes & Project Containment Edges
    tasks.forEach((task, idx) => {
      const parentProj = task.projectId ? projectMap.get(task.projectId) : undefined;
      const angle = (idx / Math.max(1, tasks.length)) * 2 * Math.PI;
      const offsetDist = parentProj ? 80 : 220;
      const baseAnchorX = parentProj ? CENTER_X : CENTER_X;
      const baseAnchorY = parentProj ? CENTER_Y : CENTER_Y;

      const initX = baseAnchorX + Math.cos(angle) * offsetDist + (Math.random() * 40 - 20);
      const initY = baseAnchorY + Math.sin(angle) * offsetDist + (Math.random() * 40 - 20);

      // Node color according to grouping default
      const taskColor = task.status === 'done' 
        ? '#10B981' 
        : task.status === 'in_progress' 
        ? '#38BDF8' 
        : '#F59E0B';

      const completedSubtasks = (task.checklists || []).filter(c => c.completed).length;

      extractedNodes.push({
        id: task.id,
        title: task.title,
        type: 'task',
        status: task.status,
        priority: task.priority,
        color: taskColor,
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

      // Connect Task to parent Project if assigned, otherwise connect to Workspace root
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
      } else {
        extractedEdges.push({
          id: `edge-${userNodeId}-${task.id}`,
          source: userNodeId,
          target: task.id,
          type: 'user_project',
          label: 'Direct Task',
          directed: true,
          color: '#F59E0B',
        });
        incrementDegree(userNodeId, task.id);
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
          x: initX + (Math.random() * 50 - 25),
          y: initY + (Math.random() * 50 - 25),
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

  // 2. FILTERING & COLOR GROUPING
  const { filteredNodes, filteredEdges, filteredNodeMap } = useMemo(() => {
    let activeNodes = rawNodes;

    if (filterTab === 'tasks') {
      activeNodes = rawNodes.filter(n => n.type === 'task' || n.type === 'project');
    } else if (filterTab === 'projects') {
      activeNodes = rawNodes.filter(n => n.type === 'project' || n.type === 'user');
    } else if (filterTab === 'notes') {
      activeNodes = rawNodes.filter(n => n.type === 'note' || (n.type === 'task' && n.rawTask?.notes));
    }

    const activeNodeIdSet = new Set(activeNodes.map(n => n.id));

    // Keep edges only if both endpoints exist in the active filtered set
    const activeEdges = rawEdges.filter(e => activeNodeIdSet.has(e.source) && activeNodeIdSet.has(e.target));

    // Apply Coloring Mode
    const styledNodes = activeNodes.map(node => {
      let finalColor = node.color;

      if (groupingMode === 'type') {
        if (node.type === 'user') finalColor = '#A855F7';
        else if (node.type === 'project') finalColor = '#10B981';
        else if (node.type === 'task') finalColor = '#F59E0B';
        else if (node.type === 'note') finalColor = '#38BDF8';
      } else if (groupingMode === 'status') {
        if (node.type === 'task') {
          if (node.status === 'done') finalColor = '#10B981';
          else if (node.status === 'in_progress') finalColor = '#38BDF8';
          else finalColor = '#F59E0B';
        }
      } else if (groupingMode === 'project') {
        if (node.projectId) {
          const parent = rawNodes.find(n => n.id === node.projectId);
          if (parent?.color) finalColor = parent.color;
        }
      }

      return {
        ...node,
        color: finalColor,
      };
    });

    const map = new Map<string, GraphNode>();
    styledNodes.forEach(n => map.set(n.id, n));

    return {
      filteredNodes: styledNodes,
      filteredEdges: activeEdges,
      filteredNodeMap: map,
    };
  }, [rawNodes, rawEdges, filterTab, groupingMode]);

  // 3. SEARCH & FOCUS NEIGHBORS RESOLUTION
  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase().trim();
    const matches = new Set<string>();
    filteredNodes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || (n.rawTask?.tags || []).some(t => t.toLowerCase().includes(q))) {
        matches.add(n.id);
      }
    });
    return matches;
  }, [searchQuery, filteredNodes]);

  // Direct and 2nd-degree neighbors for Focus Mode
  const { focusNeighborIds, focusEdgeIds } = useMemo(() => {
    if (!selectedNodeId) return { focusNeighborIds: new Set<string>(), focusEdgeIds: new Set<string>() };

    const firstDegree = new Set<string>([selectedNodeId]);
    const activeEdges = new Set<string>();

    filteredEdges.forEach(e => {
      if (e.source === selectedNodeId) {
        firstDegree.add(e.target);
        activeEdges.add(e.id);
      } else if (e.target === selectedNodeId) {
        firstDegree.add(e.source);
        activeEdges.add(e.id);
      }
    });

    if (showSecondDegree) {
      filteredEdges.forEach(e => {
        if (firstDegree.has(e.source) || firstDegree.has(e.target)) {
          firstDegree.add(e.source);
          firstDegree.add(e.target);
          activeEdges.add(e.id);
        }
      });
    }

    return { focusNeighborIds: firstDegree, focusEdgeIds: activeEdges };
  }, [selectedNodeId, filteredEdges, showSecondDegree]);

  // 4. LAYOUT POSITION CALCULATIONS
  // Updates node coordinates according to selected Layout Mode (Force, Radial, Hierarchical)
  const computeInitialLayout = useCallback((layout: LayoutMode, currentNodes: GraphNode[]): GraphNode[] => {
    if (layout === 'hierarchical') {
      // 4-tier DAG layout
      const ranks: Record<string, GraphNode[]> = {
        user: [],
        project: [],
        task: [],
        note: [],
      };

      currentNodes.forEach(n => {
        if (ranks[n.type]) ranks[n.type].push(n);
        else ranks.task.push(n);
      });

      const yLevels = { user: 70, project: 210, task: 410, note: 580 };
      const updated: GraphNode[] = [];

      Object.entries(ranks).forEach(([type, tierNodes]) => {
        const y = yLevels[type as keyof typeof yLevels] || 300;
        const count = tierNodes.length;
        const spacing = CANVAS_WIDTH / (count + 1);

        tierNodes.forEach((node, i) => {
          updated.push({
            ...node,
            x: Math.round(spacing * (i + 1)),
            y,
            vx: 0,
            vy: 0,
            pinned: true,
          });
        });
      });

      return updated;
    }

    if (layout === 'radial') {
      // Concentric circular orbit layout
      const updated: GraphNode[] = [];
      const userNode = currentNodes.find(n => n.type === 'user');
      const projectNodes = currentNodes.filter(n => n.type === 'project');
      const taskNodes = currentNodes.filter(n => n.type === 'task');
      const noteNodes = currentNodes.filter(n => n.type === 'note');

      if (userNode) {
        updated.push({ ...userNode, x: CENTER_X, y: CENTER_Y, vx: 0, vy: 0, pinned: true });
      }

      // Ring 1: Projects (Radius 150)
      const projAngleMap = new Map<string, number>();
      projectNodes.forEach((p, idx) => {
        const angle = (idx / Math.max(1, projectNodes.length)) * 2 * Math.PI - Math.PI / 2;
        projAngleMap.set(p.id, angle);
        updated.push({
          ...p,
          x: Math.round(CENTER_X + Math.cos(angle) * 150),
          y: Math.round(CENTER_Y + Math.sin(angle) * 125),
          vx: 0,
          vy: 0,
          pinned: true,
        });
      });

      // Ring 2: Tasks clustered towards parent project angle (Radius 265)
      taskNodes.forEach((t, idx) => {
        let baseAngle = (idx / Math.max(1, taskNodes.length)) * 2 * Math.PI;
        if (t.projectId && projAngleMap.has(t.projectId)) {
          const parentAngle = projAngleMap.get(t.projectId)!;
          baseAngle = parentAngle + (Math.random() * 0.45 - 0.225);
        }
        updated.push({
          ...t,
          x: Math.round(CENTER_X + Math.cos(baseAngle) * 270),
          y: Math.round(CENTER_Y + Math.sin(baseAngle) * 220),
          vx: 0,
          vy: 0,
          pinned: true,
        });
      });

      // Ring 3: Notes (Radius 340)
      noteNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(1, noteNodes.length)) * 2 * Math.PI;
        updated.push({
          ...n,
          x: Math.round(CENTER_X + Math.cos(angle) * 350),
          y: Math.round(CENTER_Y + Math.sin(angle) * 280),
          vx: 0,
          vy: 0,
          pinned: true,
        });
      });

      return updated;
    }

    // Force-directed initialization
    return currentNodes.map(n => ({
      ...n,
      pinned: n.type === 'user',
      x: n.x || CENTER_X + (Math.random() * 200 - 100),
      y: n.y || CENTER_Y + (Math.random() * 200 - 100),
    }));
  }, []);

  // Initialize or update nodes on filter/layout changes
  useEffect(() => {
    setNodes(prev => {
      const merged = filteredNodes.map(fn => {
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
      return computeInitialLayout(layoutMode, merged);
    });
  }, [filteredNodes, layoutMode, computeInitialLayout]);

  // 5. FORCE-DIRECTED PHYSICS SIMULATION STEP
  useEffect(() => {
    if (layoutMode !== 'force') return;

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
        filteredEdges.forEach(e => {
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
  }, [layoutMode, filteredEdges]);

  // 6. PAN & ZOOM CONTROLS
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(2.8, prev.zoom * zoomFactor)),
    }));
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
      const dx = (e.clientX - panStartRef.current.x) / camera.zoom;
      const dy = (e.clientY - panStartRef.current.y) / camera.zoom;
      setCamera(prev => ({
        ...prev,
        x: panStartRef.current.camX + dx,
        y: panStartRef.current.camY + dy,
      }));
    } else if (draggedNodeId) {
      // Reposition dragged node
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (e.clientX - rect.left) / camera.zoom - camera.x;
      const mouseY = (e.clientY - rect.top) / camera.zoom - camera.y;

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
    const zoom = Math.min(2.0, Math.max(0.6, Math.min(CANVAS_WIDTH / (w + 80), CANVAS_HEIGHT / (h + 80))));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    setCamera({
      x: (CANVAS_WIDTH / 2) / zoom - cx,
      y: (CANVAS_HEIGHT / 2) / zoom - cy,
      zoom,
    });
  };

  // 7. KEYBOARD NAVIGATION & ESCAPE TO CLEAR
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selected Node Details
  const activeSelectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || filteredNodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodes, filteredNodeMap]);

  // Top Most Connected Entities for Empty Inspector State
  const mostConnectedNodes = useMemo(() => {
    return [...nodes]
      .filter(n => n.type !== 'user')
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 3);
  }, [nodes]);

  // Lookup node coordinate helper for edge rendering
  const liveNodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className="w-full flex flex-col gap-4 select-none font-sans">
      
      {/* =======================================================================
          TOP CONTROLS & FILTER BAR
          ======================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-4 rounded-3xl bg-black/55 dark:bg-black/70 backdrop-blur-2xl border border-white/15 shadow-xl text-white">
        
        {/* Left: Section Title & Real Graph Counters */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-300 shadow-md flex items-center justify-center text-white font-bold shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight text-white">
                Knowledge Network Graph
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-bold text-amber-300 border border-white/10">
                {nodes.length} Nodes • {filteredEdges.length} Edges
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Interactive relationship discovery across tasks, parent projects & documentation
            </p>
          </div>
        </div>

        {/* Center: Search with Live Highlighting */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes or #tags..."
            className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 text-xs text-white placeholder-white/40 outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Layout Switcher + Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Entity Type Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {(['all', 'tasks', 'projects', 'notes'] as const).map(tab => {
              const count = tab === 'all' 
                ? rawNodes.length 
                : tab === 'tasks' 
                ? tasks.length 
                : tab === 'projects' 
                ? projects.length 
                : rawNodes.filter(n => n.type === 'note').length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer capitalize ${
                    filterTab === tab ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {/* Layout Mode Selector (Force-Directed, Radial, Hierarchical) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode('force')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'force' ? 'bg-indigo-500 text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Force-Directed Organic Physics Layout"
            >
              Force
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'radial' ? 'bg-indigo-500 text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Radial Concentric Orbit Rings"
            >
              Radial
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('hierarchical')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'hierarchical' ? 'bg-indigo-500 text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
              title="Hierarchical Tree DAG (Projects → Tasks → Notes)"
            >
              Tree
            </button>
          </div>

          {/* Color Grouping Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-[10px] text-white/40 px-1 font-bold">Color:</span>
            {(['type', 'project', 'status'] as const).map(grp => (
              <button
                key={grp}
                type="button"
                onClick={() => setGroupingMode(grp)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition capitalize ${
                  groupingMode === grp ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* =======================================================================
          MAIN GRAPH CANVAS + CONTEXTUAL INSPECTOR PANEL
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* GRAPH CANVAS STAGE */}
        <div className="lg:col-span-8 relative h-[480px] sm:h-[540px] rounded-3xl bg-gradient-to-br from-[#121019] via-[#161224] to-[#0d0b14] border border-white/15 shadow-2xl overflow-hidden select-none">
          
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

          {/* Active Focus Pill Indicator */}
          {selectedNodeId && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/80 backdrop-blur-md border border-indigo-400/30 text-white shadow-xl text-xs">
              <Crosshair className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="font-semibold truncate max-w-[140px]">
                Focusing: {activeSelectedNode?.title}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="p-0.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                title="Clear Focus (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
            <defs>
              {/* Arrowhead marker for directed edges */}
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="18"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="rgba(255,255,255,0.45)" />
              </marker>

              <marker
                id="arrowhead-highlight"
                markerWidth="9"
                markerHeight="9"
                refX="20"
                refY="4.5"
                orient="auto"
              >
                <path d="M 0 0 L 9 4.5 L 0 9 Z" fill="#FBBF24" />
              </marker>

              {/* Glowing Halos for Selected / Central Nodes */}
              <radialGradient id="halo-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${camera.x * camera.zoom}, ${camera.y * camera.zoom}) scale(${camera.zoom})`}>
              
              {/* 1. EDGES LAYER */}
              <g className="edges-layer">
                {filteredEdges.map(edge => {
                  const src = liveNodeMap.get(edge.source);
                  const tgt = liveNodeMap.get(edge.target);
                  if (!src || !tgt) return null;

                  const isEdgeActive = selectedNodeId 
                    ? focusEdgeIds.has(edge.id)
                    : hoveredNodeId 
                    ? edge.source === hoveredNodeId || edge.target === hoveredNodeId
                    : false;

                  const isDimmed = selectedNodeId && !isEdgeActive;
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
                        markerEnd={edge.directed ? (isEdgeActive ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)') : undefined}
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
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isSearchMatch = searchMatchIds.has(node.id);
                  const isNeighbor = selectedNodeId ? focusNeighborIds.has(node.id) : true;
                  const isDimmed = (selectedNodeId && !isNeighbor) || (searchQuery.trim() && !isSearchMatch);

                  const displayRadius = isSelected ? node.radius + 4 : isHovered ? node.radius + 2 : node.radius;

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
                        setSelectedNodeId(prev => (prev === node.id ? null : node.id));
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (node.rawTask) onSelectTask(node.rawTask);
                        else if (node.projectId && onSelectProject) onSelectProject(node.projectId);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      opacity={isDimmed ? 0.15 : 1}
                      className="cursor-pointer transition-opacity duration-300 group"
                    >
                      {/* Glow Halo for Selected or Search Match */}
                      {(isSelected || isSearchMatch) && (
                        <circle
                          r={displayRadius + 10}
                          fill="none"
                          stroke={isSearchMatch ? '#F59E0B' : '#A855F7'}
                          strokeWidth="2.5"
                          strokeDasharray={isSearchMatch ? '4 3' : undefined}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Body */}
                      {node.type === 'note' ? (
                        /* Distinct Rounded Diamond/Square Shape for Notes */
                        <rect
                          x={-displayRadius}
                          y={-displayRadius}
                          width={displayRadius * 2}
                          height={displayRadius * 2}
                          rx={4}
                          transform="rotate(45)"
                          fill={node.color}
                          stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="drop-shadow-lg transition-transform duration-200"
                        />
                      ) : node.type === 'user' ? (
                        /* Central User Node */
                        <circle
                          r={displayRadius}
                          fill="url(#halo-glow)"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          className="drop-shadow-xl"
                        />
                      ) : (
                        /* Standard Project & Task Circles */
                        <circle
                          r={displayRadius}
                          fill={node.color}
                          stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.35)'}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="drop-shadow-md transition-all duration-200"
                        />
                      )}

                      {/* Center Glyph Icon */}
                      {node.type === 'user' && (
                        <text
                          y={4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={13}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          ✦
                        </text>
                      )}
                      {node.type === 'project' && (
                        <text
                          y={4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={11}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          📁
                        </text>
                      )}
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

                      {/* Node Label with Contrast Drop-Shadow */}
                      <text
                        y={displayRadius + 14}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)'}
                        fontSize={isSelected ? 11 : 9.5}
                        fontWeight={isSelected ? 'bold' : '600'}
                        className="pointer-events-none select-none font-sans drop-shadow-sm"
                      >
                        {node.title.length > 18 ? node.title.slice(0, 16) + '…' : node.title}
                      </text>
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
                <span className="w-2 h-2 rounded-full bg-sky-400 rotate-45" /> Notes
              </span>
            </div>
            <span>Double-click task to open detailed sticky note</span>
          </div>

        </div>

        {/* CONTEXTUAL INSPECTOR PANEL (Right Sidebar) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-black/55 dark:bg-black/70 backdrop-blur-2xl border border-white/15 shadow-2xl text-white space-y-4">
          
          {activeSelectedNode ? (
            /* Selected Node Inspector */
            <div className="space-y-4 animate-fade-in">
              
              {/* Entity Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: `${activeSelectedNode.color}25`, color: activeSelectedNode.color }}
                  >
                    {activeSelectedNode.type === 'project' ? '📁' : activeSelectedNode.type === 'note' ? '📝' : '✦'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                      {activeSelectedNode.type} Entity
                    </span>
                    <h4 className="font-extrabold text-sm text-white leading-tight truncate">
                      {activeSelectedNode.title}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Priority Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeSelectedNode.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    activeSelectedNode.status === 'done' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                      : activeSelectedNode.status === 'in_progress'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {activeSelectedNode.status.replace('_', ' ')}
                  </span>
                )}
                {activeSelectedNode.priority && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold uppercase font-mono">
                    {activeSelectedNode.priority}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono">
                  {activeSelectedNode.degree} Connections
                </span>
              </div>

              {/* Meta Information Cards */}
              <div className="space-y-2 text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
                {activeSelectedNode.projectTitle && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5" /> Project
                    </span>
                    <span className="font-bold text-white truncate max-w-[150px]">
                      {activeSelectedNode.projectTitle}
                    </span>
                  </div>
                )}
                {activeSelectedNode.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Due Date
                    </span>
                    <span className="font-mono font-semibold text-white">
                      {activeSelectedNode.dueDate}
                    </span>
                  </div>
                )}
                {activeSelectedNode.checklistsCount !== undefined && activeSelectedNode.checklistsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" /> Subtasks
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {activeSelectedNode.completedChecklistsCount} / {activeSelectedNode.checklistsCount} completed
                    </span>
                  </div>
                )}
              </div>

              {/* Note Snippet Preview */}
              {activeSelectedNode.noteSnippet && (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block mb-1">
                    Documentation Content
                  </span>
                  <p className="text-white/80 italic line-clamp-3">
                    "{activeSelectedNode.noteSnippet}"
                  </p>
                </div>
              )}

              {/* Contextual Action Button */}
              {activeSelectedNode.rawTask ? (
                <button
                  type="button"
                  onClick={() => onSelectTask(activeSelectedNode.rawTask!)}
                  className="w-full py-2 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <span>Open Sticky Note in Detail Drawer</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ) : activeSelectedNode.rawProject && onSelectProject ? (
                <button
                  type="button"
                  onClick={() => onSelectProject(activeSelectedNode.rawProject!.id)}
                  className="w-full py-2 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <span>Inspect Project Hub</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ) : null}

              {/* 2nd Degree Connection Switcher */}
              <div className="pt-2 flex items-center justify-between text-xs text-white/60">
                <span>Expand to 2nd-degree links</span>
                <button
                  type="button"
                  onClick={() => setShowSecondDegree(!showSecondDegree)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
                    showSecondDegree ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {showSecondDegree ? 'Enabled' : 'Disabled'}
                </button>
              </div>

            </div>
          ) : (
            /* Graph Overview & Knowledge Health (When No Node is Selected) */
            <div className="space-y-4">
              <div className="pb-3 border-b border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  Analytics & Discovery
                </span>
                <h4 className="font-extrabold text-sm text-white">
                  Knowledge Graph Overview
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Select any node or drag to inspect relationships and discover project hubs.
                </p>
              </div>

              {/* Real Summary Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/40 block">Entities</span>
                  <span className="font-mono font-extrabold text-lg text-white">
                    {nodes.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/40 block">Total Links</span>
                  <span className="font-mono font-extrabold text-lg text-emerald-400">
                    {filteredEdges.length}
                  </span>
                </div>
              </div>

              {/* Most Connected Entities Table */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/60 uppercase tracking-wider">
                  <span>Central Entities</span>
                  <span>Connections</span>
                </div>
                <div className="space-y-1.5">
                  {mostConnectedNodes.map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: node.color }} 
                        />
                        <span className="truncate font-semibold text-white">
                          {node.title}
                        </span>
                      </div>
                      <span className="font-mono text-amber-300 font-bold shrink-0 ml-2">
                        {node.degree} links
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Graph Tips */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-[11px] text-white/60">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Interaction Tips
                </span>
                <p>• Click any node to focus its network cluster.</p>
                <p>• Drag nodes to manually organize your mindmap.</p>
                <p>• Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono">Esc</kbd> to reset focus.</p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

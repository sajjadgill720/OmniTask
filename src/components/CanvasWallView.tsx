import React, { useState, useRef, useMemo } from 'react';
import { 
  MousePointer, 
  FileText, 
  ArrowUpRight, 
  Circle, 
  PenTool, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Plus, 
  RotateCw, 
  Trash2,
  X,
  Sparkles,
  Link2,
  Box
} from 'lucide-react';
import { Task, Project } from '../types';
import { RedPushPin } from './RedPushPin';

export interface CanvasNode {
  id: string;
  title: string;
  category?: string;
  x: number;
  y: number;
  colorHex: string;
  rotation: number;
  type: 'hub' | 'sticky' | 'polaroid';
  imageUrl?: string;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  style?: 'curved' | 'straight' | 'dashed';
}

interface CanvasWallViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onQuickAdd: () => void;
  onToggle3DSpatial?: () => void;
}

/**
 * Calculates exact center and bounding dimensions of each node type
 */
function getNodeDimensions(node: CanvasNode): { cx: number; cy: number; w: number; h: number } {
  if (node.type === 'hub') {
    return { cx: node.x + 72, cy: node.y + 48, w: 144, h: 96 };
  }
  if (node.type === 'polaroid') {
    return { cx: node.x + 64, cy: node.y + 78, w: 128, h: 156 };
  }
  // Sticky notes and custom shapes
  return { cx: node.x + 64, cy: node.y + 64, w: 128, h: 128 };
}

/**
 * Ray-Box intersection to clip connection lines strictly to the outer perimeter of each card.
 * Arrow lines will NEVER invade or cross the inside of the card or overshadow text!
 */
function getClippedEdgePoint(
  source: { cx: number; cy: number; w: number; h: number },
  target: { cx: number; cy: number; w: number; h: number },
  extraOffset: number = 4
): { x: number; y: number } {
  const dx = target.cx - source.cx;
  const dy = target.cy - source.cy;
  if (dx === 0 && dy === 0) return { x: source.cx, y: source.cy };

  const hw = source.w / 2;
  const hh = source.h / 2;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let scale = 1;
  if (absDx * hh > absDy * hw) {
    scale = hw / absDx;
  } else {
    scale = hh / absDy;
  }

  const angle = Math.atan2(dy, dx);
  return {
    x: Math.round(source.cx + dx * scale + Math.cos(angle) * extraOffset),
    y: Math.round(source.cy + dy * scale + Math.sin(angle) * extraOffset),
  };
}

export const CanvasWallView: React.FC<CanvasWallViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onQuickAdd,
  onToggle3DSpatial,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'arrow' | 'shape' | 'pen' | 'image'>('select');
  const [arrowStyle, setArrowStyle] = useState<'curved' | 'dashed' | 'straight'>('curved');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  // Connecting flow state: stores source node ID when in connection mode
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Default brainstorm nodes
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: 'hub_main',
      title: 'Knovera\nVision',
      x: 440,
      y: 220,
      colorHex: '#F8D979',
      rotation: 0,
      type: 'hub',
    },
    {
      id: 'node_ai',
      title: 'AI Powered\nProductivity',
      x: 170,
      y: 90,
      colorHex: '#F8D979',
      rotation: -2,
      type: 'sticky',
    },
    {
      id: 'node_gamified',
      title: 'Gamified\nLearning',
      x: 440,
      y: 50,
      colorHex: '#F1A6A6',
      rotation: 1.5,
      type: 'sticky',
    },
    {
      id: 'node_growth',
      title: 'Personal\nGrowth',
      x: 710,
      y: 80,
      colorHex: '#C6DF9C',
      rotation: -1.2,
      type: 'sticky',
    },
    {
      id: 'node_financial',
      title: 'Financial\nLiteracy',
      x: 180,
      y: 350,
      colorHex: '#D7B7EE',
      rotation: 2.2,
      type: 'sticky',
    },
    {
      id: 'node_impact',
      title: 'Global\nImpact',
      x: 450,
      y: 400,
      colorHex: '#A9C9E9',
      rotation: -1.8,
      type: 'sticky',
    },
    {
      id: 'polaroid_mountains',
      title: 'Aspiration 2026',
      x: 720,
      y: 270,
      colorHex: '#ffffff',
      rotation: 2.8,
      type: 'polaroid',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=60',
    },
  ]);

  // Explicit, editable connection flow graph
  const [connections, setConnections] = useState<CanvasConnection[]>([
    { id: 'c1', fromId: 'hub_main', toId: 'node_ai', style: 'curved' },
    { id: 'c2', fromId: 'hub_main', toId: 'node_gamified', style: 'curved' },
    { id: 'c3', fromId: 'hub_main', toId: 'node_growth', style: 'curved' },
    { id: 'c4', fromId: 'hub_main', toId: 'node_financial', style: 'curved' },
    { id: 'c5', fromId: 'hub_main', toId: 'node_impact', style: 'curved' },
    { id: 'c6', fromId: 'hub_main', toId: 'polaroid_mountains', style: 'dashed' },
  ]);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    // If in arrow connecting mode, handle connection rather than drag
    if (activeTool === 'arrow') {
      e.stopPropagation();
      handleSelectConnectNode(id);
      return;
    }

    e.stopPropagation();
    setDraggingNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      dragStartOffset.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
    }
  };

  const handleMouseMoveStage = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    setNodes(prev => prev.map(n => {
      if (n.id !== draggingNodeId) return n;
      return {
        ...n,
        x: Math.max(10, e.clientX - dragStartOffset.current.x),
        y: Math.max(10, e.clientY - dragStartOffset.current.y),
      };
    }));
  };

  const handleMouseUpStage = () => {
    setDraggingNodeId(null);
  };

  /**
   * Flow connection logic:
   * Clicking note A then note B toggles a flow connection between them!
   */
  const handleSelectConnectNode = (nodeId: string) => {
    if (!connectingSourceId) {
      setConnectingSourceId(nodeId);
    } else if (connectingSourceId === nodeId) {
      // Clicked same node -> deselect
      setConnectingSourceId(null);
    } else {
      // Connect source to target
      handleToggleConnection(connectingSourceId, nodeId);
      setConnectingSourceId(null);
    }
  };

  const handleToggleConnection = (fromId: string, toId: string) => {
    setConnections(prev => {
      const existingIdx = prev.findIndex(
        c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
      );

      if (existingIdx >= 0) {
        // Toggle OFF if already exists
        return prev.filter((_, idx) => idx !== existingIdx);
      } else {
        // Add new connection
        return [
          ...prev,
          {
            id: `conn_${Date.now()}`,
            fromId,
            toId,
            style: arrowStyle,
          },
        ];
      }
    });
  };

  const handleDeleteConnection = (e: React.MouseEvent, connId: string) => {
    e.stopPropagation();
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  // Add custom sticky node on canvas
  const handleAddCanvasNote = () => {
    const colors = ['#F8D979', '#C6DF9C', '#F1A6A6', '#D7B7EE', '#A9C9E9'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNode: CanvasNode = {
      id: `note_${Date.now()}`,
      title: 'New Idea',
      x: 350 + (Math.random() * 80 - 40),
      y: 200 + (Math.random() * 80 - 40),
      colorHex: randomColor,
      rotation: (Math.random() * 4) - 2,
      type: 'sticky',
    };
    setNodes(prev => [...prev, newNode]);
    // Optionally auto-connect to main hub
    setConnections(prev => [
      ...prev,
      { id: `conn_${Date.now()}`, fromId: 'hub_main', toId: newNode.id, style: arrowStyle }
    ]);
  };

  // Add custom shape / hub on canvas
  const handleAddShape = () => {
    const newNode: CanvasNode = {
      id: `shape_${Date.now()}`,
      title: 'Milestone Hub',
      x: 320 + (Math.random() * 60 - 30),
      y: 220 + (Math.random() * 60 - 30),
      colorHex: '#F8D979',
      rotation: 0,
      type: 'hub',
    };
    setNodes(prev => [...prev, newNode]);
  };

  // Add Polaroid photo
  const handleAddPolaroid = () => {
    const photos = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60',
    ];
    const newNode: CanvasNode = {
      id: `polaroid_${Date.now()}`,
      title: 'Studio Inspiration',
      x: 640 + (Math.random() * 40 - 20),
      y: 190 + (Math.random() * 40 - 20),
      colorHex: '#ffffff',
      rotation: (Math.random() * 6) - 3,
      type: 'polaroid',
      imageUrl: photos[Math.floor(Math.random() * photos.length)],
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleDeleteNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (connectingSourceId === id) setConnectingSourceId(null);
  };

  const handleStartEdit = (node: CanvasNode) => {
    setEditingNodeId(node.id);
    setEditTitle(node.title);
  };

  const handleSaveEdit = () => {
    if (editingNodeId) {
      setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, title: editTitle || n.title } : n));
      setEditingNodeId(null);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMoveStage}
      onMouseUp={handleMouseUpStage}
      className="relative w-full max-w-6xl mx-auto px-2 py-2 select-none"
    >
      
      {/* Top Mural Calligraphy Inscription */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-serif italic text-stone-800 dark:text-amber-100 font-bold drop-shadow-xs">
          “Dream bigger, create more.”
        </h2>
      </div>

      {/* Canvas Workspace Surface with Cork / Plaster Texture */}
      <div 
        className="relative w-full h-[600px] sm:h-[640px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl transition-all"
        style={{
          backgroundColor: '#d8c5a8',
          backgroundImage: `
            radial-gradient(circle, rgba(120, 105, 85, 0.15) 1px, transparent 1px),
            linear-gradient(135deg, rgba(255, 252, 235, 0.3) 0%, rgba(216, 197, 168, 0.4) 100%)
          `,
          backgroundSize: '20px 20px, 100% 100%',
          boxShadow: 'inset 0 0 80px rgba(70, 45, 20, 0.25), 0 20px 50px -10px rgba(0,0,0,0.5)',
        }}
      >
        
        {/* Floating Contextual Left Vertical Toolbar */}
        <div className="absolute top-6 left-6 z-40 flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-black/60 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <button
            type="button"
            onClick={() => {
              setActiveTool('select');
              setConnectingSourceId(null);
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'select' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Selection & Move Tool"
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('sticky');
              handleAddCanvasNote();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'sticky' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Add Sticky Note to Canvas"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('arrow');
              setArrowStyle(prev => prev === 'curved' ? 'straight' : prev === 'straight' ? 'dashed' : 'curved');
            }}
            className={`relative p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'arrow' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title={`Flow Connector Tool (Click to toggle style: ${arrowStyle})`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('shape');
              handleAddShape();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'shape' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Add Mindmap Milestone Shape"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'pen' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Highlighter Pen Mode"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('image');
              handleAddPolaroid();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'image' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Attach Polaroid Image Card"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {onToggle3DSpatial && (
            <>
              <div className="w-full h-px bg-white/20 my-1" />
              <button
                type="button"
                onClick={onToggle3DSpatial}
                className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 transition cursor-pointer group relative"
                title="Launch 3D Spatial Canvas Stage ↗"
              >
                <Box className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Dynamic Instruction Banner for Flow Mode */}
        {activeTool === 'arrow' && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-amber-400/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              {connectingSourceId 
                ? "Click any target note to connect (or remove link). Click source again to cancel."
                : "Flow Mode: Click any note to start connection flow."}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-mono text-amber-300">
              Style: {arrowStyle}
            </span>
          </div>
        )}

        {/* Zoomed Canvas Container (Both SVG Connections and Nodes scaled synchronously!) */}
        <div 
          className="relative w-full h-full"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        >
          
          {/* ===================================================================
              SVG ARROW CONNECTIONS LAYER (Clipped Strictly to Outer Card Edges!)
              =================================================================== */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto z-10 overflow-visible">
            <defs>
              <marker 
                id="arrowhead-knovera" 
                markerWidth="9" 
                markerHeight="7" 
                refX="8" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0.5, 8.5 3.5, 0 6.5, 2.5 3.5" fill="#383028" />
              </marker>
            </defs>

            {connections.map(conn => {
              const nodeA = nodes.find(n => n.id === conn.fromId);
              const nodeB = nodes.find(n => n.id === conn.toId);
              if (!nodeA || !nodeB) return null;

              const boxA = getNodeDimensions(nodeA);
              const boxB = getNodeDimensions(nodeB);

              // Precise edge intersection: starts outside card A, terminates outside card B
              const startPt = getClippedEdgePoint(boxA, boxB, 4);
              const endPt = getClippedEdgePoint(boxB, boxA, 8);

              const dx = endPt.x - startPt.x;
              const dy = endPt.y - startPt.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              // Quadratic Bezier control point for organic hand-drawn arc
              const midX = (startPt.x + endPt.x) / 2;
              const midY = (startPt.y + endPt.y) / 2;
              const perpX = -dy / dist;
              const perpY = dx / dist;
              const curveMagnitude = conn.style === 'straight' ? 0 : 22;

              const ctrlX = Math.round(midX + perpX * curveMagnitude);
              const ctrlY = Math.round(midY + perpY * curveMagnitude);

              const pathD = conn.style === 'straight'
                ? `M ${startPt.x} ${startPt.y} L ${endPt.x} ${endPt.y}`
                : `M ${startPt.x} ${startPt.y} Q ${ctrlX} ${ctrlY} ${endPt.x} ${endPt.y}`;

              return (
                <g key={conn.id} className="group/line cursor-pointer">
                  {/* Invisible wide hit area for easy hover/clicking */}
                  <path
                    d={pathD}
                    stroke="transparent"
                    strokeWidth="18"
                    fill="none"
                    onClick={(e) => handleDeleteConnection(e, conn.id)}
                  />

                  {/* Visible aesthetic connection path */}
                  <path
                    d={pathD}
                    stroke="#383028"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.75"
                    markerEnd="url(#arrowhead-knovera)"
                    strokeDasharray={conn.style === 'dashed' || nodeB.type === 'polaroid' ? '5 5' : 'none'}
                    className="transition-all duration-150 group-hover/line:stroke-amber-600 group-hover/line:stroke-[3.5]"
                  />

                  {/* Midpoint interactive delete pill on hover */}
                  <g 
                    onClick={(e) => handleDeleteConnection(e, conn.id)}
                    transform={`translate(${ctrlX}, ${ctrlY})`}
                    className="opacity-0 group-hover/line:opacity-100 transition-opacity cursor-pointer"
                  >
                    <circle r="9" fill="#e11d48" className="shadow-md" />
                    <text textAnchor="middle" dy="3.5" fill="#ffffff" fontSize="9" fontWeight="bold">×</text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* ===================================================================
              BRAINSTORM NODES LAYER (At z-20 so card surfaces remain clean & opaque)
              =================================================================== */}
          {nodes.map(node => {
            const isSource = connectingSourceId === node.id;
            const isConnectTarget = activeTool === 'arrow' && connectingSourceId && connectingSourceId !== node.id;

            // 1. CENTRAL / MILESTONE HUB
            if (node.type === 'hub') {
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  onDoubleClick={() => handleStartEdit(node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className={`group absolute z-20 w-36 h-24 rounded-[40px] bg-[#F8D979] border-2 border-dashed border-[#695747] shadow-xl flex items-center justify-center p-3 text-center transition-all select-none ${
                    isSource 
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                      : isConnectTarget 
                      ? 'hover:ring-4 hover:ring-amber-400 hover:scale-105 cursor-pointer' 
                      : 'cursor-grab active:cursor-grabbing hover:scale-102'
                  }`}
                  title={activeTool === 'arrow' ? 'Click to connect or disconnect' : 'Drag to move • Double-click to edit'}
                >
                  {editingNodeId === node.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="w-full text-center font-handwriting font-bold text-sm bg-transparent border-b border-stone-800 focus:outline-none"
                    />
                  ) : (
                    <span className="font-handwriting font-extrabold text-xl text-[#25231F] leading-tight whitespace-pre-line pointer-events-none">
                      {node.title}
                    </span>
                  )}

                  {/* Flow connect handle button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTool('arrow');
                      handleSelectConnectNode(node.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[9px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                    title="Connect flow to another note"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>Connect</span>
                  </button>

                  {/* Delete button (non-main nodes) */}
                  {node.id !== 'hub_main' && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNode(e, node.id)}
                      className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 text-white text-[9px] hover:bg-rose-600 transition shadow-sm cursor-pointer"
                      title="Delete hub"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }

            // 2. POLAROID PHOTO CARD
            if (node.type === 'polaroid') {
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  onDoubleClick={() => handleStartEdit(node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className={`group absolute z-20 w-32 p-2 pb-3 bg-white border border-stone-200 shadow-xl rounded-sm transition-all select-none ${
                    isSource 
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                      : isConnectTarget 
                      ? 'hover:ring-4 hover:ring-amber-400 hover:scale-105 cursor-pointer' 
                      : 'cursor-grab active:cursor-grabbing hover:scale-102'
                  }`}
                  title={activeTool === 'arrow' ? 'Click to connect or disconnect' : 'Drag to move • Double-click to edit'}
                >
                  {/* Washi tape pin */}
                  <div className="absolute -top-2 left-8 w-12 h-4 bg-amber-100/90 border border-amber-300/60 rotate-6 shadow-2xs pointer-events-none" />
                  
                  {/* Photo Thumbnail */}
                  <div className="w-full h-24 bg-stone-200 overflow-hidden rounded-xs mb-1.5 pointer-events-none">
                    <img 
                      src={node.imageUrl} 
                      alt={node.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {editingNodeId === node.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="w-full text-center font-handwriting font-bold text-xs bg-transparent border-b border-stone-800 focus:outline-none"
                    />
                  ) : (
                    <span className="block text-center font-handwriting text-xs text-stone-700 font-bold truncate pointer-events-none">
                      {node.title}
                    </span>
                  )}

                  {/* Flow connect handle button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTool('arrow');
                      handleSelectConnectNode(node.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[9px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                    title="Connect flow to another note"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>Connect</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteNode(e, node.id)}
                    className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 text-white text-[9px] hover:bg-rose-600 transition shadow-sm cursor-pointer"
                    title="Delete polaroid"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            // 3. PHYSICAL STICKY NOTE (With Ruled Lines & Pushpin)
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onDoubleClick={() => handleStartEdit(node)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  backgroundColor: node.colorHex,
                  transform: `rotate(${node.rotation}deg)`,
                }}
                className={`group absolute z-20 w-32 h-32 p-3 pt-5 rounded-2xl border border-black/10 shadow-lg flex flex-col justify-between transition-all select-none paper-ruling-lines overflow-hidden ${
                  isSource 
                    ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                    : isConnectTarget 
                    ? 'hover:ring-4 hover:ring-amber-400 hover:scale-105 cursor-pointer' 
                    : 'cursor-grab active:cursor-grabbing hover:scale-102 hover:z-30'
                }`}
                title={activeTool === 'arrow' ? 'Click to connect or disconnect' : 'Drag to move • Double-click to edit'}
              >
                {/* 3D Pushpin on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <RedPushPin size={24} color="cyan" />
                </div>

                {/* Top translucent adhesive strip */}
                <div className="sticky-adhesive-strip pointer-events-none" />

                {/* Corner curl */}
                <div className="paper-dogear-curl pointer-events-none" />

                {editingNodeId === node.id ? (
                  <textarea
                    autoFocus
                    rows={2}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveEdit}
                    className="w-full font-handwriting text-sm font-bold text-stone-900 bg-transparent border-b border-stone-800 focus:outline-none resize-none z-10"
                  />
                ) : (
                  <p className="font-handwriting text-sm font-bold text-stone-900 leading-snug whitespace-pre-line z-10 pointer-events-none">
                    {node.title}
                  </p>
                )}

                <div className="flex items-center justify-between text-[9px] font-mono text-stone-700/80 z-10">
                  <span>Idea</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNode(e, node.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-700 hover:text-rose-900 transition cursor-pointer"
                    title="Delete idea"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Flow connect handle button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTool('arrow');
                    handleSelectConnectNode(node.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[8px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 z-20 cursor-pointer"
                  title="Connect flow to another note"
                >
                  <Link2 className="w-2.5 h-2.5" />
                  <span>Connect</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Right Floating Zoom & Pan Controls Bar */}
        <div className="absolute bottom-6 right-6 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-mono text-xs font-bold text-amber-300">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

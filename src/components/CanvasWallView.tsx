import React, { useState, useRef } from 'react';
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
  Trash2 
} from 'lucide-react';
import { Task, Project } from '../types';
import { RedPushPin } from './RedPushPin';

interface CanvasNode {
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

interface CanvasWallViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onQuickAdd: () => void;
}

export const CanvasWallView: React.FC<CanvasWallViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onQuickAdd,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'arrow' | 'shape' | 'pen' | 'image'>('select');

  // Default brainstorm nodes from visual reference mockup
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: 'hub_main',
      title: 'Knovera\nVision',
      x: 430,
      y: 220,
      colorHex: '#F8D979',
      rotation: 0,
      type: 'hub',
    },
    {
      id: 'node_ai',
      title: 'AI Powered\nProductivity',
      x: 180,
      y: 110,
      colorHex: '#F8D979',
      rotation: -2,
      type: 'sticky',
    },
    {
      id: 'node_gamified',
      title: 'Gamified\nLearning',
      x: 420,
      y: 80,
      colorHex: '#F1A6A6',
      rotation: 1.5,
      type: 'sticky',
    },
    {
      id: 'node_growth',
      title: 'Personal\nGrowth',
      x: 650,
      y: 100,
      colorHex: '#C6DF9C',
      rotation: -1.2,
      type: 'sticky',
    },
    {
      id: 'node_financial',
      title: 'Financial\nLiteracy',
      x: 190,
      y: 330,
      colorHex: '#D7B7EE',
      rotation: 2.2,
      type: 'sticky',
    },
    {
      id: 'node_impact',
      title: 'Global\nImpact',
      x: 450,
      y: 380,
      colorHex: '#A9C9E9',
      rotation: -1.8,
      type: 'sticky',
    },
    {
      id: 'polaroid_mountains',
      title: 'Aspiration 2026',
      x: 680,
      y: 260,
      colorHex: '#ffffff',
      rotation: 2.8,
      type: 'polaroid',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=60',
    },
  ]);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
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
        x: Math.max(20, e.clientX - dragStartOffset.current.x),
        y: Math.max(20, e.clientY - dragStartOffset.current.y),
      };
    }));
  };

  const handleMouseUpStage = () => {
    setDraggingNodeId(null);
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
  };

  const hubNode = nodes.find(n => n.type === 'hub') || nodes[0];

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
        className="relative w-full h-[580px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl transition-all"
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
        <div className="absolute top-6 left-6 z-30 flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-black/60 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'select' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Selection Tool"
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
            onClick={() => setActiveTool('arrow')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'arrow' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Connector Arrows"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('shape')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'shape' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Mindmap Shapes"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'pen' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Pen / Marker"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('image')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'image' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Attach Polaroid Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* SVG Curved Connecting Arrows radiating from central Hub */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#25231F" opacity="0.75" />
            </marker>
          </defs>

          {hubNode && nodes.filter(n => n.id !== hubNode.id).map(node => {
            const hx = hubNode.x + 60;
            const hy = hubNode.y + 40;
            const nx = node.x + 60;
            const ny = node.y + 40;
            const mx = (hx + nx) / 2;
            const my = (hy + ny) / 2 - 25; // curved arc

            return (
              <path
                key={`line_${node.id}`}
                d={`M ${hx} ${hy} Q ${mx} ${my} ${nx} ${ny}`}
                stroke="#25231F"
                strokeWidth="2.5"
                fill="none"
                opacity="0.65"
                markerEnd="url(#arrowhead)"
                strokeDasharray={node.type === 'polaroid' ? '4 4' : 'none'}
              />
            );
          })}
        </svg>

        {/* Brainstorm Nodes Container */}
        <div 
          className="relative w-full h-full"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        >
          {nodes.map(node => {
            if (node.type === 'hub') {
              // Central Mindmap Hub (Oval with double border)
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className="absolute z-20 w-36 h-24 rounded-[40px] bg-[#F8D979] border-2 border-dashed border-[#695747] shadow-xl flex items-center justify-center p-3 text-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                >
                  <span className="font-handwriting font-extrabold text-xl text-[#25231F] leading-tight whitespace-pre-line">
                    {node.title}
                  </span>
                </div>
              );
            }

            if (node.type === 'polaroid') {
              // Polaroid Photo with Washi Tape
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className="absolute z-20 w-32 p-2 pb-3 bg-white border border-stone-200 shadow-xl rounded-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                >
                  {/* Washi tape pin */}
                  <div className="absolute -top-2 left-8 w-12 h-4 bg-amber-100/80 border border-amber-300/60 rotate-6 shadow-2xs" />
                  
                  {/* Landscape Image */}
                  <div className="w-full h-24 bg-stone-200 overflow-hidden rounded-xs mb-1.5">
                    <img 
                      src={node.imageUrl} 
                      alt={node.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="block text-center font-handwriting text-xs text-stone-700 font-bold truncate">
                    {node.title}
                  </span>
                </div>
              );
            }

            // Tactile Sticky Notes
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  backgroundColor: node.colorHex,
                  transform: `rotate(${node.rotation}deg)`,
                }}
                className="absolute z-20 w-32 h-32 p-3 pt-5 rounded-2xl border border-black/10 shadow-lg flex flex-col justify-between cursor-grab active:cursor-grabbing hover:scale-105 hover:z-30 transition-transform select-none"
              >
                {/* 3D Pushpin on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                  <RedPushPin size={24} color="cyan" />
                </div>

                <p className="font-handwriting text-sm font-bold text-stone-900 leading-snug whitespace-pre-line">
                  {node.title}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono text-stone-700/80">
                  <span>Idea</span>
                  <span>✦</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Right Floating Zoom & Pan Controls Bar */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
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
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

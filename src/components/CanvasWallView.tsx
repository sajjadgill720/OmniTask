import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Box,
  Copy,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Palette,
  Check,
  Upload
} from 'lucide-react';
import { Task, Project, CanvasElement, CanvasConnection, NoteShape, LineStyle, PinStyle } from '../types';
import { RedPushPin } from './RedPushPin';
import { saveImageToStorage, validateImageFile } from '../utils/imageStorage';
import { useToast } from './ToastNotification';

interface CanvasWallViewProps {
  tasks: Task[];
  projects: Project[];
  elements: CanvasElement[];
  onUpdateElements: (elements: CanvasElement[]) => void;
  connections: CanvasConnection[];
  onUpdateConnections: (connections: CanvasConnection[]) => void;
  onSelectTask: (task: Task) => void;
  onQuickAdd: () => void;
  onToggle3DSpatial?: () => void;
}

interface HistorySnapshot {
  elements: CanvasElement[];
  connections: CanvasConnection[];
}

/**
 * Calculates exact center and bounding dimensions of each node type
 */
function getNodeDimensions(node: CanvasElement): { cx: number; cy: number; w: number; h: number } {
  const w = node.width || (node.type === 'hub' ? 144 : node.type === 'photo' ? 140 : 130);
  const h = node.height || (node.type === 'hub' ? 96 : node.type === 'photo' ? 175 : 130);
  return { cx: node.x + w / 2, cy: node.y + h / 2, w, h };
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

const PALETTE_COLORS = [
  { name: 'Canary Yellow', hex: '#F8D979' },
  { name: 'Peach Coral', hex: '#F1A6A6' },
  { name: 'Mint Green', hex: '#C6DF9C' },
  { name: 'Lavender', hex: '#D7B7EE' },
  { name: 'Sky Blue', hex: '#A9C9E9' },
  { name: 'Sage Green', hex: '#A8C3B2' },
  { name: 'Warm White', hex: '#FAF7F2' },
];

export const CanvasWallView: React.FC<CanvasWallViewProps> = ({
  tasks,
  projects,
  elements,
  onUpdateElements,
  connections,
  onUpdateConnections,
  onSelectTask,
  onQuickAdd,
  onToggle3DSpatial,
}) => {
  const { toast } = useToast();

  // Viewport Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'arrow' | 'shape' | 'pen' | 'image'>('select');
  const [arrowStyle, setArrowStyle] = useState<'curved' | 'dashed' | 'straight'>('curved');

  // Selection & Editing State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  // Connecting flow state: stores source node ID when in connection mode
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Hidden File Input for Multiple Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistorySnapshot[]>([{ elements, connections }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Clipboard for Copy / Paste
  const clipboardRef = useRef<CanvasElement[]>([]);

  // Dragging & Transforming Nodes State
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragStartMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resizing & Rotating Node State
  const [transformingNodeId, setTransformingNodeId] = useState<string | null>(null);
  const [transformType, setTransformType] = useState<'resize' | 'rotate' | null>(null);
  const transformHandleRef = useRef<string>('');
  const transformStartRef = useRef<{ x: number; y: number; w: number; h: number; rot: number; mouseX: number; mouseY: number }>({
    x: 0, y: 0, w: 0, h: 0, rot: 0, mouseX: 0, mouseY: 0,
  });

  const pushHistory = useCallback((newElements: CanvasElement[], newConnections: CanvasConnection[]) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { elements: newElements, connections: newConnections }].slice(-25); // Limit 25 snapshots
    });
    setHistoryIndex(prev => Math.min(prev + 1, 24));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      setHistoryIndex(targetIndex);
      onUpdateElements(snapshot.elements);
      onUpdateConnections(snapshot.connections);
      toast.info('Undone');
    }
  }, [historyIndex, history, onUpdateElements, onUpdateConnections, toast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      setHistoryIndex(targetIndex);
      onUpdateElements(snapshot.elements);
      onUpdateConnections(snapshot.connections);
      toast.info('Redone');
    }
  }, [historyIndex, history, onUpdateElements, onUpdateConnections, toast]);

  // Keyboard Shortcuts: Undo, Redo, Copy, Paste, Delete, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setEditingNodeId(null);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        // Copy selected elements
        if (selectedIds.length > 0) {
          clipboardRef.current = elements.filter(el => selectedIds.includes(el.id));
          toast.info(`Copied ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        // Paste copied elements with slight offset
        if (clipboardRef.current.length > 0) {
          e.preventDefault();
          const pasted: CanvasElement[] = clipboardRef.current.map(item => ({
            ...item,
            id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            x: item.x + 35,
            y: item.y + 35,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          const updated = [...elements, ...pasted];
          onUpdateElements(updated);
          pushHistory(updated, connections);
          setSelectedIds(pasted.map(p => p.id));
          toast.success(`Pasted ${pasted.length} element${pasted.length > 1 ? 's' : ''}`);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        setSelectedIds([]);
        setConnectingSourceId(null);
        setEditingNodeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements, connections, handleUndo, handleRedo, pushHistory, onUpdateElements, toast]);

  // Multiple File Upload Handler
  const handleProcessFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('No supported image files detected.');
      return;
    }

    setIsUploadingImages(true);
    const newElements: CanvasElement[] = [];

    // Base position in viewport
    const startX = Math.round(300 - panOffset.x);
    const startY = Math.round(200 - panOffset.y);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid file');
          continue;
        }

        const stored = await saveImageToStorage(file);
        const col = i % 4;
        const row = Math.floor(i / 4);

        const newPhoto: CanvasElement = {
          id: `photo_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'photo',
          title: file.name.replace(/\.[^/.]+$/, ''),
          caption: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Inspiration',
          x: Math.max(40, startX + col * 160),
          y: Math.max(40, startY + row * 200),
          width: 140,
          height: 180,
          rotation: Math.round((Math.random() * 6 - 3) * 10) / 10,
          colorHex: '#ffffff',
          pinStyle: 'tape',
          imageUrl: stored.objectUrl,
          thumbnailUrl: stored.thumbnailUrl,
          imageStorageId: stored.id,
          aspectRatio: stored.aspectRatio,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newElements.push(newPhoto);
      }

      if (newElements.length > 0) {
        const updated = [...elements, ...newElements];
        onUpdateElements(updated);
        pushHistory(updated, connections);
        setSelectedIds(newElements.map(p => p.id));
        toast.success(`Added ${newElements.length} photograph${newElements.length > 1 ? 's' : ''} to Canvas!`);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err?.message || 'Failed to process images');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  // Drag and drop images directly onto the canvas surface
  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (!isDragOverCanvas) setIsDragOverCanvas(true);
    }
  };

  const handleCanvasDragLeave = () => {
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Node Click & Selection Handling
  const handleSelectNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // If connecting flow tool is active, perform connection logic
    if (activeTool === 'arrow') {
      handleFlowConnect(id);
      return;
    }

    if (e.shiftKey) {
      // Toggle in multi-select
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool === 'arrow') return;
    if ((e.target as HTMLElement).closest('.resize-handle, .rotate-handle, button, textarea, input')) return;

    e.stopPropagation();
    setIsDraggingNode(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };

    // If dragging a non-selected element without shift, select it exclusively
    let currentSelection = selectedIds;
    if (!selectedIds.includes(id)) {
      currentSelection = [id];
      setSelectedIds([id]);
    }

    // Record starting positions of all dragged elements
    const startMap = new Map<string, { x: number; y: number }>();
    elements.forEach(el => {
      if (currentSelection.includes(el.id)) {
        startMap.set(el.id, { x: el.x, y: el.y });
      }
    });
    dragStartPositions.current = startMap;
  };

  // Transform (Resize & Rotate) Start
  const handleTransformStart = (e: React.MouseEvent, id: string, type: 'resize' | 'rotate', handle: string) => {
    e.stopPropagation();
    const node = elements.find(el => el.id === id);
    if (!node) return;

    setTransformingNodeId(id);
    setTransformType(type);
    transformHandleRef.current = handle;

    const w = node.width || (node.type === 'hub' ? 144 : node.type === 'photo' ? 140 : 130);
    const h = node.height || (node.type === 'hub' ? 96 : node.type === 'photo' ? 175 : 130);

    transformStartRef.current = {
      x: node.x,
      y: node.y,
      w,
      h,
      rot: node.rotation || 0,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  // Canvas Mouse Move (Dragging elements, resizing, rotating, panning)
  const handleMouseMoveStage = (e: React.MouseEvent) => {
    const scale = zoomLevel / 100;

    // 1. Pan Canvas Viewport (Middle mouse or Space+Drag)
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Dragging Elements
    if (isDraggingNode && dragStartPositions.current.size > 0) {
      const dx = (e.clientX - dragStartMouse.current.x) / scale;
      const dy = (e.clientY - dragStartMouse.current.y) / scale;

      onUpdateElements(elements.map(el => {
        const start = dragStartPositions.current.get(el.id);
        if (!start) return el;
        return {
          ...el,
          x: Math.max(10, Math.round(start.x + dx)),
          y: Math.max(10, Math.round(start.y + dy)),
          updatedAt: new Date().toISOString(),
        };
      }));
      return;
    }

    // 3. Resizing Element
    if (transformingNodeId && transformType === 'resize') {
      const { x, y, w, h, mouseX, mouseY } = transformStartRef.current;
      const dx = (e.clientX - mouseX) / scale;
      const dy = (e.clientY - mouseY) / scale;
      const handle = transformHandleRef.current;

      let newW = w;
      let newH = h;
      let newX = x;
      let newY = y;

      if (handle.includes('e')) newW = Math.max(80, Math.round(w + dx));
      if (handle.includes('s')) newH = Math.max(80, Math.round(h + dy));
      if (handle.includes('w')) {
        const possibleW = Math.max(80, Math.round(w - dx));
        newX = Math.round(x + (w - possibleW));
        newW = possibleW;
      }
      if (handle.includes('n')) {
        const possibleH = Math.max(80, Math.round(h - dy));
        newY = Math.round(y + (h - possibleH));
        newH = possibleH;
      }

      onUpdateElements(elements.map(el => {
        if (el.id !== transformingNodeId) return el;
        return { ...el, x: newX, y: newY, width: newW, height: newH, updatedAt: new Date().toISOString() };
      }));
      return;
    }

    // 4. Rotating Element
    if (transformingNodeId && transformType === 'rotate') {
      const node = elements.find(el => el.id === transformingNodeId);
      if (!node) return;
      const dims = getNodeDimensions(node);
      const centerScreenX = (dims.cx + panOffset.x) * scale;
      const centerScreenY = (dims.cy + panOffset.y) * scale;

      const angleRad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
      let angleDeg = Math.round((angleRad * (180 / Math.PI)) + 90);
      if (angleDeg > 180) angleDeg -= 360;

      onUpdateElements(elements.map(el => {
        if (el.id !== transformingNodeId) return el;
        return { ...el, rotation: angleDeg, updatedAt: new Date().toISOString() };
      }));
    }
  };

  const handleMouseUpStage = () => {
    if (isDraggingNode || transformingNodeId) {
      pushHistory(elements, connections);
    }
    setIsDraggingNode(false);
    setTransformingNodeId(null);
    setTransformType(null);
    setIsPanning(false);
  };

  // Double-Click Inline Text Edit
  const handleStartEdit = (node: CanvasElement) => {
    setEditingNodeId(node.id);
    setEditTitle(node.caption || node.title);
  };

  const handleSaveEdit = () => {
    if (!editingNodeId) return;
    const updated = elements.map(n => {
      if (n.id !== editingNodeId) return n;
      return {
        ...n,
        title: editTitle.trim() || n.title,
        caption: n.type === 'photo' ? editTitle.trim() : n.caption,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateElements(updated);
    pushHistory(updated, connections);
    setEditingNodeId(null);
  };

  // Arrow Flow Connection Logic
  const handleFlowConnect = (targetId: string) => {
    if (!connectingSourceId) {
      setConnectingSourceId(targetId);
      toast.info('Click target note to create flow connection');
      return;
    }

    if (connectingSourceId === targetId) {
      setConnectingSourceId(null);
      return;
    }

    // Toggle existing connection if present
    const existing = connections.find(
      c => (c.fromId === connectingSourceId && c.toId === targetId) ||
           (c.fromId === targetId && c.toId === connectingSourceId)
    );

    let updatedConns: CanvasConnection[];
    if (existing) {
      updatedConns = connections.filter(c => c.id !== existing.id);
      toast.info('Removed flow connection');
    } else {
      const newConn: CanvasConnection = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromId: connectingSourceId,
        toId: targetId,
        style: arrowStyle,
      };
      updatedConns = [...connections, newConn];
      toast.success('Connected ideas!');
    }

    onUpdateConnections(updatedConns);
    pushHistory(elements, updatedConns);
    setConnectingSourceId(null);
  };

  // Delete Selected Elements
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    const remainingElements = elements.filter(el => !selectedIds.includes(el.id));
    const remainingConnections = connections.filter(
      c => !selectedIds.includes(c.fromId) && !selectedIds.includes(c.toId)
    );

    const deletedCount = selectedIds.length;
    onUpdateElements(remainingElements);
    onUpdateConnections(remainingConnections);
    pushHistory(remainingElements, remainingConnections);
    setSelectedIds([]);

    toast.info(`Deleted ${deletedCount} item${deletedCount > 1 ? 's' : ''}`, {
      label: 'Undo',
      onClick: handleUndo,
    });
  };

  // Duplicate Selected Elements
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;

    const duplicates: CanvasElement[] = elements
      .filter(el => selectedIds.includes(el.id))
      .map(item => ({
        ...item,
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        x: item.x + 35,
        y: item.y + 35,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    const updated = [...elements, ...duplicates];
    onUpdateElements(updated);
    pushHistory(updated, connections);
    setSelectedIds(duplicates.map(d => d.id));
    toast.success(`Duplicated ${duplicates.length} item${duplicates.length > 1 ? 's' : ''}`);
  };

  // Change Color of Selected Elements
  const handleChangeColor = (hex: string) => {
    if (selectedIds.length === 0) return;
    const updated = elements.map(el => 
      selectedIds.includes(el.id) ? { ...el, colorHex: hex, updatedAt: new Date().toISOString() } : el
    );
    onUpdateElements(updated);
    pushHistory(updated, connections);
  };

  // Alignment Helpers for Multiple Selected Items
  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selected.forEach(el => {
      const dims = getNodeDimensions(el);
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + dims.w);
      minY = Math.min(minY, el.y);
      maxY = Math.max(maxY, el.y + dims.h);
    });

    const updated = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const dims = getNodeDimensions(el);
      let newX = el.x;
      let newY = el.y;

      if (type === 'left') newX = minX;
      if (type === 'center') newX = Math.round((minX + maxX) / 2 - dims.w / 2);
      if (type === 'right') newX = Math.round(maxX - dims.w);
      if (type === 'top') newY = minY;
      if (type === 'middle') newY = Math.round((minY + maxY) / 2 - dims.h / 2);
      if (type === 'bottom') newY = Math.round(maxY - dims.h);

      return { ...el, x: newX, y: newY, updatedAt: new Date().toISOString() };
    });

    onUpdateElements(updated);
    pushHistory(updated, connections);
    toast.info(`Aligned ${type}`);
  };

  // Primary Single Selected Element for Contextual Toolbar
  const singleSelectedElement = selectedIds.length === 1 ? elements.find(el => el.id === selectedIds[0]) : null;

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 select-none"
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      {/* Hidden File Input for Multiple Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 2D Canvas Workspace Surface */}
      <div 
        onMouseDown={(e) => {
          if (e.button === 1 || (e.button === 0 && e.altKey)) {
            // Middle click or Alt+click pans canvas
            setIsPanning(true);
            panStartRef.current = { x: e.clientX, y: e.clientY };
            return;
          }
          if (!(e.target as HTMLElement).closest('.canvas-node, .floating-toolbar, button')) {
            setSelectedIds([]);
            setConnectingSourceId(null);
          }
        }}
        onMouseMove={handleMouseMoveStage}
        onMouseUp={handleMouseUpStage}
        className={`relative w-full min-h-[720px] rounded-3xl overflow-hidden shadow-2xl border transition-colors ${
          isDragOverCanvas 
            ? 'border-amber-400 ring-4 ring-amber-400/30' 
            : 'border-[#695747]/25'
        }`}
        style={{
          backgroundColor: '#F6EBDD',
          backgroundImage: `
            radial-gradient(circle, rgba(105, 87, 71, 0.16) 1.5px, transparent 1.5px),
            linear-gradient(135deg, rgba(255, 248, 238, 0.7) 0%, rgba(235, 218, 196, 0.4) 100%)
          `,
          backgroundSize: '24px 24px, 100% 100%',
          boxShadow: 'inset 0 0 100px rgba(70, 45, 20, 0.22), 0 20px 50px -10px rgba(0,0,0,0.45)',
        }}
      >
        {/* Drag-over overlay feedback */}
        {isDragOverCanvas && (
          <div className="absolute inset-0 z-50 bg-amber-500/10 backdrop-blur-xs border-4 border-dashed border-amber-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
            <Upload className="w-12 h-12 text-amber-500 animate-bounce mb-2" />
            <span className="text-stone-900 font-black text-lg">Drop Photographs to Pin to Canvas Wall</span>
            <span className="text-stone-700 text-xs">Supports multiple JPEG, PNG, and WebP images</span>
          </div>
        )}

        {/* ===================================================================
            LEFT FLOATING TOOLBAR
            =================================================================== */}
        <div className="absolute top-6 left-6 z-40 flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-black/65 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <button
            type="button"
            onClick={() => {
              setActiveTool('select');
              setConnectingSourceId(null);
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'select' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Selection & Move Tool (V)"
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('sticky');
              const newSticky: CanvasElement = {
                id: `node_${Date.now()}`,
                type: 'sticky',
                title: 'New Idea',
                x: Math.round(250 - panOffset.x + Math.random() * 40),
                y: Math.round(180 - panOffset.y + Math.random() * 40),
                width: 130,
                height: 130,
                colorHex: '#F8D979',
                rotation: Math.round((Math.random() * 4 - 2) * 10) / 10,
                lineStyle: 'ruled',
                pinStyle: 'pin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              const updated = [...elements, newSticky];
              onUpdateElements(updated);
              pushHistory(updated, connections);
              setSelectedIds([newSticky.id]);
              toast.success('Sticky note added');
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'sticky' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Add Sticky Note"
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
            title={`Flow Connector Tool (Style: ${arrowStyle})`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('shape');
              const newHub: CanvasElement = {
                id: `hub_${Date.now()}`,
                type: 'hub',
                title: 'Milestone Hub',
                category: 'Goal',
                x: Math.round(350 - panOffset.x),
                y: Math.round(220 - panOffset.y),
                width: 144,
                height: 96,
                colorHex: '#F8D979',
                rotation: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              const updated = [...elements, newHub];
              onUpdateElements(updated);
              pushHistory(updated, connections);
              setSelectedIds([newHub.id]);
              toast.success('Milestone Hub added');
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'shape' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Add Milestone Hub"
          >
            <Circle className="w-4 h-4" />
          </button>

          {/* Multiple Photo Upload Button */}
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeTool === 'image' || isUploadingImages ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Upload Multiple Photos from Device"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Undo & Redo buttons */}
          <div className="w-full h-px bg-white/20 my-1" />

          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className={`p-2 rounded-xl transition cursor-pointer ${
              historyIndex > 0 ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
            }`}
            title="Undo (Cmd/Ctrl + Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className={`p-2 rounded-xl transition cursor-pointer ${
              historyIndex < history.length - 1 ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
            }`}
            title="Redo (Cmd/Ctrl + Shift + Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* 3D Spatial Canvas Cube Button */}
          {onToggle3DSpatial && (
            <>
              <div className="w-full h-px bg-white/20 my-1" />
              <button
                type="button"
                onClick={onToggle3DSpatial}
                className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 transition cursor-pointer group relative"
                title="Switch to 3D Spatial View (Cube)"
              >
                <Box className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Dynamic Instruction Banner for Flow Connector Mode */}
        {activeTool === 'arrow' && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-amber-400/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              {connectingSourceId 
                ? "Click any target note or photo to connect (or remove link). Click source again to cancel."
                : "Flow Mode: Click any note to start connection flow."}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-mono text-amber-300">
              Style: {arrowStyle}
            </span>
          </div>
        )}

        {/* ===================================================================
            CONTEXTUAL FLOATING TOOLBAR (Positioned dynamically on Selection)
            =================================================================== */}
        {selectedIds.length > 0 && (
          <div className="absolute top-6 right-24 z-40 flex items-center gap-2 p-2 rounded-2xl bg-[#25231F]/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white text-xs font-semibold animate-in fade-in">
            
            {/* Color Palette (When sticky or hub selected) */}
            {singleSelectedElement && singleSelectedElement.type !== 'photo' && (
              <div className="flex items-center gap-1.5 pr-2 border-r border-white/15">
                {PALETTE_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handleChangeColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full border border-black/20 transition hover:scale-110 cursor-pointer ${
                      singleSelectedElement.colorHex === c.hex ? 'ring-2 ring-white ring-offset-1 ring-offset-stone-900' : ''
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            {/* Multi-Selection Alignment Controls */}
            {selectedIds.length > 1 && (
              <div className="flex items-center gap-1 pr-2 border-r border-white/15">
                <button
                  type="button"
                  onClick={() => handleAlign('left')}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign('center')}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign('right')}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handleDuplicateSelected}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition flex items-center gap-1 text-[11px]"
              title="Duplicate (Cmd/Ctrl + C & V)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition flex items-center gap-1 text-[11px]"
              title="Delete Selected (Delete key)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* ===================================================================
            CANVAS ZOOM & PAN CONTAINER
            =================================================================== */}
        <div 
          className="relative w-full h-full min-h-[720px] overflow-visible"
          style={{ 
            transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`, 
            transformOrigin: 'top left',
            transition: isPanning || isDraggingNode ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* ===================================================================
              SVG RELATIONSHIP CONNECTION BEAMS
              =================================================================== */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible z-10" style={{ minWidth: 2000, minHeight: 2000 }}>
            <defs>
              <marker
                id="arrowhead-knovera"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#383028" />
              </marker>
            </defs>

            {connections.map(conn => {
              const nodeA = elements.find(n => n.id === conn.fromId);
              const nodeB = elements.find(n => n.id === conn.toId);
              if (!nodeA || !nodeB) return null;

              const boxA = getNodeDimensions(nodeA);
              const boxB = getNodeDimensions(nodeB);

              const startPt = getClippedEdgePoint(boxA, boxB, 4);
              const endPt = getClippedEdgePoint(boxB, boxA, 8);

              const dx = endPt.x - startPt.x;
              const dy = endPt.y - startPt.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

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
                  {/* Invisible wide hit area */}
                  <path
                    d={pathD}
                    stroke="transparent"
                    strokeWidth="18"
                    fill="none"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = connections.filter(c => c.id !== conn.id);
                      onUpdateConnections(updated);
                      pushHistory(elements, updated);
                      toast.info('Removed flow connection');
                    }}
                  />

                  {/* Visible connection path */}
                  <path
                    d={pathD}
                    stroke="#383028"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.75"
                    markerEnd="url(#arrowhead-knovera)"
                    strokeDasharray={conn.style === 'dashed' || nodeB.type === 'photo' ? '5 5' : 'none'}
                    className="transition-all duration-150 group-hover/line:stroke-amber-600 group-hover/line:stroke-[3.5]"
                  />

                  {/* Midpoint delete pill on hover */}
                  <g 
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = connections.filter(c => c.id !== conn.id);
                      onUpdateConnections(updated);
                      pushHistory(elements, updated);
                    }}
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
              CANVAS ELEMENTS LAYER
              =================================================================== */}
          {elements.map(node => {
            const isSelected = selectedIds.includes(node.id);
            const isSource = connectingSourceId === node.id;
            const isConnectTarget = activeTool === 'arrow' && connectingSourceId && connectingSourceId !== node.id;
            const w = node.width || (node.type === 'hub' ? 144 : node.type === 'photo' ? 140 : 130);
            const h = node.height || (node.type === 'hub' ? 96 : node.type === 'photo' ? 175 : 130);

            // 1. CENTRAL / MILESTONE HUB
            if (node.type === 'hub') {
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleSelectNode(e, node.id)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onDoubleClick={() => handleStartEdit(node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className={`canvas-node group absolute z-20 rounded-[40px] bg-[#F8D979] border-2 border-dashed border-[#695747] shadow-xl flex items-center justify-center p-3 text-center transition-shadow select-none ${
                    isSource 
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                      : isSelected 
                      ? 'ring-3 ring-amber-500 shadow-2xl' 
                      : isConnectTarget 
                      ? 'hover:ring-3 hover:ring-amber-400 cursor-pointer' 
                      : 'cursor-grab active:cursor-grabbing hover:scale-102'
                  }`}
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
                    <div>
                      <h4 className="font-handwriting font-extrabold text-base text-stone-900 leading-tight whitespace-pre-line pointer-events-none">
                        {node.title}
                      </h4>
                      {node.category && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-stone-900/10 text-[9px] font-mono text-stone-700 uppercase tracking-widest font-bold">
                          {node.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Flow connect button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTool('arrow');
                      handleFlowConnect(node.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[9px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>Connect</span>
                  </button>
                </div>
              );
            }

            // 2. PHOTOREALISTIC POLAROID CARD (Supports multiple uploaded photos)
            if (node.type === 'photo') {
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleSelectNode(e, node.id)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onDoubleClick={() => handleStartEdit(node)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    transform: `rotate(${node.rotation}deg)`,
                  }}
                  className={`canvas-node group absolute z-20 p-2.5 pb-4 rounded-xl bg-white border border-black/15 shadow-xl flex flex-col justify-between transition-shadow select-none ${
                    isSource 
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                      : isSelected 
                      ? 'ring-3 ring-amber-500 shadow-2xl z-30' 
                      : isConnectTarget 
                      ? 'hover:ring-3 hover:ring-amber-400 cursor-pointer' 
                      : 'cursor-grab active:cursor-grabbing hover:scale-102 hover:z-30'
                  }`}
                >
                  {/* Top Masking Tape Strip */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-100/80 border-t border-b border-amber-300/40 shadow-xs rotate-[-1deg] pointer-events-none" />

                  {/* Image Surface */}
                  <div className="w-full flex-1 rounded-sm overflow-hidden bg-stone-100 mb-2 flex items-center justify-center relative">
                    <img
                      src={node.imageUrl || node.thumbnailUrl}
                      alt={node.caption || node.title}
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Handwritten Caption */}
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
                    <span className="block text-center font-handwriting text-xs text-stone-800 font-bold truncate pointer-events-none">
                      {node.caption || node.title}
                    </span>
                  )}

                  {/* Flow connect handle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTool('arrow');
                      handleFlowConnect(node.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[9px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>Connect</span>
                  </button>

                  {/* Transform Handles (When single photo is selected) */}
                  {isSelected && selectedIds.length === 1 && (
                    <>
                      {/* Rotation Stalk */}
                      <div
                        onMouseDown={(e) => handleTransformStart(e, node.id, 'rotate', 'rot')}
                        className="rotate-handle absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-stone-900 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 transition"
                        title="Drag to Rotate Photo"
                      >
                        <RotateCw className="w-2.5 h-2.5 text-stone-900" />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-stone-900 pointer-events-none" />

                      {/* Resize Corner Handles */}
                      <div
                        onMouseDown={(e) => handleTransformStart(e, node.id, 'resize', 'se')}
                        className="resize-handle absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-sm cursor-se-resize hover:scale-125"
                        title="Drag to Resize"
                      />
                    </>
                  )}
                </div>
              );
            }

            // 3. PHYSICAL STICKY NOTE (With Ruled Lines & Pushpin)
            return (
              <div
                key={node.id}
                onClick={(e) => handleSelectNode(e, node.id)}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onDoubleClick={() => handleStartEdit(node)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                  backgroundColor: node.colorHex,
                  transform: `rotate(${node.rotation}deg)`,
                }}
                className={`canvas-node group absolute z-20 p-3 pt-5 rounded-2xl border border-black/10 shadow-lg flex flex-col justify-between transition-shadow select-none paper-ruling-lines overflow-hidden ${
                  isSource 
                    ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl animate-pulse' 
                    : isSelected 
                    ? 'ring-3 ring-amber-500 shadow-2xl z-30' 
                    : isConnectTarget 
                    ? 'hover:ring-3 hover:ring-amber-400 cursor-pointer' 
                    : 'cursor-grab active:cursor-grabbing hover:scale-102 hover:z-30'
                }`}
              >
                {/* 3D Pushpin on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <RedPushPin size={24} color={node.colorHex === '#F1A6A6' ? 'red' : node.colorHex === '#A9C9E9' ? 'blue' : 'cyan'} />
                </div>

                <div className="sticky-adhesive-strip pointer-events-none" />
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
                  <span>{node.category || 'Idea'}</span>
                  {isSelected && (
                    <span className="font-bold text-[8px] bg-stone-900/10 px-1.5 py-0.5 rounded">
                      {Math.round(w)}×{Math.round(h)}
                    </span>
                  )}
                </div>

                {/* Flow connect handle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTool('arrow');
                    handleFlowConnect(node.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[8px] font-bold shadow-md transition hover:bg-stone-800 flex items-center gap-1 z-20 cursor-pointer"
                >
                  <Link2 className="w-2.5 h-2.5" />
                  <span>Connect</span>
                </button>

                {/* Transform Handles (When single note is selected) */}
                {isSelected && selectedIds.length === 1 && (
                  <>
                    <div
                      onMouseDown={(e) => handleTransformStart(e, node.id, 'rotate', 'rot')}
                      className="rotate-handle absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-stone-900 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 transition z-40"
                      title="Drag to Rotate Note"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-stone-900" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-stone-900 pointer-events-none z-30" />

                    <div
                      onMouseDown={(e) => handleTransformStart(e, node.id, 'resize', 'se')}
                      className="resize-handle absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-sm cursor-se-resize hover:scale-125 z-40"
                      title="Drag to Resize"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Right Floating Zoom & Pan Controls Bar */}
        <div className="absolute bottom-6 right-6 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/65 dark:bg-black/75 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Zoom Out (-)"
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
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setZoomLevel(100);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Reset Zoom & Pan"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

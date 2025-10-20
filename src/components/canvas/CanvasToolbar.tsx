import { useState } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import type { CanvasObject } from '@/types/canvas';
import { toast } from 'sonner';

type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'image' | 'video';

interface CanvasToolbarProps {
  onAddImage?: () => void;
  onAddVideo?: () => void;
}

export function CanvasToolbar({ onAddImage, onAddVideo }: CanvasToolbarProps) {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const {
    objects,
    selectedIds,
    viewport,
    setViewport,
    addObject,
    undo,
    redo,
    copy,
    paste,
    deleteSelected,
    historyIndex,
    history,
  } = useCanvasStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleAddShape = (type: 'rectangle' | 'circle') => {
    const newObject: CanvasObject = {
      id: crypto.randomUUID(),
      type: 'shape',
      layerIndex: objects.length,
      transform: {
        x: -viewport.x / viewport.scale + 100,
        y: -viewport.y / viewport.scale + 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      visibility: true,
      locked: false,
      data: {
        shapeType: type,
        width: 200,
        height: type === 'rectangle' ? 150 : 200,
        fill: '#8B5CF6',
        stroke: '#ffffff',
        strokeWidth: 2,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addObject(newObject);
    toast.success(`${type === 'rectangle' ? 'Rectangle' : 'Circle'} added`);
  };

  const handleAddText = () => {
    const newObject: CanvasObject = {
      id: crypto.randomUUID(),
      type: 'text',
      layerIndex: objects.length,
      transform: {
        x: -viewport.x / viewport.scale + 100,
        y: -viewport.y / viewport.scale + 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      visibility: true,
      locked: false,
      data: {
        text: 'Double click to edit',
        fontSize: 32,
        fontFamily: 'Inter',
        color: '#ffffff',
        align: 'left',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addObject(newObject);
    toast.success('Text added');
  };

  const handleZoomIn = () => {
    setViewport({ scale: Math.min(viewport.scale * 1.2, 10) });
  };

  const handleZoomOut = () => {
    setViewport({ scale: Math.max(viewport.scale / 1.2, 0.1) });
  };

  const handleResetZoom = () => {
    setViewport({ scale: 1, x: 0, y: 0 });
  };

  const handleCopy = () => {
    if (selectedIds.length === 0) {
      toast.error('No objects selected');
      return;
    }
    copy();
    toast.success('Copied to clipboard');
  };

  const handlePaste = () => {
    paste();
    toast.success('Pasted from clipboard');
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No objects selected');
      return;
    }
    deleteSelected();
    toast.success('Deleted selected objects');
  };

  const handleUndo = () => {
    if (!canUndo) return;
    undo();
    toast.success('Undo');
  };

  const handleRedo = () => {
    if (!canRedo) return;
    redo();
    toast.success('Redo');
  };

  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Select (V)', onClick: () => setActiveTool('select') },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle (R)', onClick: () => handleAddShape('rectangle') },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle (C)', onClick: () => handleAddShape('circle') },
    { id: 'text' as Tool, icon: Type, label: 'Text (T)', onClick: handleAddText },
    { id: 'image' as Tool, icon: ImageIcon, label: 'Image (I)', onClick: onAddImage || (() => toast.info('Image upload coming soon')) },
    { id: 'video' as Tool, icon: Video, label: 'Video', onClick: onAddVideo || (() => toast.info('Video upload coming soon')) },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 px-2 py-2 bg-black/80 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-2xl">
        <TooltipProvider>
          {/* Tools */}
          <div className="flex items-center gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={tool.onClick}
                      className={`h-8 w-8 p-0 ${
                        isActive
                          ? 'bg-white/[0.12] text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{tool.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 bg-white/[0.08]" />

          {/* History */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Redo (Ctrl+Shift+Z)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 bg-white/[0.08]" />

          {/* Edit */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Copy (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Delete (Del)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 bg-white/[0.08]" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Zoom Out</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetZoom}
                  className="h-8 px-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.08] font-mono"
                >
                  {Math.round(viewport.scale * 100)}%
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Reset Zoom</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

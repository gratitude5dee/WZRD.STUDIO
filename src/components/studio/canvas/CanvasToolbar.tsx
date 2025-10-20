import React from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  MousePointer2, 
  Grid3x3, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CanvasToolbarProps {
  connectionMode: 'drag' | 'click';
  onToggleConnectionMode: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  className?: string;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  connectionMode,
  onToggleConnectionMode,
  showGrid,
  onToggleGrid,
  onFitView,
  onZoomIn,
  onZoomOut,
  selectedCount,
  onDeleteSelected,
  onDuplicateSelected,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'absolute bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-1 px-3 py-2',
        'bg-gradient-to-br from-zinc-900/98 to-zinc-800/98 backdrop-blur-xl',
        'border border-zinc-700/50 rounded-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Connection Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                connectionMode === 'click' && 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              )}
              onClick={onToggleConnectionMode}
            >
              {connectionMode === 'drag' ? (
                <MousePointer2 className="h-4 w-4" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex items-center gap-2">
            <span>{connectionMode === 'drag' ? 'Drag to Connect' : 'Click to Connect'}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">C</kbd>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 bg-zinc-700/50" />

        {/* Grid Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                showGrid && 'bg-zinc-700/50'
              )}
              onClick={onToggleGrid}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex items-center gap-2">
            <span>Toggle Grid</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">G</kbd>
          </TooltipContent>
        </Tooltip>

        {/* View Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onFitView}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex items-center gap-2">
            <span>Fit View</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">F</kbd>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex items-center gap-2">
              <span>Zoom Out</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">-</kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex items-center gap-2">
              <span>Zoom In</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">+</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Selection Actions */}
        {selectedCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-6 bg-zinc-700/50" />
            
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="h-7 px-2 text-xs">
                <Layers className="h-3 w-3 mr-1" />
                {selectedCount}
              </Badge>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-blue-500/20 hover:text-blue-400"
                    onClick={onDuplicateSelected}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <span>Duplicate</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌘D</kbd>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-red-500/20 hover:text-red-400"
                    onClick={onDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <span>Delete</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌫</kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </TooltipProvider>
    </motion.div>
  );
};

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
  Layers,
  Play,
  Square,
  Loader2,
  Save,
  Hand,
  MousePointer
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
  // Execution props
  isExecuting?: boolean;
  executionProgress?: { completed: number; total: number };
  onExecute?: () => void;
  onCancelExecution?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  // Pan/Select mode
  interactionMode?: 'pan' | 'select';
  onToggleInteractionMode?: () => void;
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
  isExecuting = false,
  executionProgress,
  onExecute,
  onCancelExecution,
  onSave,
  isSaving = false,
  interactionMode = 'pan',
  onToggleInteractionMode,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-walkthrough="toolbar"
      className={cn(
        'absolute bottom-6 left-[calc(50%-150px)] ml-[-10px] -translate-x-1/2 z-50',
        'flex items-center gap-1 px-2 py-1.5',
        'bg-surface-2/90 backdrop-blur-md',
        'border border-border-default rounded-xl',
        'shadow-xl shadow-black/40',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Execute/Stop Button */}
        {onExecute && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                {isExecuting ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25"
                    onClick={onCancelExecution}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 bg-accent-teal/15 text-accent-teal hover:bg-accent-teal/25"
                    onClick={onExecute}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-2">
                <span>{isExecuting ? 'Stop Execution' : 'Run Graph'}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌘R</kbd>
              </TooltipContent>
            </Tooltip>

            {/* Execution Progress */}
            {isExecuting && executionProgress && (
              <div className="flex items-center gap-2 px-2">
                <Loader2 className="h-3.5 w-3.5 text-accent-purple animate-spin" />
                <span className="text-xs text-text-secondary">
                  {executionProgress.completed}/{executionProgress.total}
                </span>
              </div>
            )}

            <Separator orientation="vertical" className="h-6 bg-border-subtle" />
          </>
        )}

        {/* Save Button */}
        {onSave && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 transition-all',
                    isSaving && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-2">
                <span>Save Graph</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌘S</kbd>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 bg-border-subtle" />
          </>
        )}

        {/* Pan/Select Mode Toggle */}
        {onToggleInteractionMode && (
          <>
            <div className="flex items-center bg-surface-3/50 rounded-lg p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 transition-all rounded-md',
                      interactionMode === 'pan' && 'bg-surface-3 text-text-primary'
                    )}
                    onClick={() => interactionMode !== 'pan' && onToggleInteractionMode()}
                  >
                    <Hand className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <span>Pan Mode</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">H</kbd>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 transition-all rounded-md',
                      interactionMode === 'select' && 'bg-accent-teal/20 text-accent-teal'
                    )}
                    onClick={() => interactionMode !== 'select' && onToggleInteractionMode()}
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <span>Select Mode</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">V</kbd>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 bg-border-subtle" />
          </>
        )}

        {/* Connection Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                connectionMode === 'click' && 'bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30'
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

        {/* Grid Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                showGrid && 'bg-surface-3'
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
            <Separator orientation="vertical" className="h-6 bg-border-subtle" />
            
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="h-7 px-2 text-xs bg-surface-3 text-text-secondary">
                <Layers className="h-3 w-3 mr-1" />
                {selectedCount}
              </Badge>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-accent-teal/20 hover:text-accent-teal"
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
                    className="h-9 w-9 hover:bg-accent-rose/20 hover:text-accent-rose"
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

import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Play, Trash2, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface NodeHoverMenuModelOption {
  id: string;
  label: string;
  category?: string;
}

export interface NodeHoverMenuProps {
  isVisible: boolean;
  selectedModel?: string;
  modelOptions?: NodeHoverMenuModelOption[];
  onModelChange?: (modelId: string) => void;
  onGenerate?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  isGenerating?: boolean;
  nodeStatus?: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed';
  className?: string;
}

export const NodeHoverMenu = ({
  isVisible,
  selectedModel,
  modelOptions,
  onModelChange,
  onGenerate,
  onDuplicate,
  onDelete,
  isGenerating = false,
  nodeStatus = 'idle',
  className,
}: NodeHoverMenuProps) => {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const hasModelSelector = Boolean(modelOptions?.length && onModelChange);
  const hasActions = Boolean(onGenerate || onDuplicate || onDelete);
  const hasMenu = hasModelSelector || hasActions;
  const resolvedModel = selectedModel ?? modelOptions?.[0]?.id;
  const selectedModelLabel = modelOptions?.find(m => m.id === resolvedModel)?.label ?? 'Select Model';

  const handleGenerate = useCallback(() => {
    if (isGenerating || nodeStatus === 'running') return;
    onGenerate?.();
  }, [isGenerating, nodeStatus, onGenerate]);

  if (!hasMenu) return null;

  const isRunning = isGenerating || nodeStatus === 'running' || nodeStatus === 'queued';

  return (
    <TooltipProvider delayDuration={200}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -top-12 z-30',
              'flex items-center gap-1.5 rounded-xl',
              'border border-border-subtle/80 bg-surface-2/95 backdrop-blur-xl',
              'px-2 py-1.5 shadow-2xl shadow-black/30',
              className
            )}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Model Selector */}
            {hasModelSelector && (
              <Select
                value={resolvedModel}
                onValueChange={onModelChange}
                open={isModelSelectorOpen}
                onOpenChange={setIsModelSelectorOpen}
              >
                <SelectTrigger
                  className={cn(
                    "h-7 min-w-[120px] max-w-[160px] gap-1 px-2",
                    "border-border-subtle/60 bg-surface-3/80 hover:bg-surface-3",
                    "text-[11px] font-medium text-text-secondary hover:text-text-primary",
                    "transition-all duration-200",
                    "focus:ring-1 focus:ring-accent-purple/40 focus:border-accent-purple/50"
                  )}
                >
                  <Sparkles className="h-3 w-3 text-accent-purple shrink-0" />
                  <SelectValue placeholder="Model">
                    <span className="truncate">{selectedModelLabel}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="border-border-subtle bg-surface-2/98 backdrop-blur-xl max-h-[280px] overflow-y-auto"
                  align="center"
                  sideOffset={8}
                >
                  {modelOptions?.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className={cn(
                        "text-[11px] py-2 px-3 cursor-pointer",
                        "hover:bg-accent-purple/10 focus:bg-accent-purple/10",
                        resolvedModel === option.id && "bg-accent-purple/15 text-accent-purple"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{option.label}</span>
                        {option.category && (
                          <span className="text-[9px] text-text-tertiary">{option.category}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Divider */}
            {hasModelSelector && hasActions && (
              <div className="h-5 w-px bg-border-subtle/60" />
            )}

            {/* Generate Button */}
            {onGenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isRunning}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                      "transition-all duration-200",
                      isRunning
                        ? "bg-accent-purple/20 text-accent-purple cursor-not-allowed"
                        : "bg-accent-purple/10 text-accent-purple hover:bg-accent-purple hover:text-white",
                      "border border-accent-purple/30 hover:border-accent-purple/60"
                    )}
                    whileHover={!isRunning ? { scale: 1.05 } : undefined}
                    whileTap={!isRunning ? { scale: 0.95 } : undefined}
                    aria-label="Generate"
                  >
                    {isRunning ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 ml-0.5" />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  {isRunning ? 'Generating...' : 'Generate'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Duplicate Button */}
            {onDuplicate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={onDuplicate}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                      "border border-border-subtle/60 bg-surface-3/60",
                      "text-text-tertiary hover:text-text-primary",
                      "hover:bg-surface-3 hover:border-border-subtle",
                      "transition-all duration-200"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Duplicate
                </TooltipContent>
              </Tooltip>
            )}

            {/* Delete Button */}
            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={onDelete}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                      "border border-border-subtle/60 bg-surface-3/60",
                      "text-text-tertiary hover:text-rose-400",
                      "hover:bg-rose-500/10 hover:border-rose-500/40",
                      "transition-all duration-200"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Delete
                </TooltipContent>
              </Tooltip>
            )}

            {/* Arrow pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-surface-2/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

NodeHoverMenu.displayName = 'NodeHoverMenu';

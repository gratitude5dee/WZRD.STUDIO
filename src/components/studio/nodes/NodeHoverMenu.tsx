import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface NodeHoverMenuModelOption {
  id: string;
  label: string;
}

export interface NodeHoverMenuProps {
  isVisible: boolean;
  selectedModel?: string;
  modelOptions?: NodeHoverMenuModelOption[];
  onModelChange?: (modelId: string) => void;
  onGenerate?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
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
  className,
}: NodeHoverMenuProps) => {
  const hasModelSelector = Boolean(modelOptions?.length && onModelChange);
  const hasActions = Boolean(onGenerate || onDuplicate || onDelete);
  const hasMenu = hasModelSelector || hasActions;
  const resolvedModel = selectedModel ?? modelOptions?.[0]?.id;

  if (!hasMenu) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute right-3 top-10 z-30 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-3/95 px-2 py-1.5 shadow-xl backdrop-blur',
            className
          )}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {hasModelSelector && (
            <Select value={resolvedModel} onValueChange={onModelChange}>
              <SelectTrigger className="h-7 min-w-[140px] border-border-subtle bg-surface-2 text-xs text-text-secondary">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent className="border-border-subtle bg-surface-3">
                {modelOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary"
              aria-label="Generate"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary"
              aria-label="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition hover:border-rose-500/60 hover:text-rose-400"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

NodeHoverMenu.displayName = 'NodeHoverMenu';

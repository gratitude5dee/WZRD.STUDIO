import { useCallback } from 'react';
import { Node } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, Maximize2, Edit, Sparkles } from 'lucide-react';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  node?: Node;
  onClose: () => void;
  onDuplicate?: (node: Node) => void;
  onDelete?: (node: Node) => void;
  onEdit?: (node: Node) => void;
  onGenerate?: (node: Node) => void;
  onFitView?: () => void;
}

export const ContextMenu = ({
  top,
  left,
  node,
  onClose,
  onDuplicate,
  onDelete,
  onEdit,
  onGenerate,
  onFitView,
}: ContextMenuProps) => {
  const handleDuplicate = useCallback(() => {
    if (node && onDuplicate) {
      onDuplicate(node);
    }
    onClose();
  }, [node, onDuplicate, onClose]);

  const handleDelete = useCallback(() => {
    if (node && onDelete) {
      onDelete(node);
    }
    onClose();
  }, [node, onDelete, onClose]);

  const handleEdit = useCallback(() => {
    if (node && onEdit) {
      onEdit(node);
    }
    onClose();
  }, [node, onEdit, onClose]);

  const handleGenerate = useCallback(() => {
    if (node && onGenerate) {
      onGenerate(node);
    }
    onClose();
  }, [node, onGenerate, onClose]);

  const handleFitView = useCallback(() => {
    if (onFitView) {
      onFitView();
    }
    onClose();
  }, [onFitView, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ top, left }}
        className="absolute z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]"
      >
        <div className="py-1">
          {node && (
            <>
              {onGenerate && (
                <button
                  onClick={handleGenerate}
                  className="w-full px-4 py-2 text-left text-sm text-[#6366F1] hover:bg-muted transition-colors flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Node
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={handleDuplicate}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
              )}
              {onDelete && (
                <>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </>
          )}
          {!node && onFitView && (
            <button
              onClick={handleFitView}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Fit View
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

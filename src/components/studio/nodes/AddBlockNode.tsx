import { memo, useEffect, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Type, Image, Video, Upload } from 'lucide-react';

const blockTypes = [
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'video', icon: Video, label: 'Video', shortcut: 'V' },
  { id: 'upload', icon: Upload, label: 'Upload', shortcut: 'U' },
];

export const AddBlockNode = memo(({ data, id }: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (data?.isNew) {
      const timer = window.setTimeout(() => setIsExpanded(true), 200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [data?.isNew]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail.nodeId === id) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('openBlockSelector', handler as EventListener);
    return () => window.removeEventListener('openBlockSelector', handler as EventListener);
  }, [id]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative"
    >
      <Handle type="target" position={Position.Left} className="!bg-violet-500" />

      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg transition-shadow hover:shadow-violet-500/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Plus className="h-6 w-6 text-violet-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute left-0 top-full mt-2 min-w-[160px] rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl"
          >
            <p className="mb-1 px-2 py-1 text-xs text-zinc-500">Add Block</p>
            {blockTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('transformNode', {
                      detail: { nodeId: id, blockType: type.id },
                    })
                  );
                }}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800"
              >
                <type.icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-violet-400" />
                <span className="flex-1 text-left text-sm text-zinc-300">{type.label}</span>
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600">
                  {type.shortcut}
                </kbd>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Handle type="source" position={Position.Right} className="!bg-violet-500" />
    </motion.div>
  );
});

AddBlockNode.displayName = 'AddBlockNode';

export default AddBlockNode;

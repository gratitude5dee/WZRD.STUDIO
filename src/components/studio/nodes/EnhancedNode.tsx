import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Sparkles, Image as ImageIcon, Video } from 'lucide-react';

interface NodeData {
  type: string;
  label: string;
  model?: string;
  imageUrl?: string;
}

const EnhancedNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  const getIcon = () => {
    const type = data.type.toLowerCase();
    if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('video')) return <Video className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getTypeColor = () => {
    const type = data.type.toLowerCase();
    if (type.includes('image')) return 'from-emerald-500/10 to-emerald-600/5';
    if (type.includes('video')) return 'from-blue-500/10 to-blue-600/5';
    return 'from-purple-500/10 to-purple-600/5';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Dynamic Connection Handles */}
      <AnimatePresence>
        {(isHovered || selected) && (
          <>
            {(['top', 'right', 'bottom', 'left'] as const).map((pos) => (
              <motion.div
                key={pos}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Handle
                  type={pos === 'left' || pos === 'top' ? 'target' : 'source'}
                  position={Position[pos.charAt(0).toUpperCase() + pos.slice(1) as 'Top' | 'Right' | 'Bottom' | 'Left']}
                  id={pos}
                  onMouseEnter={() => setHoveredHandle(pos)}
                  onMouseLeave={() => setHoveredHandle(null)}
                  className={`
                    !w-3 !h-3 !rounded-full !border-2 !border-background
                    transition-all duration-200
                    ${hoveredHandle === pos 
                      ? '!bg-accent !scale-125 !shadow-[0_0_12px_hsl(var(--accent)/.6)]' 
                      : selected
                        ? '!bg-primary'
                        : '!bg-muted-foreground'
                    }
                  `}
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Node Container */}
      <motion.div
        className={`
          min-w-[280px] rounded-xl bg-card border-2 
          transition-all duration-200 overflow-hidden
          ${selected 
            ? 'border-primary shadow-[0_0_0_4px_hsl(var(--primary)/.15),0_8px_32px_hsl(var(--primary)/.3)]' 
            : isHovered 
              ? 'border-border shadow-[0_8px_24px_hsl(var(--foreground)/.1)]' 
              : 'border-border/50 shadow-[0_4px_16px_hsl(var(--foreground)/.05)]'
          }
        `}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b border-border bg-gradient-to-b ${getTypeColor()}`}>
          <div className="flex items-center gap-3">
            <div className="drag-handle cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{getIcon()}</span>
                <span className="text-sm font-medium text-foreground">{data.type}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-md border border-border">
                {data.model || 'GPT-5'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {data.imageUrl ? (
          <div className="aspect-square bg-muted/30 overflow-hidden">
            <img 
              src={data.imageUrl} 
              alt={data.label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {data.label || 'Enter your prompt...'}
            </p>
          </div>
        )}

        {/* Hover Overlay Effect */}
        <AnimatePresence>
          {isHovered && !selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-gradient-to-t ${getTypeColor()} rounded-xl pointer-events-none`}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

EnhancedNode.displayName = 'EnhancedNode';

export default EnhancedNode;

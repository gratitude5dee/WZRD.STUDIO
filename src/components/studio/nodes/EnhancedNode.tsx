import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Type, Image as ImageIcon, Video, MoreHorizontal } from 'lucide-react';

interface NodeData {
  type: string;
  label: string;
  model?: string;
  imageUrl?: string;
  status?: 'idle' | 'generating' | 'complete' | 'error';
  progress?: number;
}

const EnhancedNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  const getIcon = () => {
    const type = data.type.toLowerCase();
    if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('video')) return <Video className="w-4 h-4" />;
    return <Type className="w-4 h-4" />;
  };

  const getTypeColor = () => {
    const type = data.type.toLowerCase();
    if (type.includes('image')) return { gradient: 'from-emerald-500/20 to-emerald-600/10', icon: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (type.includes('video')) return { gradient: 'from-blue-500/20 to-blue-600/10', icon: 'text-blue-400', border: 'border-blue-500/30' };
    return { gradient: 'from-indigo-500/20 to-indigo-600/10', icon: 'text-indigo-400', border: 'border-indigo-500/30' };
  };

  const typeColors = getTypeColor();

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
          min-w-[280px] max-w-[320px] rounded-xl bg-[#1C1C1F] border-[1.5px]
          transition-all duration-200 overflow-hidden relative
          ${selected 
            ? `${typeColors.border} shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_8px_32px_rgba(99,102,241,0.2)]` 
            : isHovered 
              ? 'border-[#52525B] shadow-[0_8px_24px_rgba(0,0,0,0.4)]' 
              : 'border-[#3F3F46] shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
          }
        `}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b border-[#27272A] bg-gradient-to-br ${typeColors.gradient} relative`}>
          <div className="flex items-center gap-3">
            {/* Drag Handle - Shows on hover */}
            <AnimatePresence>
              {(isHovered || selected) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="drag-handle cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2.5">
                <span className={typeColors.icon}>{getIcon()}</span>
                <span className="text-sm font-semibold text-[#FAFAFA] tracking-tight">{data.type}</span>
              </div>
              
              {/* Model Badge - Clickable */}
              <button 
                className="text-[11px] font-medium text-[#A1A1AA] px-2.5 py-1 bg-[#141416] hover:bg-[#1C1C1F] rounded-md border border-[#3F3F46] hover:border-[#52525B] transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle model selection
                }}
              >
                {data.model || 'GPT-5'}
              </button>

              {/* Menu Button - Shows on hover */}
              <AnimatePresence>
                {(isHovered || selected) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="ml-2 w-6 h-6 flex items-center justify-center rounded hover:bg-[#27272A] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle menu
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-[#A1A1AA] hover:text-[#FAFAFA]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {data.imageUrl ? (
          <div className="aspect-square bg-[#0A0A0B] overflow-hidden relative group">
            <img 
              src={data.imageUrl} 
              alt={data.label}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        ) : (
          <div className="p-4 min-h-[100px] flex items-start">
            <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">
              {data.label || 'Enter your prompt...'}
            </p>
          </div>
        )}

        {/* Footer with Status */}
        {data.status && (
          <div className="px-4 py-2 border-t border-[#27272A] bg-[#141416]/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52525B]">
                {data.status === 'generating' ? 'Generating...' : data.status === 'complete' ? 'Complete' : data.status === 'error' ? 'Error' : 'Ready'}
              </span>
              {data.status === 'generating' && data.progress && (
                <span className="text-[#A1A1AA]">{data.progress}%</span>
              )}
            </div>
            {data.status === 'generating' && data.progress && (
              <div className="mt-1 h-1 bg-[#27272A] rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${typeColors.gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        )}

        {/* Subtle glow effect when selected */}
        {selected && (
          <div className={`absolute inset-0 bg-gradient-to-br ${typeColors.gradient} opacity-10 pointer-events-none rounded-xl`} />
        )}
      </motion.div>
    </div>
  );
});

EnhancedNode.displayName = 'EnhancedNode';

export default EnhancedNode;

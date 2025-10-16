import { useState, memo, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Type, Image as ImageIcon, Video, MoreHorizontal, Edit3, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface NodeData {
  type: string;
  label: string;
  model?: string;
  imageUrl?: string;
  status?: 'idle' | 'generating' | 'complete' | 'error';
  progress?: number;
  contentType?: 'text' | 'content' | 'critique' | 'question';
  outputs?: string[];
}

type ContentType = 'text' | 'content' | 'critique' | 'question';

const EnhancedNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const detectContentType = (): ContentType => {
    if (data.contentType) return data.contentType;
    const label = data.label?.toLowerCase() || '';
    if (label.includes('?') || label.startsWith('what') || label.startsWith('how') || label.startsWith('why')) return 'question';
    if (label.includes('critique') || label.includes('feedback') || label.includes('review')) return 'critique';
    if (label.length > 50 || label.includes('\n')) return 'content';
    return 'text';
  };

  const contentType = detectContentType();
  const shouldTruncate = !isExpanded && data.label && data.label.length > 120;
  const displayText = shouldTruncate ? data.label.slice(0, 120) + '...' : data.label;

  const handleEditSave = () => {
    setIsEditing(false);
    // TODO: Integrate with node update handler
    // onNodeChange?.(id, { ...data, label: editValue });
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

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
            
            {/* Output count badge */}
            {data.outputs && data.outputs.length > 1 && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs text-white">
                → {data.outputs.length}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 min-h-[100px] relative">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleEditSave}
                  className="w-full min-h-[80px] bg-[#141416] text-sm text-[#FAFAFA] border border-[#6366F1] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none"
                  placeholder="Enter your prompt..."
                />
                <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <kbd className="px-1.5 py-0.5 bg-[#27272A] rounded">⌘ Enter</kbd> to save
                  <span>•</span>
                  <kbd className="px-1.5 py-0.5 bg-[#27272A] rounded">Esc</kbd> to cancel
                </div>
              </div>
            ) : (
              <>
                <div
                  onClick={() => setIsEditing(true)}
                  className="cursor-text group/content relative"
                >
                  {contentType === 'question' && (
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#3B82F6] text-xs">?</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#FAFAFA] leading-relaxed font-medium">
                          {displayText || 'Enter your question...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {contentType === 'critique' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wide">Critique</span>
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {data.label?.split('\n').filter(line => line.trim()).slice(0, isExpanded ? undefined : 3).map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#52525B] text-xs mt-1">•</span>
                            <p className="text-sm text-[#A1A1AA] leading-relaxed flex-1">{line}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contentType === 'content' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-[#6366F1] to-[#8B5CF6] rounded-full" />
                        <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide">Content</span>
                      </div>
                      <p className="text-sm text-[#FAFAFA] leading-relaxed whitespace-pre-wrap">
                        {displayText || 'Enter your content...'}
                      </p>
                    </div>
                  )}

                  {contentType === 'text' && (
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {displayText || 'Enter your prompt...'}
                    </p>
                  )}

                  {/* Edit icon on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute top-0 right-0 p-1 bg-[#141416]/90 backdrop-blur-sm rounded-md border border-[#3F3F46]"
                  >
                    <Edit3 className="w-3 h-3 text-[#A1A1AA]" />
                  </motion.div>
                </div>

                {/* Expand/Collapse button */}
                {data.label && data.label.length > 120 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="mt-2 flex items-center gap-1 text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show more
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer with Status */}
        {data.status && data.status !== 'idle' && (
          <div className="px-4 py-2 border-t border-[#27272A] bg-[#141416]/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {data.status === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
                {data.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />}
                {data.status === 'generating' && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
                )}
                <span className={`
                  ${data.status === 'generating' ? 'text-[#6366F1]' : ''}
                  ${data.status === 'complete' ? 'text-[#10B981]' : ''}
                  ${data.status === 'error' ? 'text-[#EF4444]' : ''}
                `}>
                  {data.status === 'generating' ? 'Generating...' : data.status === 'complete' ? 'Complete' : 'Error'}
                </span>
              </div>
              {data.status === 'generating' && data.progress && (
                <span className="text-[#A1A1AA] font-medium">{data.progress}%</span>
              )}
            </div>
            {data.status === 'generating' && data.progress && (
              <div className="mt-1.5 h-1 bg-[#27272A] rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${typeColors.gradient} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
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

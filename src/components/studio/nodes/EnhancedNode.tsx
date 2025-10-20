import { useState, memo, useRef, useEffect } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { motion } from 'framer-motion';
import { Type, Image as ImageIcon, Video, Edit3, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2, Clock, Zap } from 'lucide-react';
import { ComputeFlowNodeData } from '@/types/computeFlow';
import { CustomHandle } from './CustomHandle';
import { getNodeDefinitionByType } from '@/lib/nodeRegistry';

type ContentType = 'text' | 'content' | 'critique' | 'question';

const EnhancedNode = memo(({ data, selected, id }: NodeProps<ComputeFlowNodeData>) => {
  const { setNodes } = useReactFlow();
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

  // Get node definition for ports and metadata
  const nodeDef = getNodeDefinitionByType(data.type);

  // Initialize ports if not present
  useEffect(() => {
    if (nodeDef && (!data.inputs || !data.outputs)) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                inputs: nodeDef.inputs.map(p => ({ ...p, value: undefined })),
                outputs: nodeDef.outputs.map(p => ({ ...p, value: undefined })),
              },
            };
          }
          return n;
        })
      );
    }
  }, [nodeDef, data.inputs, data.outputs, id, setNodes]);

  // Handle input changes from connected nodes
  const handleInputChange = (portId: string, value: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              inputs: n.data.inputs?.map((p: any) =>
                p.id === portId ? { ...p, value } : p
              ),
            },
          };
        }
        return n;
      })
    );
    
    // Check if all required inputs are satisfied and trigger computation
    const allInputsSatisfied = data.inputs?.every(
      (p) => p.optional || p.value !== undefined
    );
    
    if (allInputsSatisfied) {
      // TODO: Schedule node execution
      console.log('All inputs satisfied for node:', id);
    }
  };

  const handleEditSave = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, label: editValue },
          };
        }
        return n;
      })
    );
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
    if (type.includes('image')) return { 
      gradient: 'from-emerald-500/20 to-emerald-600/10', 
      icon: 'text-emerald-400', 
      border: 'border-emerald-500/30',
      bg: '#10B981'
    };
    if (type.includes('video')) return { 
      gradient: 'from-blue-500/20 to-blue-600/10', 
      icon: 'text-blue-400', 
      border: 'border-blue-500/30',
      bg: '#3B82F6'
    };
    return { 
      gradient: 'from-indigo-500/20 to-indigo-600/10', 
      icon: 'text-indigo-400', 
      border: 'border-indigo-500/30',
      bg: '#6366F1'
    };
  };

  const typeColors = getTypeColor();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Render Input Handles from Port Definitions */}
      {data.inputs?.map((port) => (
        <CustomHandle
          key={port.id}
          nodeId={id}
          port={port}
          onChange={(value) => handleInputChange(port.id, value)}
          isVisible={isHovered || selected}
        />
      ))}

      {/* Render Output Handles from Port Definitions */}
      {data.outputs?.map((port) => (
        <CustomHandle
          key={port.id}
          nodeId={id}
          port={port}
          isVisible={isHovered || selected}
        />
      ))}

      {/* Node Container - Softer styling matching screenshot */}
      <motion.div
        className={`
          min-w-[280px] max-w-[320px] rounded-xl overflow-hidden relative
          bg-[#1C1C1F] border
          transition-all duration-200
          ${selected 
            ? 'border-[#6366F1] shadow-[0_0_0_3px_rgba(99,102,241,0.2),0_8px_24px_rgba(0,0,0,0.4)]' 
            : isHovered 
              ? 'border-[#3F3F46] shadow-[0_8px_24px_rgba(0,0,0,0.5)]' 
              : 'border-[#27272A] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
          }
          ${data.status === 'generating' ? 'border-[#8B5CF6]' : ''}
          ${data.status === 'error' ? 'border-[#EF4444]' : ''}
        `}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Status Bar */}
        <div 
          className={`
            absolute top-0 left-0 right-0 h-[3px] transition-all duration-300
            ${data.status === 'generating' ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] animate-shimmer' : ''}
            ${data.status === 'complete' ? 'bg-[#10B981]' : ''}
            ${data.status === 'error' ? 'bg-[#EF4444]' : ''}
          `}
          style={{
            transform: data.status === 'generating' && data.progress 
              ? `scaleX(${data.progress / 100})` 
              : data.status === 'complete' ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left'
          }}
        />
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: typeColors.bg }}
            >
              {getIcon()}
            </div>
            <span className="text-sm font-semibold text-[#FAFAFA]">
              {data.type}
            </span>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {data.status === 'generating' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <Loader2 className="w-3.5 h-3.5 text-[#8B5CF6] animate-spin" />
                <span className="text-xs text-[#8B5CF6] font-medium">
                  {data.progress ? `${data.progress}%` : 'Processing'}
                </span>
              </div>
            )}
            {data.status === 'complete' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-xs text-[#10B981] font-medium">Complete</span>
              </div>
            )}
            {data.status === 'error' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20">
                <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                <span className="text-xs text-[#EF4444] font-medium">Error</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body - Larger image preview */}
        {data.imageUrl ? (
          <div className="relative bg-[#0A0A0B] overflow-hidden group" style={{ aspectRatio: '4/3' }}>
            <img 
              src={data.imageUrl} 
              alt={data.label}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            {/* Title overlay at top */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <p className="text-sm text-white font-medium truncate">
                {data.label || 'Untitled'}
              </p>
            </div>
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

        {/* Footer - Minimal caption style like screenshot */}
        {data.imageUrl && (
          <div className="px-3 py-2 border-t border-[#27272A] bg-[#141416]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#71717A]">Kling Pro 1.6</span>
              <span className="text-[10px] text-[#52525B]">2m ago</span>
            </div>
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

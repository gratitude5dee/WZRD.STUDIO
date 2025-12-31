import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { GripVertical, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import type { NodeDefinition } from '@/types/computeFlow';

interface CommentNodeData {
  title?: string;
  content?: string;
  color?: string;
  collapsed?: boolean;
  params?: CommentNodeData;
  nodeDefinition?: NodeDefinition;
}

const COMMENT_COLORS = [
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Purple', value: '#8B5CF6' },
];

export const CommentNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode, removeNode } = useComputeFlowStore();
  const nodeData = data as CommentNodeData;
  const params = (nodeData?.params as CommentNodeData) ?? {};
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [title, setTitle] = useState(params?.title || nodeData?.title || 'Comment');
  const [content, setContent] = useState(params?.content || nodeData?.content || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const color = params?.color || nodeData?.color || COMMENT_COLORS[0].value;

  useEffect(() => {
    setTitle(params?.title || nodeData?.title || 'Comment');
    setContent(params?.content || nodeData?.content || '');
  }, [params?.title, params?.content, nodeData?.title, nodeData?.content]);

  const updateNodeData = useCallback(
    (updates: Partial<CommentNodeData>) => {
      updateNode(id, {
        params: {
          ...params,
          ...updates,
        },
      });
    },
    [id, params, updateNode]
  );

  const handleTitleSubmit = () => {
    updateNodeData({ title });
    setIsEditingTitle(false);
  };

  const handleContentSubmit = () => {
    updateNodeData({ content });
    setIsEditingContent(false);
  };

  const handleDelete = () => {
    removeNode(id);
  };

  const handleColorChange = (newColor: string) => {
    updateNodeData({ color: newColor });
    setShowColorPicker(false);
  };

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditingContent]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'min-w-[200px] max-w-[300px] rounded-xl shadow-lg',
        'border-2 transition-shadow',
        selected ? 'shadow-xl' : ''
      )}
      style={{
        backgroundColor: `${color}15`,
        borderColor: selected ? color : `${color}50`,
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl cursor-move"
        style={{ backgroundColor: `${color}30` }}
      >
        <GripVertical className="w-4 h-4 opacity-50" style={{ color }} />

        <div
          className="w-4 h-4 rounded-full cursor-pointer relative"
          style={{ backgroundColor: color }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          {showColorPicker && (
            <div className="absolute top-6 left-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 flex gap-1 z-50">
              {COMMENT_COLORS.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    'w-5 h-5 rounded-full transition-transform hover:scale-110',
                    option.value === color && 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                  )}
                  style={{ backgroundColor: option.value }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleColorChange(option.value);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {isEditingTitle ? (
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(event) => event.key === 'Enter' && handleTitleSubmit()}
            className="flex-1 bg-transparent border-none text-sm font-semibold focus:outline-none"
            style={{ color }}
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold cursor-text truncate"
            style={{ color }}
            onDoubleClick={() => setIsEditingTitle(true)}
          >
            {title}
          </span>
        )}

        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-black/10 transition-colors opacity-50 hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" style={{ color }} />
        </button>
      </div>

      <div className="p-3">
        {isEditingContent ? (
          <div className="space-y-2">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Add your comment..."
              className="w-full min-h-[60px] bg-transparent border border-dashed rounded-lg p-2 text-sm resize-none focus:outline-none"
              style={{
                borderColor: `${color}50`,
                color: 'white',
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingContent(false)}
                className="px-2 py-1 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleContentSubmit}
                className="px-2 py-1 text-xs rounded text-white flex items-center gap-1"
                style={{ backgroundColor: color }}
              >
                <Check className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn('text-sm cursor-text min-h-[40px]', !content && 'text-zinc-500 italic')}
            style={{ color: content ? 'white' : undefined }}
            onDoubleClick={() => setIsEditingContent(true)}
          >
            {content || 'Double-click to add content...'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentNode;

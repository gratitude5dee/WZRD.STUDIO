import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Box,
  Wand2,
  Zap,
  Settings,
  Type,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { CircularIconButton } from './CircularIconButton';
import { Logo } from '@/components/ui/logo';

interface SimplifiedSidebarProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
  onRunWorkflow?: () => void;
  credits?: number;
}

export const SimplifiedSidebar = ({
  onAddBlock,
  onRunWorkflow,
  credits = 100,
}: SimplifiedSidebarProps) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleToolClick = (toolId: string) => {
    if (toolId === 'add') {
      setShowAddMenu(!showAddMenu);
      setActiveTool(toolId);
    } else if (toolId === 'run') {
      onRunWorkflow?.();
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-[#0F0F10] border-r border-[#27272A] flex flex-col items-center py-4 z-40">
      {/* Top Actions */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <CircularIconButton
            icon={Plus}
            onClick={() => handleToolClick('add')}
            active={activeTool === 'add'}
            tooltip="Add node"
            size="md"
          />
          
          {/* Add Menu Dropdown */}
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-full top-0 ml-2 py-2 px-2 bg-[#1C1C1F] border border-[#3F3F46] rounded-xl shadow-xl min-w-[160px]"
              >
                <button
                  onClick={() => {
                    onAddBlock('text');
                    setShowAddMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272A] transition-colors text-left"
                >
                  <Type className="w-4 h-4 text-[#6366F1]" />
                  <span className="text-sm text-[#FAFAFA]">Text Node</span>
                </button>
                <button
                  onClick={() => {
                    onAddBlock('image');
                    setShowAddMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272A] transition-colors text-left"
                >
                  <ImageIcon className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm text-[#FAFAFA]">Image Node</span>
                </button>
                <button
                  onClick={() => {
                    onAddBlock('video');
                    setShowAddMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272A] transition-colors text-left"
                >
                  <Video className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-sm text-[#FAFAFA]">Video Node</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CircularIconButton
          icon={Box}
          onClick={() => handleToolClick('assets')}
          active={activeTool === 'assets'}
          tooltip="Assets & Flows"
          size="md"
        />

        <CircularIconButton
          icon={Wand2}
          onClick={() => handleToolClick('magic')}
          active={activeTool === 'magic'}
          tooltip="AI Assistant"
          size="md"
        />

        <CircularIconButton
          icon={Zap}
          onClick={() => handleToolClick('run')}
          active={activeTool === 'run'}
          tooltip="Run workflow (⌘R)"
          size="md"
        />

        <CircularIconButton
          icon={Settings}
          onClick={() => handleToolClick('settings')}
          active={activeTool === 'settings'}
          tooltip="Settings"
          size="md"
        />
      </div>

      {/* Bottom: Logo & Credits */}
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="px-2 py-1.5 rounded-lg bg-[#1C1C1F] border border-[#3F3F46]">
          <div className="flex flex-col items-center gap-0.5">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[10px] text-[#A1A1AA] font-medium">
              {credits}
            </span>
          </div>
        </div>
        <div className="w-10 h-10">
          <Logo size="sm" showVersion={false} />
        </div>
      </div>
    </div>
  );
};

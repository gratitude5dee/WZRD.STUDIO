import { 
  Plus, 
  Workflow, 
  History, 
  Layout, 
  Sparkles, 
  MessageCircle, 
  HelpCircle,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IconSidebarProps {
  onAddNode?: () => void;
  credits?: number;
}

export const IconSidebar = ({ onAddNode, credits = 92 }: IconSidebarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed left-0 top-0 h-screen w-[52px] bg-[#0F0F10] border-r border-[#27272A] flex flex-col py-4 z-50">
        {/* Primary Actions */}
        <div className="flex flex-col gap-2 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAddNode}
                className="icon-sidebar-button active"
                aria-label="Add Node"
              >
                <Plus size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Node (⌘1)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button" aria-label="Workflows">
                <Workflow size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Connect Nodes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button" aria-label="History">
                <History size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>History (⌘Z)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="my-3 mx-2 h-px bg-[#27272A]" />

        {/* Tools */}
        <div className="flex flex-col gap-2 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button" aria-label="Templates">
                <Layout size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Templates</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button" aria-label="AI Assistant">
                <Sparkles size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button relative" aria-label="Comments">
                <MessageCircle size={20} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Comments</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="icon-sidebar-button" aria-label="Help">
                <HelpCircle size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help (⌘?)</p>
            </TooltipContent>
          </Tooltip>

          {/* Credit Display */}
          <div className="credit-display">
            <Zap size={14} className="text-[#F59E0B]" />
            <span className="text-[10px] font-semibold text-[#FAFAFA]">{credits}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

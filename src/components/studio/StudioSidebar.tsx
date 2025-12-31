import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  History,
  Layers,
  Inbox,
  Wand2,
  Settings,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Video,
  Upload,
  FolderOpen,
  Workflow,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FlowSelector, { Flow } from './FlowSelector';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AssetLibrary, AssetUploader } from '@/components/assets';
import type { ProjectAsset, AssetType } from '@/types/assets';
import { WorkflowGeneratorTab } from './WorkflowGeneratorTab';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/ui/logo';

interface StudioSidebarProps {
  onAddBlock: (blockType: 'text' | 'image' | 'video' | 'upload') => void;
  projectId?: string;
  onAssetSelect?: (asset: ProjectAsset) => void;
}

const ACCEPTED_STUDIO_FILE_TYPES = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp4',
  '.mov',
  '.webm',
  '.mp3',
  '.wav',
  '.ogg',
];

const detectAssetTypeFromFile = (file: File): AssetType => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'document';
  return 'other';
};

const MOCK_FLOWS: Flow[] = [
  { id: 'game-character', name: 'Game Character Generation', blocks: 139 },
  { id: 'magic-frogs', name: 'magic frogs', blocks: 9 },
  { id: 'cinematic', name: 'Cinematic Portrait', blocks: 9 },
  { id: 'branching', name: 'Branching', blocks: 79 },
  { id: 'aesthetic', name: 'Aesthetic Style Extraction', blocks: 39 },
  { id: 'love-me', name: 'LOVE ME, LOVE ME NOT', blocks: 3 },
];

const FloatingSidebarButton = ({
  icon: Icon,
  label,
  active,
  primary,
  badge,
  onClick,
  href,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  primary?: boolean;
  badge?: number;
  onClick?: () => void;
  href?: string;
}) => {
  const content = (
    <div
      className={cn(
        'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
        'text-zinc-400 hover:text-white hover:bg-white/10',
        active && 'bg-white/15 text-white',
        primary && !active && 'text-accent-teal hover:text-accent-teal hover:bg-accent-teal/10'
      )}
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent-rose text-[9px] font-bold text-white flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {content}
          </a>
        ) : (
          <button type="button" onClick={onClick}>
            {content}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const StudioSidebar = ({ onAddBlock, projectId, onAssetSelect }: StudioSidebarProps) => {
  const { addGeneratedWorkflow, saveGraph, executeGraphStreaming } = useComputeFlowStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFlowSelector, setShowFlowSelector] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const flowSelectorRef = useRef<HTMLDivElement>(null);
  const workflowPanelRef = useRef<HTMLDivElement>(null);

  const handleWorkflowGenerated = useCallback(
    (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      addGeneratedWorkflow(nodes, edges);
      if (projectId) {
        setTimeout(() => {
          saveGraph(projectId);
          toast.info('Workflow saved! Starting generation...');

          setTimeout(() => {
            executeGraphStreaming(projectId);
          }, 600);
        }, 500);
      }
      setShowWorkflowPanel(false);
    },
    [addGeneratedWorkflow, saveGraph, projectId, executeGraphStreaming]
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
      setShowAddMenu(false);
    }
    if (flowSelectorRef.current && !flowSelectorRef.current.contains(event.target as Node)) {
      setShowFlowSelector(false);
    }
    if (workflowPanelRef.current && !workflowPanelRef.current.contains(event.target as Node)) {
      setShowWorkflowPanel(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    if (toolId === 'add') {
      setShowAddMenu(!showAddMenu);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'templates') {
      setShowFlowSelector(!showFlowSelector);
      setShowAddMenu(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'assets') {
      setShowAssetsModal(true);
      setShowAddMenu(false);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'workflow') {
      setShowWorkflowPanel(!showWorkflowPanel);
      setShowAddMenu(false);
      setShowFlowSelector(false);
    } else {
      setShowAddMenu(false);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    }
  };

  const handleSelectFlow = (flowId: string) => {
    console.log(`Selected flow: ${flowId}`);
    setShowFlowSelector(false);
  };

  const handleAssetsSelected = (assets: ProjectAsset[]) => {
    if (!onAssetSelect || assets.length === 0) return;
    const selected = assets[assets.length - 1];
    onAssetSelect(selected);
    setShowAssetsModal(false);
  };

  const hasProject = Boolean(projectId);

  return (
    <>
      {/* Floating Pill Sidebar */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl">
        <TooltipProvider delayDuration={200}>
          {/* Primary Actions */}
          <div className="flex flex-col gap-1">
            <div className="relative" ref={addMenuRef}>
              <FloatingSidebarButton
                icon={Plus}
                label="Add Block"
                active={activeTool === 'add'}
                primary
                onClick={() => handleToolClick('add')}
              />

              <AnimatePresence>
                {showAddMenu && (
                  <motion.div
                    className="absolute left-12 top-0 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl z-50"
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Add Block</h3>
                      </div>

                      {[
                        { type: 'text' as const, icon: Type, label: 'Text', shortcut: 'T' },
                        { type: 'image' as const, icon: ImageIcon, label: 'Image', shortcut: 'I' },
                        { type: 'video' as const, icon: Video, label: 'Video', shortcut: 'V' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg text-zinc-300 text-sm transition-colors"
                          onClick={() => {
                            onAddBlock(item.type);
                            setShowAddMenu(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-zinc-400" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-xs text-zinc-600">{item.shortcut}</span>
                        </button>
                      ))}

                      <div className="border-t border-zinc-800/50 my-2" />

                      <div className="px-3 py-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Add Source</h3>
                      </div>

                      <button
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg text-zinc-300 text-sm transition-colors"
                        onClick={() => {
                          onAddBlock('upload');
                          setShowAddMenu(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Inbox className="h-4 w-4 text-zinc-400" />
                          <span>Upload</span>
                        </div>
                        <span className="text-xs text-zinc-600">U</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={flowSelectorRef}>
              <FloatingSidebarButton
                icon={Workflow}
                label="Flows"
                active={activeTool === 'templates'}
                onClick={() => handleToolClick('templates')}
              />

              <AnimatePresence>
                {showFlowSelector && (
                  <motion.div
                    className="absolute left-12 top-0 w-72 z-50"
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FlowSelector flows={MOCK_FLOWS} onFlowSelect={handleSelectFlow} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FloatingSidebarButton
              icon={History}
              label="History"
              active={activeTool === 'history'}
              onClick={() => handleToolClick('history')}
            />

            <div className="relative" ref={workflowPanelRef}>
              <FloatingSidebarButton
                icon={Sparkles}
                label="AI Workflow"
                active={activeTool === 'workflow'}
                onClick={() => handleToolClick('workflow')}
              />

              <AnimatePresence>
                {showWorkflowPanel && (
                  <motion.div
                    className="absolute left-12 bottom-0 w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <WorkflowGeneratorTab onWorkflowGenerated={handleWorkflowGenerated} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FloatingSidebarButton
              icon={FolderOpen}
              label="Assets"
              active={activeTool === 'assets'}
              onClick={() => handleToolClick('assets')}
            />

            <FloatingSidebarButton
              icon={MessageCircle}
              label="Chat"
              active={activeTool === 'chat'}
              onClick={() => handleToolClick('chat')}
            />
          </div>

          {/* Divider */}
          <div className="my-1 h-px bg-zinc-800/50" />

          {/* Secondary Actions */}
          <div className="flex flex-col gap-1">
            <FloatingSidebarButton
              icon={HelpCircle}
              label="Help"
              active={activeTool === 'help'}
              onClick={() => handleToolClick('help')}
            />
          </div>

          {/* Bottom Logo */}
          <div className="mt-1 pt-1 border-t border-zinc-800/50 flex justify-center">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
          </div>
        </TooltipProvider>
      </aside>

      {/* Assets Modal */}
      <Dialog open={showAssetsModal} onOpenChange={setShowAssetsModal}>
        <DialogContent className="max-w-5xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 text-white">
          <DialogHeader>
            <DialogTitle>Project assets</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Upload media and reuse it across Studio, Editor, and Kanvas.
            </DialogDescription>
          </DialogHeader>

          {hasProject ? (
            <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
              <div className="space-y-4">
                <AssetUploader
                  projectId={projectId}
                  assetType="image"
                  label="Media"
                  visibility="project"
                  assetCategory="upload"
                  maxFiles={20}
                  maxSize={500 * 1024 * 1024}
                  acceptedFileTypes={ACCEPTED_STUDIO_FILE_TYPES}
                  getAssetTypeForFile={detectAssetTypeFromFile}
                />
                <p className="text-xs text-zinc-500">
                  Uploaded assets will instantly appear in the library on the right.
                </p>
              </div>
              <AssetLibrary
                projectId={projectId}
                selectable
                onSelect={handleAssetsSelected}
                className="max-h-[70vh] overflow-y-auto"
              />
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-zinc-500">
              Select a project to start managing assets.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudioSidebar;

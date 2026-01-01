import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import AppHeader from '@/components/AppHeader';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import BlockSettingsModal from '@/components/studio/BlockSettingsModal';
import { SettingsPanel } from '@/components/studio/panels/SettingsPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AssetType } from '@/types/assets';
import type { Asset } from '@/components/studio/panels/AssetsGalleryPanel';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'upload';
  position: {
    x: number;
    y: number;
  };
  initialData?: {
    prompt?: string;
    imageUrl?: string;
    generationTime?: number;
    aspectRatio?: string;
    mode?: string;
    connectedImageUrl?: string;
    connectedImagePrompt?: string;
    assetId?: string;
    assetType?: AssetType;
    assetUrl?: string;
  };
}

const StudioPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const { setActiveProject } = useAppStore();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockModels, setBlockModels] = useState<Record<string, string>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('pan');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle interaction mode
  const handleToggleInteractionMode = useCallback(() => {
    setInteractionMode((prev) => (prev === 'pan' ? 'select' : 'pan'));
  }, []);

  // Keyboard shortcuts for pan/select mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key.toLowerCase() === 'h') {
        setInteractionMode('pan');
      } else if (e.key.toLowerCase() === 'v') {
        setInteractionMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load project state on mount
  useEffect(() => {
    const initializeProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('title')
          .eq('id', projectId)
          .single();
        if (projectError) throw projectError;
        setActiveProject(projectId, projectData?.title || 'Untitled');

        const { data: stateData, error: stateError } = await supabase.functions.invoke(
          'studio-load-state',
          { body: { projectId } }
        );
        if (stateError) throw stateError;
        if (stateData?.blocks) {
          console.log('📥 Loaded blocks from backend:', stateData.blocks.length);
          setBlocks(stateData.blocks);

          const models: Record<string, string> = {};
          stateData.blocks.forEach((block: Block) => {
            if (block.initialData?.imageUrl) {
              models[block.id] = 'google/gemini-2.5-flash-image-preview';
            }
          });
          setBlockModels(models);
        }
      } catch (error) {
        console.error('Error initializing project:', error);
        toast.error('Failed to load project state');
      } finally {
        setIsLoading(false);
      }
    };
    initializeProject();
  }, [projectId, setActiveProject]);

  // Auto-save with debounce
  const saveState = useCallback(async () => {
    if (!projectId || blocks.length === 0) return;
    setIsSaving(true);
    try {
      console.log('💾 Auto-saving state...', { blockCount: blocks.length });
      const { error } = await supabase.functions.invoke('studio-save-state', {
        body: {
          projectId,
          blocks,
          canvasState: {
            viewport: { x: 0, y: 0, zoom: 1 },
            settings: { showGrid: true },
          },
        },
      });
      if (error) throw error;
      setLastSaved(new Date());
      console.log('✅ State saved successfully');
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, blocks]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isLoading || !projectId) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveState();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, projectId, isLoading, saveState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleAddBlock = useCallback((blockOrType: Block | 'text' | 'image' | 'video' | 'upload') => {
    const newBlock =
      typeof blockOrType === 'string'
        ? {
            id: uuidv4(),
            type: blockOrType,
            position: {
              x: 400 + Math.random() * 200,
              y: 300 + Math.random() * 200,
            },
          }
        : blockOrType;
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const handleAssetInsert = useCallback(
    (asset: Asset) => {
      const assetUrl = asset.url;
      if (!assetUrl) {
        toast.error('Asset is still processing. Try again in a moment.');
        return;
      }

      let blockType: 'image' | 'video' | 'text' | 'upload' = 'upload';

      if (asset.type === 'image') {
        blockType = 'image';
      } else if (asset.type === 'video') {
        blockType = 'video';
      } else if (asset.type === 'audio') {
        blockType = 'upload';
      }

      const newBlock: Block = {
        id: uuidv4(),
        type: blockType,
        position: {
          x: 400 + Math.random() * 200,
          y: 300 + Math.random() * 200,
        },
        initialData: {
          imageUrl: asset.type === 'image' ? assetUrl : undefined,
          prompt: asset.name,
          assetId: asset.id,
          assetType: asset.type as AssetType,
          assetUrl,
        },
      };
      handleAddBlock(newBlock);
      toast.success(
        `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} asset added to the canvas.`
      );
    },
    [handleAddBlock]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    },
    [selectedBlockId]
  );

  const handleUpdateBlockPosition = useCallback(
    (blockId: string, position: { x: number; y: number }) => {
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, position } : b)));
    },
    []
  );

  const handleUpdateBlockData = useCallback((blockId: string, data: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...data } : b)));
  }, []);

  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id || null);
    setIsSettingsModalOpen(!!id);
  };

  const handleModelChange = (blockId: string, modelId: string) => {
    setBlockModels((prev) => ({
      ...prev,
      [blockId]: modelId,
    }));
  };

  const handleCloseModal = () => {
    setIsSettingsModalOpen(false);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockType = selectedBlock?.type || null;
  const selectedModel = selectedBlockId ? blockModels[selectedBlockId] : '';

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      <AppHeader onOpenSettings={() => setIsSettingsPanelOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar
          onAddBlock={handleAddBlock}
          projectId={projectId}
          onAssetSelect={handleAssetInsert}
          interactionMode={interactionMode}
          onToggleInteractionMode={handleToggleInteractionMode}
        />

        <div className="flex-1 flex bg-[#0a0a0a]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-sm text-zinc-400">Loading project...</p>
              </div>
            </div>
          ) : (
            <StudioCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
              onUpdateBlockPosition={handleUpdateBlockPosition}
              onUpdateBlockData={handleUpdateBlockData}
              blockModels={blockModels}
              onModelChange={handleModelChange}
              projectId={projectId}
              useComputeFlow={true}
              interactionMode={interactionMode}
              onToggleInteractionMode={handleToggleInteractionMode}
            />
          )}
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {isSettingsPanelOpen && projectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <SettingsPanel projectId={projectId} onClose={() => setIsSettingsPanelOpen(false)} />
        </div>
      )}

      {/* Block Settings Modal */}
      <BlockSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseModal}
        blockType={selectedBlockType}
        selectedModel={selectedModel}
        onModelChange={(modelId) => {
          if (selectedBlockId) {
            handleModelChange(selectedBlockId, modelId);
          }
        }}
      />
    </div>
  );
};

export default StudioPage;
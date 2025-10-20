import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Share2, Download, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { LayersPanel } from '@/components/canvas/LayersPanel';
import { TimelineFlow } from '@/components/canvas/TimelineFlow';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CanvasObject, ImageData } from '@/types/canvas';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { applyAITransformation } from '@/lib/fal/transformations';

export default function KanvasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [showTimeline, setShowTimeline] = useState(true);
  const [projectId, setProjectId] = useState<string>('temp-project');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { objects, addObject, setProjectId: setStoreProjectId } = useCanvasStore();

  // Initialize project
  useEffect(() => {
    if (user) {
      // Generate or load project ID
      const tempId = `kanvas-${user.id}-${Date.now()}`;
      setProjectId(tempId);
      setStoreProjectId(tempId);
    }
  }, [user, setStoreProjectId]);

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleSaveProject = async () => {
    try {
      toast.loading('Saving project...', { id: 'save-project' });

      // Here you would save to Supabase
      // For now, we'll just save to localStorage as a backup
      localStorage.setItem(`kanvas-project-${projectId}`, JSON.stringify({
        objects,
        projectId,
        savedAt: new Date().toISOString(),
      }));

      toast.success('Project saved successfully', { id: 'save-project' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project', { id: 'save-project' });
    }
  };

  const handleExportImage = async () => {
    try {
      toast.info('Export functionality coming soon!');
      // Here you would export the canvas to an image
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading image...', { id: 'upload-image' });

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kanvas/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create image object
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const newObject: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'image',
          layerIndex: objects.length,
          transform: {
            x: 100,
            y: 100,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
          },
          visibility: true,
          locked: false,
          data: {
            url: urlData.publicUrl,
            width: img.width,
            height: img.height,
          } as ImageData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addObject(newObject);
        toast.success('Image uploaded successfully', { id: 'upload-image' });
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: 'upload-image' });
    }
  };

  const handleApplyAI = async (transformation: string) => {
    if (!selectedObjectId) {
      toast.error('Please select an image first');
      return;
    }

    const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObject || selectedObject.type !== 'image') {
      toast.error('Please select an image layer');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Applying AI transformation...', { id: 'ai-transform' });

      const imageData = selectedObject.data as ImageData;
      const result = await applyAITransformation(transformation as any, {
        imageUrl: imageData.url,
      });

      // Create new object with transformed image
      const newObject: CanvasObject = {
        ...selectedObject,
        id: crypto.randomUUID(),
        data: {
          ...imageData,
          url: result.imageUrl,
        },
        transform: {
          ...selectedObject.transform,
          x: selectedObject.transform.x + 20,
          y: selectedObject.transform.y + 20,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addObject(newObject);
      toast.success('AI transformation applied', { id: 'ai-transform' });
      setShowAIDialog(false);
    } catch (error) {
      console.error('AI transformation error:', error);
      toast.error('Failed to apply transformation', { id: 'ai-transform' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="h-14 border-b border-white/[0.08] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/home')}
            className="text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="h-6 w-px bg-white/[0.08]" />

          <h1 className="text-lg font-semibold text-white">Infinite Kanvas</h1>
          <span className="text-xs text-white/40">Untitled Project</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAIDialog(true)}
            className="text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Tools
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleImageUpload}
            className="text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSaveProject}
            className="text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportImage}
            className="text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            size="sm"
            className="bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/25"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Canvas Area */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="relative h-full flex flex-col">
              {/* Canvas */}
              <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
                <InfiniteCanvas
                  projectId={projectId}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onObjectSelect={setSelectedObjectId}
                />
                <CanvasToolbar onAddImage={handleImageUpload} />
              </div>

              {/* Timeline */}
              {showTimeline && (
                <>
                  <ResizableHandle withHandle />
                  <div className="h-64 border-t border-white/[0.08]">
                    <TimelineFlow projectId={projectId} />
                  </div>
                </>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Layers */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <LayersPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* AI Tools Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-zinc-950 border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-white">AI Transformations</DialogTitle>
            <DialogDescription className="text-white/60">
              Apply AI-powered transformations to your selected image
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              onClick={() => handleApplyAI('upscale')}
              disabled={isProcessing}
              className="h-20 flex flex-col gap-2 border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.08]"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Upscale 2x</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleApplyAI('remove-bg')}
              disabled={isProcessing}
              className="h-20 flex flex-col gap-2 border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.08]"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Remove BG</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleApplyAI('img2img')}
              disabled={isProcessing}
              className="h-20 flex flex-col gap-2 border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.08]"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Enhance</span>
            </Button>

            <Button
              variant="outline"
              disabled
              className="h-20 flex flex-col gap-2 border-white/[0.08] bg-white/[0.02] text-white/40"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">More Soon</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

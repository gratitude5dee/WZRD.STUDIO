import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Box, Loader2, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/types/computeFlow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ModelSelector from './ModelSelector';

interface ThreeDNodeData {
  status?: string;
  progress?: number;
  error?: string;
  prompt?: string;
  imageUrl?: string;
  modelUrl?: string;
  model?: string;
}

const THREE_D_MODELS = [
  { id: 'fal-ai/trellis/multi', name: 'Trellis Multi', description: 'Image to 3D' },
  { id: 'fal-ai/stable-fast-3d', name: 'Stable Fast 3D', description: 'Fast 3D generation' },
  { id: 'fal-ai/triposr', name: 'TripoSR', description: 'Single image to 3D' },
];

const THREE_D_MODEL_OPTIONS = THREE_D_MODELS.map((model) => ({
  id: model.id,
  label: model.name,
}));

export const ReactFlow3DNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as ThreeDNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  
  const [prompt, setPrompt] = useState(nodeData?.prompt || '');
  const [imageUrl, setImageUrl] = useState<string | null>(nodeData?.imageUrl || null);
  const [modelUrl, setModelUrl] = useState<string | null>(nodeData?.modelUrl || null);
  const [model, setModel] = useState(nodeData?.model || 'fal-ai/triposr');
  const [isGenerating, setIsGenerating] = useState(false);
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  const dataOnModelChange = (data as any)?.onModelChange;

  const handles = [
    {
      id: 'image-input',
      type: 'target' as const,
      position: Position.Top,
      dataType: 'image' as const,
      label: 'Image',
    },
    {
      id: 'prompt-input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'text' as const,
      label: 'Prompt',
    },
    {
      id: '3d-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'tensor' as const,
      label: '3D Model',
    },
  ];

  const handleGenerate = useCallback(async () => {
    if (!imageUrl && !prompt.trim()) {
      toast.error('Please provide an image or prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('fal-proxy', {
        body: {
          model_id: model,
          input: {
            image_url: imageUrl,
            prompt: prompt || undefined,
          },
        },
      });

      if (fnError) throw fnError;

      // Extract 3D model URL from result
      const meshUrl = result?.mesh?.url || result?.model_mesh?.url || result?.output?.url;
      if (meshUrl) {
        setModelUrl(meshUrl);
        toast.success('3D model generated!');
      } else {
        throw new Error('No 3D model in response');
      }
    } catch (err: any) {
      console.error('3D generation failed:', err);
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, imageUrl, model]);

  const handleModelChange = useCallback(
    (modelId: string) => {
      setModel(modelId);
      dataOnModelChange?.(modelId);
    },
    [dataOnModelChange]
  );

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const path = `uploads/${id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('canvas-assets')
            .upload(path, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('canvas-assets')
            .getPublicUrl(path);

          setImageUrl(publicUrl);
          toast.success('Image uploaded!');
        } catch (err: any) {
          toast.error(err.message || 'Upload failed');
        }
      }
    };
    input.click();
  }, [id]);

  return (
    <BaseNode
      handles={handles}
      nodeType="3d"
      isSelected={selected}
      hoverMenu={{
        selectedModel: model,
        modelOptions: THREE_D_MODEL_OPTIONS,
        onModelChange: handleModelChange,
        onGenerate: handleGenerate,
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-80 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-cyan-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-white font-mono text-sm">3D Generation</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Model Selector */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Model</label>
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THREE_D_MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    <div className="flex flex-col">
                      <span>{m.name}</span>
                      <span className="text-[10px] text-zinc-500">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Input */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Reference Image</label>
            {imageUrl ? (
              <div className="relative group">
                <img src={imageUrl} alt="Reference" className="w-full h-24 object-cover rounded-lg border border-zinc-700" />
                <button
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleImageUpload}
                className="w-full h-20 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-cyan-500/50 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-zinc-500" />
                <span className="text-xs text-zinc-400">Upload reference image</span>
              </button>
            )}
          </div>

          {/* Prompt (optional) */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Prompt (Optional)</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Additional description..."
              className="min-h-[50px] text-xs bg-zinc-900 border-zinc-700 resize-none"
            />
          </div>

          {/* Generated 3D Preview */}
          {modelUrl && (
            <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700">
              <Box className="w-8 h-8 text-cyan-400" />
              <p className="text-xs text-zinc-400">3D Model Ready</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => window.open(modelUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View 3D Model
              </Button>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!imageUrl && !prompt.trim())}
            className="w-full h-8 bg-cyan-500 hover:bg-cyan-600 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Generating 3D...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1.5" />
                Generate 3D Model
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseNode>
  );
});

ReactFlow3DNode.displayName = 'ReactFlow3DNode';

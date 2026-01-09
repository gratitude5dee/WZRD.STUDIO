import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Box, Upload, X, ExternalLink } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import type { NodeStatus } from '@/types/computeFlow';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Upload3DNodeData {
  status?: string;
  progress?: number;
  error?: string;
  modelUrl?: string;
  fileName?: string;
}

export const Upload3DNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as Upload3DNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
  const [modelUrl, setModelUrl] = useState<string | null>(nodeData?.modelUrl || null);
  const [fileName, setFileName] = useState<string | null>(nodeData?.fileName || null);
  const [isUploading, setIsUploading] = useState(false);

  const handles = [
    {
      id: '3d-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'tensor' as const, // Using tensor for 3D data
      label: '3D Model',
    },
  ];

  const handleFileSelect = useCallback(async (file: File) => {
    const validExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.stl'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      toast.error('Please select a 3D model file (GLB, GLTF, OBJ, FBX, STL)');
      return;
    }

    setIsUploading(true);
    try {
      const path = `uploads/${id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('canvas-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('canvas-assets')
        .getPublicUrl(path);

      setModelUrl(publicUrl);
      setFileName(file.name);
      toast.success('3D model uploaded!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf,.obj,.fbx,.stl';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModelUrl(null);
    setFileName(null);
  }, []);

  return (
    <BaseNode
      handles={handles}
      nodeType="3d"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-72 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-cyan-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-white font-mono text-sm">Upload 3D</span>
          </div>
          <span className="text-zinc-500 text-xs">Source</span>
        </div>

        {/* Upload Area */}
        <div
          className="p-3"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {modelUrl ? (
            <div className="relative">
              <div className="flex flex-col items-center gap-3 p-4 bg-zinc-900/60 rounded-lg border border-zinc-700">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Box className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-300 truncate max-w-full font-medium">{fileName}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">3D Model</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.open(modelUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Model
                </Button>
                <button
                  onClick={handleClear}
                  className="absolute top-2 right-2 p-1 hover:bg-zinc-700 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleClick}
              className={cn(
                "h-32 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/60",
                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                "hover:border-cyan-500/50 hover:bg-zinc-800/50 transition-colors",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <Upload className={cn("w-6 h-6", isUploading ? "animate-pulse text-cyan-400" : "text-zinc-500")} />
              <p className="text-xs text-zinc-400">
                {isUploading ? 'Uploading...' : 'Drop 3D model or click'}
              </p>
              <p className="text-[10px] text-zinc-600">GLB, GLTF, OBJ, FBX, STL</p>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

Upload3DNode.displayName = 'Upload3DNode';

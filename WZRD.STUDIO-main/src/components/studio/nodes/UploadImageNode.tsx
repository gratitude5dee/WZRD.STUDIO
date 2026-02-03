import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Image, Upload, X } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import type { NodeStatus } from '@/types/computeFlow';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadImageNodeData {
  status?: string;
  progress?: number;
  error?: string;
  imageUrl?: string;
  fileName?: string;
}

export const UploadImageNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as UploadImageNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
  const [imageUrl, setImageUrl] = useState<string | null>(nodeData?.imageUrl || null);
  const [fileName, setFileName] = useState<string | null>(nodeData?.fileName || null);
  const [isUploading, setIsUploading] = useState(false);

  const handles = [
    {
      id: 'image-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'image' as const,
      label: 'Image',
    },
  ];

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
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

      setImageUrl(publicUrl);
      setFileName(file.name);
      toast.success('Image uploaded!');
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
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(null);
    setFileName(null);
  }, []);

  return (
    <BaseNode
      handles={handles}
      nodeType="image"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-72 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-green-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-500/10">
              <Image className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-white font-mono text-sm">Upload Image</span>
          </div>
          <span className="text-zinc-500 text-xs">Source</span>
        </div>

        {/* Upload Area */}
        <div
          className="p-3"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {imageUrl ? (
            <div className="relative group">
              <img
                src={imageUrl}
                alt={fileName || 'Uploaded'}
                className="w-full h-32 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {fileName && (
                <p className="text-[10px] text-zinc-500 mt-1 truncate">{fileName}</p>
              )}
            </div>
          ) : (
            <div
              onClick={handleClick}
              className={cn(
                "h-32 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/60",
                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                "hover:border-green-500/50 hover:bg-zinc-800/50 transition-colors",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <Upload className={cn("w-6 h-6", isUploading ? "animate-pulse text-green-400" : "text-zinc-500")} />
              <p className="text-xs text-zinc-400">
                {isUploading ? 'Uploading...' : 'Drop image or click'}
              </p>
              <p className="text-[10px] text-zinc-600">PNG, JPG, WEBP</p>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

UploadImageNode.displayName = 'UploadImageNode';

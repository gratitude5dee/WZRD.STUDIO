import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Music, Upload, X, Play, Pause } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import type { NodeStatus } from '@/types/computeFlow';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadAudioNodeData {
  status?: string;
  progress?: number;
  error?: string;
  audioUrl?: string;
  fileName?: string;
}

export const UploadAudioNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as UploadAudioNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
  const [audioUrl, setAudioUrl] = useState<string | null>(nodeData?.audioUrl || null);
  const [fileName, setFileName] = useState<string | null>(nodeData?.fileName || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handles = [
    {
      id: 'audio-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'audio' as const,
      label: 'Audio',
    },
  ];

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
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

      setAudioUrl(publicUrl);
      setFileName(file.name);
      toast.success('Audio uploaded!');
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
    input.accept = 'audio/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioUrl(null);
    setFileName(null);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [id, isPlaying]);

  return (
    <BaseNode
      handles={handles}
      nodeType="audio"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-72 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-pink-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-pink-500/10">
              <Music className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <span className="text-white font-mono text-sm">Upload Audio</span>
          </div>
          <span className="text-zinc-500 text-xs">Source</span>
        </div>

        {/* Upload Area */}
        <div
          className="p-3"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {audioUrl ? (
            <div className="relative">
              <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-pink-500/20 rounded-full hover:bg-pink-500/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Play className="w-4 h-4 text-pink-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{fileName}</p>
                  <div className="h-1 bg-zinc-700 rounded-full mt-1">
                    <div className="h-full bg-pink-500 rounded-full w-0" />
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
              <audio
                id={`audio-${id}`}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div
              onClick={handleClick}
              className={cn(
                "h-24 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/60",
                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                "hover:border-pink-500/50 hover:bg-zinc-800/50 transition-colors",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <Upload className={cn("w-6 h-6", isUploading ? "animate-pulse text-pink-400" : "text-zinc-500")} />
              <p className="text-xs text-zinc-400">
                {isUploading ? 'Uploading...' : 'Drop audio or click'}
              </p>
              <p className="text-[10px] text-zinc-600">MP3, WAV, M4A</p>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

UploadAudioNode.displayName = 'UploadAudioNode';

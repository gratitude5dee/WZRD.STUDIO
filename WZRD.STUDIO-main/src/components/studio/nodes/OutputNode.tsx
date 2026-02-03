import { memo, useState } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Download, Play, FileText, Image as ImageIcon, Video, Music, Box, ExternalLink, Check } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import type { NodeStatus } from '@/types/computeFlow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OutputType = 'image' | 'video' | 'audio' | 'text' | '3d' | 'unknown';

interface OutputNodeData {
  status?: string;
  progress?: number;
  error?: string;
  inputValue?: string;
  inputType?: OutputType;
  label?: string;
}

const OUTPUT_TYPE_ICONS: Record<OutputType, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
  '3d': Box,
  unknown: FileText,
};

const OUTPUT_TYPE_COLORS: Record<OutputType, string> = {
  image: 'text-green-400',
  video: 'text-purple-400',
  audio: 'text-pink-400',
  text: 'text-amber-400',
  '3d': 'text-cyan-400',
  unknown: 'text-zinc-400',
};

export const OutputNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as OutputNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  const inputValue = nodeData?.inputValue;
  const inputType: OutputType = nodeData?.inputType || 'unknown';
  const label = nodeData?.label || 'Output';
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
  const [isDownloading, setIsDownloading] = useState(false);

  const Icon = OUTPUT_TYPE_ICONS[inputType];

  const handles = [
    {
      id: 'input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'any' as const,
      label: 'Input',
    },
  ];

  const handleDownload = async () => {
    if (!inputValue) {
      toast.error('No content to download');
      return;
    }

    setIsDownloading(true);
    try {
      // For URLs, fetch and download
      if (inputValue.startsWith('http') || inputValue.startsWith('data:')) {
        const response = await fetch(inputValue);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `output-${id}.${inputType === 'image' ? 'png' : inputType === 'video' ? 'mp4' : inputType === 'audio' ? 'mp3' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
      } else {
        // For text content
        const blob = new Blob([inputValue], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `output-${id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
      }
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreview = () => {
    if (!inputValue) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
          <Icon className="w-8 h-8 opacity-50" />
          <p className="text-xs">Waiting for input...</p>
        </div>
      );
    }

    switch (inputType) {
      case 'image':
        return (
          <img
            src={inputValue}
            alt="Output"
            className="w-full h-full object-contain rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            src={inputValue}
            controls
            className="w-full h-full object-contain rounded-lg"
          />
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Music className="w-8 h-8 text-pink-400" />
            <audio src={inputValue} controls className="w-full" />
          </div>
        );
      case 'text':
        return (
          <div className="w-full h-full p-2 overflow-auto text-xs text-zinc-300 font-mono bg-zinc-900/50 rounded-lg">
            {inputValue.slice(0, 500)}{inputValue.length > 500 ? '...' : ''}
          </div>
        );
      case '3d':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Box className="w-8 h-8 text-cyan-400" />
            <p className="text-xs text-zinc-400">3D Model</p>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.open(inputValue, '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" />
              View in 3D
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p className="text-xs">Unknown format</p>
          </div>
        );
    }
  };

  return (
    <BaseNode
      handles={handles}
      nodeType="output"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-72 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-emerald-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md bg-emerald-500/10", OUTPUT_TYPE_COLORS[inputType])}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-mono text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            {inputValue && (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="h-36 p-2">
          {renderPreview()}
        </div>

        {/* Actions */}
        <div className="px-3 py-2 border-t border-zinc-800 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
            onClick={handleDownload}
            disabled={!inputValue || isDownloading}
          >
            <Download className="w-3 h-3 mr-1" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          {(inputType === 'video' || inputType === 'audio') && inputValue && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => {
                const el = document.querySelector(`#output-${id} video, #output-${id} audio`) as HTMLMediaElement;
                if (el) el.play();
              }}
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

OutputNode.displayName = 'OutputNode';

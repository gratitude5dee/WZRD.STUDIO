import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Music, Loader2, Play, Pause, Sparkles } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/types/computeFlow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AudioNodeData {
  status?: string;
  progress?: number;
  error?: string;
  prompt?: string;
  audioUrl?: string;
  model?: string;
}

const AUDIO_MODELS = [
  { id: 'elevenlabs-sfx', name: 'ElevenLabs SFX', type: 'sfx' },
  { id: 'elevenlabs-music', name: 'ElevenLabs Music', type: 'music' },
];

export const ReactFlowAudioNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as AudioNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  
  const [prompt, setPrompt] = useState(nodeData?.prompt || '');
  const [audioUrl, setAudioUrl] = useState<string | null>(nodeData?.audioUrl || null);
  const [model, setModel] = useState(nodeData?.model || 'elevenlabs-sfx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handles = [
    {
      id: 'text-input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'text' as const,
      label: 'Prompt',
    },
    {
      id: 'audio-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'audio' as const,
      label: 'Audio',
    },
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const functionName = model === 'elevenlabs-music' ? 'elevenlabs-music' : 'elevenlabs-sfx';
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ 
            prompt, 
            duration: model === 'elevenlabs-music' ? 30 : 5 
          }),
        }
      );

      if (!response.ok) throw new Error('Generation failed');

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      toast.success('Audio generated!');
    } catch (err: any) {
      console.error('Audio generation failed:', err);
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, model]);

  const togglePlay = useCallback(() => {
    const audio = document.getElementById(`audio-gen-${id}`) as HTMLAudioElement;
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
    <BaseNode handles={handles} nodeType="audio" isSelected={selected}>
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-80 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-pink-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-pink-500/10">
              <Music className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <span className="text-white font-mono text-sm">Audio Generation</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Model Selector */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIO_MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={model === 'elevenlabs-music' ? 'Epic orchestral soundtrack...' : 'Footsteps on gravel...'}
              className="min-h-[60px] text-xs bg-zinc-900 border-zinc-700 resize-none"
            />
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="flex items-center gap-2 p-2 bg-zinc-900/60 rounded-lg border border-zinc-700">
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
              <div className="flex-1 h-1 bg-zinc-700 rounded-full">
                <div className="h-full bg-pink-500 rounded-full w-0" />
              </div>
              <audio
                id={`audio-gen-${id}`}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-8 bg-pink-500 hover:bg-pink-600 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1.5" />
                Generate Audio
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseNode>
  );
});

ReactFlowAudioNode.displayName = 'ReactFlowAudioNode';

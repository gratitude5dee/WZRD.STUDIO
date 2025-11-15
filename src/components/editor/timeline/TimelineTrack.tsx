import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Clip, AudioTrack } from '@/store/videoEditorStore';
import { TimelineClip } from './TimelineClip';
import { WaveformRenderer } from './WaveformRenderer';

interface TimelineTrackProps {
  type: 'video' | 'audio';
  index: number;
  clips?: Clip[];
  audioTrack?: AudioTrack;
  zoom: number;
  selectedIds: string[];
  onSelect: (id: string, additive: boolean) => void;
}

export function TimelineTrack({
  type,
  index,
  clips = [],
  audioTrack,
  zoom,
  onSelect,
  selectedIds,
}: TimelineTrackProps) {
  const [collapsed, setCollapsed] = useState(false);
  const items: (Clip | AudioTrack)[] =
    type === 'audio' && audioTrack ? clips.length ? clips : [audioTrack] : clips;
  const sortedItems = [...items].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  return (
    <div className="border-b border-border bg-card/30 hover:bg-card/50 transition-colors">
      <div className="flex items-center h-10 px-3 border-b border-border/50 text-muted-foreground text-xs font-medium">
        <button
          className="mr-2 hover:text-foreground transition-colors p-1 rounded hover:bg-accent/10"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle track visibility"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${type === 'video' ? 'bg-primary' : 'bg-accent'}`} />
          <span className="uppercase tracking-wider text-[11px]">
            {type === 'video' ? `Video Track ${index + 1}` : `Audio Track ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] tabular-nums">
          <span className="text-muted-foreground/60">{sortedItems.length} clip{sortedItems.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {!collapsed && (
        <div className="relative h-20 overflow-hidden">
          {type === 'audio' && audioTrack && <WaveformRenderer track={audioTrack} />}
          {sortedItems.map((clip) => (
            <TimelineClip
              key={clip.id}
              clip={clip}
              zoom={zoom}
              onSelect={onSelect}
              isSelected={selectedIds.includes(clip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="border-b border-[#1D2130] bg-[#0F1117]">
      <div className="flex items-center h-8 px-3 border-b border-[#1D2130] text-[#8E94A8] text-xs uppercase tracking-wide">
        <button
          className="mr-2 text-[#8E94A8]"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle track visibility"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <span className="font-semibold">{type === 'video' ? `Video ${index + 1}` : `Audio ${index + 1}`}</span>
      </div>
      {!collapsed && (
        <div className="relative h-16 overflow-hidden">
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

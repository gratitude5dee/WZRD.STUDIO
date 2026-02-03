import { useState } from 'react';
import { ChevronDown, ChevronRight, Video, Music } from 'lucide-react';
import { Clip, AudioTrack, useVideoEditorStore, type LibraryMediaItem } from '@/store/videoEditorStore';
import { TimelineClip } from './TimelineClip';
import { WaveformRenderer } from './WaveformRenderer';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';
import { useDrop } from '@/lib/react-dnd';

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
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  
  const items: (Clip | AudioTrack)[] =
    type === 'audio' && audioTrack ? (clips.length ? clips : [audioTrack]) : clips;
  const sortedItems = [...items].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  const Icon = type === 'video' ? Video : Music;

  // Drop zone for adding clips from media library
  const [{ isOver }, dropRef] = useDrop({
    accept: 'MEDIA_ITEM',
    drop: (item: { mediaItem: LibraryMediaItem }, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      
      // Get the track element to calculate position
      const trackElement = document.querySelector(`[data-track-type="${type}-${index}"]`);
      if (!trackElement) return;
      
      const trackRect = trackElement.getBoundingClientRect();
      const relativeX = offset.x - trackRect.left;
      const timeMs = Math.max(0, (relativeX / zoom) * 1000);
      
      // Create clip or audio at drop position
      const durationMs = (item.mediaItem.durationSeconds ?? 5) * 1000;
      
      if (type === 'audio' && item.mediaItem.mediaType === 'audio') {
        // Add audio track
        const newAudioTrack = {
          id: crypto.randomUUID(),
          mediaItemId: item.mediaItem.id,
          type: 'audio' as const,
          name: item.mediaItem.name,
          url: item.mediaItem.url!,
          startTime: timeMs,
          duration: durationMs,
          endTime: timeMs + durationMs,
          volume: 1,
          isMuted: false,
          trackIndex: audioTracks.length,
        };
        addAudioTrack(newAudioTrack);
      } else if (type === 'video' && item.mediaItem.mediaType !== 'audio') {
        // Add video/image clip
        const newClip = {
          id: crypto.randomUUID(),
          mediaItemId: item.mediaItem.id,
          type: item.mediaItem.mediaType === 'image' ? 'image' as const : 'video' as const,
          name: item.mediaItem.name,
          url: item.mediaItem.url!,
          startTime: timeMs,
          duration: durationMs,
          endTime: timeMs + durationMs,
          layer: 0,
          trackIndex: clips.filter(c => c.layer === 0).length,
          transforms: {
            position: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            rotation: 0,
            opacity: 1,
          },
        };
        addClip(newClip);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      style={{
        borderBottom: `1px solid ${editorTheme.border.subtle}`,
        background: editorTheme.bg.secondary,
      }}
    >
      {/* Track Header */}
      <div
        className="flex items-center"
        style={{
          height: '40px',
          paddingLeft: '12px',
          paddingRight: '12px',
          borderBottom: `1px solid ${editorTheme.border.subtle}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          color: editorTheme.text.secondary,
        }}
      >
        <button
          className="mr-2 p-1 rounded transition-colors"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle track visibility"
          style={{
            color: editorTheme.text.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = editorTheme.bg.hover;
            e.currentTarget.style.color = editorTheme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = editorTheme.text.secondary;
          }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        <div className="flex items-center gap-2 flex-1">
          <Icon
            className="h-4 w-4"
            style={{ color: type === 'video' ? editorTheme.accent.primary : editorTheme.accent.secondary }}
          />
          <span
            className="uppercase tracking-wider"
            style={{
              fontSize: typography.fontSize.xs,
              color: editorTheme.text.secondary,
            }}
          >
            {type === 'video' ? `Video Track ${index + 1}` : `Audio Track ${index + 1}`}
          </span>
        </div>
        
        <div
          className="tabular-nums"
          style={{
            fontSize: typography.fontSize.xs,
            color: editorTheme.text.tertiary,
          }}
        >
          {sortedItems.length} clip{sortedItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Track Content */}
      {!collapsed && (
        <div
          ref={dropRef}
          data-track-type={`${type}-${index}`}
          className="relative overflow-hidden"
          style={{
            height: `${exactMeasurements.timeline.trackHeight}px`,
            background: isOver ? 'hsl(var(--primary) / 0.1)' : editorTheme.bg.secondary,
            border: isOver ? '2px dashed hsl(var(--primary))' : 'none',
            transition: 'all 0.2s',
          }}
        >
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

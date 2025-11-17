import { useState } from 'react';
import { ChevronDown, ChevronRight, Video, Music } from 'lucide-react';
import { Clip, AudioTrack, useVideoEditorStore } from '@/store/videoEditorStore';
import { TimelineClip } from './TimelineClip';
import { WaveformRenderer } from './WaveformRenderer';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';

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
    type === 'audio' && audioTrack ? (clips.length ? clips : [audioTrack]) : clips;
  const sortedItems = [...items].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  const Icon = type === 'video' ? Video : Music;

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
          className="relative overflow-hidden"
          style={{
            height: `${exactMeasurements.timeline.trackHeight}px`,
            background: editorTheme.bg.secondary,
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

import { MouseEvent, PointerEvent as ReactPointerEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useDrag } from '@/lib/react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Film, Music } from 'lucide-react';
import { useVideoEditorStore, Clip, AudioTrack } from '@/store/videoEditorStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { buildSnapPoints, snapValue } from './snapping';

interface TimelineClipProps {
  clip: Clip | AudioTrack;
  zoom: number;
  onSelect: (id: string, additive: boolean) => void;
  isSelected: boolean;
}

export function TimelineClip({ clip, zoom, onSelect, isSelected }: TimelineClipProps) {
  const updateClip = useVideoEditorStore((state) => state.updateClip);
  const updateAudioTrack = useVideoEditorStore((state) => state.updateAudioTrack);
  const removeClip = useVideoEditorStore((state) => state.removeClip);
  const removeAudioTrack = useVideoEditorStore((state) => state.removeAudioTrack);
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const timeline = useVideoEditorStore((state) => state.timeline);
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const [isHovered, setIsHovered] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const pendingTrim = useRef<{ startTime: number; duration: number } | null>(null);

  const duration = clip.duration ?? 1000;
  const widthPx = (duration / 1000) * zoom;
  const leftPx = ((clip.startTime ?? 0) / 1000) * zoom;

  const snapPoints = useMemo(
    () => buildSnapPoints(clips, audioTracks, clip.id),
    [audioTracks, clip.id, clips]
  );

  const applySnapping = useCallback(
    (value: number) =>
      snapValue(value, snapPoints, {
        snapToGrid: timeline.snapToGrid,
        gridSize: timeline.gridSize,
      }),
    [snapPoints, timeline.gridSize, timeline.snapToGrid]
  );

  const commitUpdate = useCallback(
    (updates: Partial<Clip> | Partial<AudioTrack>, skipHistory = false) => {
      if (clip.type === 'audio') {
        updateAudioTrack(clip.id, updates as Partial<AudioTrack>, { skipHistory });
      } else {
        updateClip(clip.id, updates as Partial<Clip>, { skipHistory });
      }
    },
    [clip.id, clip.type, updateAudioTrack, updateClip]
  );

  const [{ isDragging }, dragRef] = useDrag({
    type: 'TIMELINE_CLIP',
    item: { id: clip.id, startTime: clip.startTime },
    end: (_, monitor) => {
      const diff = monitor.getDifferenceFromInitialOffset();
      if (!diff) return;
      const deltaMs = (diff.x / zoom) * 1000;
      if (!deltaMs) return;
      const targetStart = applySnapping((clip.startTime ?? 0) + deltaMs);
      commitUpdate({ startTime: Math.max(0, targetStart) });
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleSelect = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(clip.id, event.metaKey || event.ctrlKey);
  };

  const handleTrimPointerDown = (edge: 'start' | 'end') => (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsTrimming(true);
    const startX = event.clientX;
    const initialStart = clip.startTime ?? 0;
    const initialDuration = clip.duration ?? 1000;

    const onMove = (moveEvent: PointerEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const deltaMs = (deltaPx / zoom) * 1000;
      let newStart = initialStart;
      let newDuration = initialDuration;
      if (edge === 'start') {
        newStart = initialStart + deltaMs;
        newDuration = initialDuration - deltaMs;
      } else {
        newDuration = initialDuration + deltaMs;
      }
      newDuration = Math.max(200, newDuration);
      if (edge === 'start') {
        newStart = Math.min(newStart, initialStart + initialDuration - 200);
      }
      const snappedStart = edge === 'start' ? applySnapping(newStart) : newStart;
      pendingTrim.current = {
        startTime: Math.max(0, snappedStart),
        duration: newDuration,
      };
      commitUpdate(
        {
          startTime: pendingTrim.current.startTime,
          duration: pendingTrim.current.duration,
          endTime: pendingTrim.current.startTime + pendingTrim.current.duration,
        },
        true
      );
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      if (pendingTrim.current) {
        commitUpdate(
          {
            startTime: pendingTrim.current.startTime,
            duration: pendingTrim.current.duration,
            endTime: pendingTrim.current.startTime + pendingTrim.current.duration,
          },
          false
        );
        pendingTrim.current = null;
      }
      setIsTrimming(false);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  };

  const handleDelete = () => {
    if (clip.type === 'audio') {
      removeAudioTrack(clip.id);
    } else {
      removeClip(clip.id);
    }
  };

  const duplicateItem = () => {
    const offset = timeline.gridSize || 100;
    if (clip.type === 'audio') {
      addAudioTrack({
        ...(clip as AudioTrack),
        id: uuidv4(),
        startTime: (clip.startTime ?? 0) + offset,
        endTime: (clip.endTime ?? (clip.startTime ?? 0) + (clip.duration ?? 0)) + offset,
      });
    } else {
      addClip({
        ...(clip as Clip),
        id: uuidv4(),
        startTime: (clip.startTime ?? 0) + offset,
        endTime: (clip.endTime ?? (clip.startTime ?? 0) + (clip.duration ?? 0)) + offset,
      });
    }
  };

  const toggleMute = () => {
    if (clip.type === 'audio') {
      updateAudioTrack(clip.id, { isMuted: !clip.isMuted });
    }
  };

  const clipColors = clip.type === 'audio'
    ? 'bg-accent/20 border-accent/40'
    : 'bg-primary/20 border-primary/40';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={dragRef}
          className="absolute cursor-move overflow-hidden transition-all"
          style={{
            width: `${widthPx}px`,
            left: `${leftPx}px`,
            top: '4px',
            height: 'calc(100% - 8px)',
            background: clip.type === 'audio' 
              ? `linear-gradient(135deg, #7E12FF 0%, #5209B8 100%)`
              : `linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)`,
            borderRadius: '4px',
            border: isSelected ? '2px solid #7E12FF' : '1px solid rgba(255, 255, 255, 0.1)',
            opacity: isDragging || isTrimming ? 0.5 : 1,
            boxShadow: isSelected 
              ? '0 0 0 1px rgba(126, 18, 255, 0.5), 0 4px 12px rgba(126, 18, 255, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
          onClick={handleSelect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Thumbnail strip for video clips */}
          {clip.type !== 'audio' && 'url' in clip && clip.url && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(${clip.url})`,
                backgroundSize: 'auto 100%',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'left center',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
            }}
          />

          {/* Clip name label */}
          <div
            className="absolute top-0 left-0 flex items-center gap-1 px-2 py-1 pointer-events-none truncate"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderBottomRightRadius: '4px',
              fontSize: '11px',
              color: 'white',
              maxWidth: 'calc(100% - 32px)',
            }}
          >
            {clip.type === 'audio' ? (
              <Music className="w-3 h-3 flex-shrink-0" />
            ) : (
              <Film className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{clip.name || 'Unnamed'}</span>
          </div>

          {/* Left resize handle */}
          <div
            className="absolute left-0 top-0 bottom-0 transition-all"
            style={{
              width: isHovered ? '8px' : '2px',
              cursor: 'ew-resize',
              background: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              borderLeft: isHovered ? '2px solid rgba(255, 255, 255, 0.8)' : 'none',
            }}
            onPointerDown={handleTrimPointerDown('start')}
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Right resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 transition-all"
            style={{
              width: isHovered ? '8px' : '2px',
              cursor: 'ew-resize',
              background: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              borderRight: isHovered ? '2px solid rgba(255, 255, 255, 0.8)' : 'none',
            }}
            onPointerDown={handleTrimPointerDown('end')}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-card text-foreground border-border">
        <ContextMenuItem
          onSelect={(event) => {
            event.preventDefault();
            duplicateItem();
          }}
        >
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleDelete();
          }}
        >
          Delete
        </ContextMenuItem>
        {clip.type === 'audio' && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={(event) => {
                event.preventDefault();
                toggleMute();
              }}
            >
              {clip.isMuted ? 'Unmute' : 'Mute'}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

import { MouseEvent, PointerEvent as ReactPointerEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useDrag } from '@/lib/react-dnd';
import { v4 as uuidv4 } from 'uuid';
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
          className={`absolute h-14 rounded overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-150 group ${
            isDragging || isTrimming ? 'opacity-70 scale-95' : 'opacity-100'
          } ${clip.type === 'audio' ? 'bg-accent/80 border border-accent' : 'bg-[#2a2a2a] border-2'}`}
          style={{
            left: `${leftPx}px`,
            width: `${Math.max(60, widthPx)}px`,
            borderColor: isSelected ? '#50FF12' : '#2a2a2a',
          }}
          onClick={handleSelect}
        >
          {/* Trim handle - start */}
          <div
            className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:w-2 transition-all z-10"
            style={{ backgroundColor: '#50FF12' }}
            onPointerDown={handleTrimPointerDown('start')}
          />

          {/* Clip content with text overlay */}
          <div className="relative h-full">
            {/* Text overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1 pointer-events-none">
              <p className="text-xs text-white truncate">{clip.name || 'Untitled'}</p>
              {clip.type === 'audio' && clip.isMuted && (
                <p className="text-[10px] text-red-400">MUTED</p>
              )}
            </div>
          </div>

          {/* Trim handle - end */}
          <div
            className="absolute right-0 top-0 w-1 h-full cursor-ew-resize hover:w-2 transition-all z-10"
            style={{ backgroundColor: '#50FF12' }}
            onPointerDown={handleTrimPointerDown('end')}
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

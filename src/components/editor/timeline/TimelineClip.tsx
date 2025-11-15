import { MouseEvent, PointerEvent as ReactPointerEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
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
    ? 'bg-[#1A1D2E] text-[#8E94A8]'
    : 'bg-[#2D3142] text-white';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={dragRef}
          className={`absolute h-12 rounded border-2 transition-colors duration-150 ${clipColors} ${
            isSelected ? 'border-[#9b87f5]' : 'border-transparent'
          } ${isDragging || isTrimming ? 'opacity-70' : 'opacity-100'} cursor-move`}
          style={{
            left: `${leftPx}px`,
            width: `${Math.max(40, widthPx)}px`,
          }}
          onClick={handleSelect}
        >
          <div className="p-2 text-xs truncate">
            {clip.name || 'Untitled Clip'}
          </div>
          <div
            className="absolute left-0 top-0 w-2 h-full bg-[#9b87f5] opacity-60 cursor-ew-resize"
            onPointerDown={handleTrimPointerDown('start')}
          />
          <div
            className="absolute right-0 top-0 w-2 h-full bg-[#9b87f5] opacity-60 cursor-ew-resize"
            onPointerDown={handleTrimPointerDown('end')}
          />
        </div>
      </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#0F1117] text-white border border-[#1D2130]">
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

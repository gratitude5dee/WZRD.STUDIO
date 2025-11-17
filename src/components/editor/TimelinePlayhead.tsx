import React, { useRef, useCallback } from 'react';
import { editorTheme, exactMeasurements } from '@/lib/editor/theme';

interface TimelinePlayheadProps {
  currentTime: number;
  duration: number;
  pixelsPerSecond: number;
  scrollOffset?: number;
  onSeek?: (time: number) => void;
}

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({
  currentTime,
  duration,
  pixelsPerSecond,
  scrollOffset = 0,
  onSeek,
}) => {
  const position = Math.max(0, currentTime * pixelsPerSecond - scrollOffset);
  const isDraggingRef = useRef(false);
  const playheadRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onSeek) return;
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = true;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current || !playheadRef.current) return;

        const parent = playheadRef.current.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left + scrollOffset;
        const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
        onSeek(time);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    },
    [onSeek, duration, pixelsPerSecond, scrollOffset]
  );

  return (
    <div
      ref={playheadRef}
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: `${position}px`,
        zIndex: 100,
      }}
    >
      {/* Playhead line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          width: `${exactMeasurements.timeline.playheadWidth}px`,
          background: exactMeasurements.timeline.playheadColor,
          boxShadow: `0 2px 4px ${exactMeasurements.timeline.playheadColor}80`,
        }}
      />

      {/* Draggable handle at top */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-auto cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: exactMeasurements.timeline.playheadColor,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(255, 68, 68, 0.5)',
        }}
        onMouseDown={handleMouseDown}
        title={formatTime(currentTime)}
      >
        {/* Inner dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'white',
          }}
        />
      </div>

      {/* Time tooltip */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap px-2 py-1 rounded text-xs font-mono"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          fontSize: '11px',
        }}
      >
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default TimelinePlayhead;

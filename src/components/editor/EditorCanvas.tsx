import React from 'react';
import { Trash2, Scissors, Copy, SkipBack, Play, Pause, SkipForward, Minus, Plus, Maximize2 } from 'lucide-react';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';
import { Slider } from '@/components/ui/slider';
import { useThrottle } from '@/hooks/editor/useRenderOptimization';

interface EditorCanvasProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onDelete?: () => void;
  onSplit?: () => void;
  onClone?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onDelete,
  onSplit,
  onClone,
  zoom = 1,
  onZoomChange,
}) => {
  const throttledZoomChange = useThrottle(onZoomChange || (() => {}), 100);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }> = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 transition-colors rounded"
      style={{
        height: `${exactMeasurements.canvas.buttonHeight}px`,
        border: `1px solid ${editorTheme.border.default}`,
        background: 'transparent',
        color: editorTheme.text.primary,
        fontSize: typography.fontSize.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = editorTheme.bg.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: editorTheme.bg.primary }}
    >
      {/* Canvas Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '884px',
            aspectRatio: '16 / 9',
            background: editorTheme.bg.secondary,
            border: `1px solid ${editorTheme.border.subtle}`,
            borderRadius: '8px',
          }}
        >
          {/* Video Preview Placeholder */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: '#D3D3D3',
              color: '#666',
              fontSize: typography.fontSize.md,
            }}
          >
            <span>Video Preview</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className="flex items-center justify-between"
        style={{
          height: `${exactMeasurements.canvas.controlBarHeight}px`,
          background: editorTheme.bg.tertiary,
          borderTop: `1px solid ${editorTheme.border.subtle}`,
          padding: exactMeasurements.canvas.controlBarPadding,
        }}
      >
        {/* Left Actions */}
        <div
          className="flex items-center"
          style={{
            gap: `${exactMeasurements.canvas.buttonGap}px`,
          }}
        >
          <ActionButton
            icon={<Trash2 size={16} />}
            label="Delete"
            onClick={onDelete}
          />
          <ActionButton
            icon={<Scissors size={16} />}
            label="Split"
            onClick={onSplit}
          />
          <ActionButton
            icon={<Copy size={16} />}
            label="Clone"
            onClick={onClone}
          />
        </div>

        {/* Center Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Previous Frame */}
          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onClick={() => onSeek(Math.max(0, currentTime - 1))}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SkipBack size={20} />
          </button>

          {/* Play/Pause Button */}
          <button
            className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: `${exactMeasurements.canvas.playButtonSize}px`,
              height: `${exactMeasurements.canvas.playButtonSize}px`,
              background: editorTheme.accent.primary,
              color: '#000000',
            }}
            onClick={isPlaying ? onPause : onPlay}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" />}
          </button>

          {/* Next Frame */}
          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onClick={() => onSeek(Math.min(duration, currentTime + 1))}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SkipForward size={20} />
          </button>

          {/* Time Display */}
          <div
            className="ml-3"
            style={{
              fontFamily: typography.fontFamily.mono,
              fontSize: exactMeasurements.canvas.timeDisplayFont,
              color: editorTheme.text.secondary,
            }}
          >
            {formatTime(currentTime)} | {formatTime(duration)}
          </div>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onClick={() => onZoomChange?.(Math.max(0.25, zoom - 0.25))}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Minus size={16} />
          </button>

          {/* Zoom Slider */}
          <div style={{ width: '96px' }}>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => onZoomChange?.(value)}
              min={0.25}
              max={2}
              step={0.25}
              className="cursor-pointer"
            />
          </div>

          {/* Zoom In */}
          <button
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onClick={() => onZoomChange?.(Math.min(2, zoom + 0.25))}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Plus size={16} />
          </button>

          {/* Fit to Screen */}
          <button
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onClick={() => onZoomChange?.(1)}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

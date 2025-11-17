import React from 'react';
import { Trash2, Scissors, Copy, SkipBack, Play, Pause, SkipForward, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { editorTheme, typography } from '@/lib/editor/theme';

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
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ background: editorTheme.bg.primary }}
    >
      {/* Canvas Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '884px',
            aspectRatio: '16 / 9',
            background: editorTheme.bg.secondary,
            border: `1px solid ${editorTheme.border.subtle}`,
          }}
        >
          {/* Video Preview Placeholder */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#D3D3D3' }}
          >
            <span style={{ color: '#666', fontSize: typography.fontSize.md }}>
              Video Preview
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className="flex items-center justify-between px-4 border-t"
        style={{
          height: '56px',
          background: editorTheme.bg.tertiary,
          borderColor: editorTheme.border.subtle,
        }}
      >
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-2"
            style={{
              height: '32px',
              color: editorTheme.text.primary,
              fontSize: typography.fontSize.sm,
            }}
          >
            <Trash2 size={16} />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSplit}
            className="gap-2"
            style={{
              height: '32px',
              color: editorTheme.text.primary,
              fontSize: typography.fontSize.sm,
            }}
          >
            <Scissors size={16} />
            Split
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClone}
            className="gap-2"
            style={{
              height: '32px',
              color: editorTheme.text.primary,
              fontSize: typography.fontSize.sm,
            }}
          >
            <Copy size={16} />
            Clone
          </Button>
        </div>

        {/* Center Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              width: '40px',
              height: '40px',
              background: editorTheme.accent.primary,
              color: '#000000',
            }}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" />}
          </button>

          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SkipForward size={20} />
          </button>

          <span
            className="ml-2"
            style={{
              color: editorTheme.text.secondary,
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontFamily.mono,
            }}
          >
            {formatTime(currentTime)} | {formatTime(duration)}
          </span>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ZoomOut size={18} />
          </button>

          <div className="w-24 h-1 rounded-full" style={{ background: editorTheme.bg.active }}>
            <div
              className="h-full rounded-full"
              style={{ width: '60%', background: editorTheme.accent.primary }}
            />
          </div>

          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ZoomIn size={18} />
          </button>

          <button
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: '32px',
              height: '32px',
              color: editorTheme.text.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

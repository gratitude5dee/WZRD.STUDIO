import React from 'react';
import { RefreshCw, Undo, Redo, Users, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { editorTheme, layoutDimensions, typography } from '@/lib/editor/theme';

interface EditorHeaderProps {
  projectTitle: string;
  onTitleChange: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onExport: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  projectTitle,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onShare,
  onExport,
}) => {
  return (
    <header
      className="flex items-center justify-between px-5 border-b"
      style={{
        height: `${layoutDimensions.header.height}px`,
        background: editorTheme.bg.secondary,
        borderColor: editorTheme.border.subtle,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Logo/Refresh Icon */}
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
          <RefreshCw size={20} />
        </button>

        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
          style={{
            width: '32px',
            height: '32px',
            color: editorTheme.text.primary,
          }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = editorTheme.bg.hover)}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Undo size={18} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
          style={{
            width: '32px',
            height: '32px',
            color: editorTheme.text.primary,
          }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = editorTheme.bg.hover)}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Center - Project Title */}
      <div className="flex-1 max-w-md mx-auto">
        <Input
          value={projectTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            color: editorTheme.text.primary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.regular,
          }}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Join Us Button */}
        <Button
          variant="ghost"
          className="gap-2"
          style={{
            height: '36px',
            color: editorTheme.text.primary,
            fontSize: typography.fontSize.sm,
          }}
        >
          <Users size={16} />
          Join Us
        </Button>

        {/* Share Button */}
        <Button
          onClick={onShare}
          variant="outline"
          className="gap-2"
          style={{
            height: '36px',
            borderColor: editorTheme.border.default,
            color: editorTheme.text.primary,
            fontSize: typography.fontSize.sm,
          }}
        >
          <Share2 size={16} />
          Share
        </Button>

        {/* Export Button */}
        <Button
          onClick={onExport}
          className="gap-2 font-semibold"
          style={{
            height: '36px',
            background: editorTheme.accent.primary,
            color: '#000000',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          <Download size={16} />
          Export
        </Button>
      </div>
    </header>
  );
};

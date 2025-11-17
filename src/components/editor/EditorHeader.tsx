import React, { useState } from 'react';
import { RefreshCw, Undo, Redo, Users, Share2, Download } from 'lucide-react';
import { editorTheme, layoutDimensions, typography, exactMeasurements } from '@/lib/editor/theme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="flex items-center justify-between border-b"
        style={{
          height: `${exactMeasurements.header.height}px`,
          paddingLeft: `${exactMeasurements.header.paddingX}px`,
          paddingRight: `${exactMeasurements.header.paddingX}px`,
          background: editorTheme.bg.secondary,
          borderColor: editorTheme.border.subtle,
        }}
      >
        {/* Left Section */}
        <div
          className="flex items-center"
          style={{
            gap: `${exactMeasurements.header.buttonGap}px`,
          }}
        >
          {/* Logo/Refresh Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: `${exactMeasurements.header.logoSize}px`,
                  height: `${exactMeasurements.header.logoSize}px`,
                  color: editorTheme.text.primary,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = editorTheme.bg.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <RefreshCw size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>

          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: `${exactMeasurements.header.logoSize}px`,
                  height: `${exactMeasurements.header.logoSize}px`,
                  color: editorTheme.text.primary,
                  opacity: canUndo ? 1 : 0.3,
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) =>
                  canUndo && (e.currentTarget.style.background = editorTheme.bg.hover)
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Undo size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <kbd className="ml-1 text-xs opacity-60">⌘Z</kbd>
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: `${exactMeasurements.header.logoSize}px`,
                  height: `${exactMeasurements.header.logoSize}px`,
                  color: editorTheme.text.primary,
                  opacity: canRedo ? 1 : 0.3,
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) =>
                  canRedo && (e.currentTarget.style.background = editorTheme.bg.hover)
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Redo size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <kbd className="ml-1 text-xs opacity-60">⌘⇧Z</kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center - Project Title */}
        <div className="flex-1 max-w-md mx-auto">
          {isEditingTitle ? (
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="w-full text-center bg-transparent border-b focus:outline-none transition-colors"
              style={{
                color: editorTheme.text.primary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.regular,
                borderColor: editorTheme.border.focus,
              }}
            />
          ) : (
            <div
              className="w-full text-center cursor-text px-2 py-1 rounded transition-colors"
              onClick={() => setIsEditingTitle(true)}
              onMouseEnter={(e) => (e.currentTarget.style.background = editorTheme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              style={{
                color: editorTheme.text.primary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.regular,
              }}
            >
              {projectTitle || 'Untitled Project'}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div
          className="flex items-center"
          style={{
            gap: `${exactMeasurements.header.buttonGap}px`,
          }}
        >
          {/* Join Us Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-md transition-colors"
                style={{
                  height: `${exactMeasurements.header.buttonHeight}px`,
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  color: editorTheme.text.primary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.regular,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = editorTheme.bg.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Users size={16} />
                <span>Join Us</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Invite collaborators</TooltipContent>
          </Tooltip>

          {/* Share Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onShare}
                className="flex items-center gap-2 rounded-md border transition-colors"
                style={{
                  height: `${exactMeasurements.header.buttonHeight}px`,
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  borderColor: editorTheme.border.default,
                  color: editorTheme.text.primary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.regular,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = editorTheme.bg.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Share project</TooltipContent>
          </Tooltip>

          {/* Export Button - PRIMARY PURPLE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onExport}
                className="flex items-center gap-2 rounded-md transition-all bg-gradient-to-b from-[#8b5cf6] to-[#7c3aed] hover:from-[#9d71f7] hover:to-[#8b5cf6] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]"
                style={{
                  height: `${exactMeasurements.header.buttonHeight}px`,
                  padding: exactMeasurements.header.exportButtonPadding,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Export video <kbd className="ml-1 text-xs opacity-60">⌘E</kbd>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};

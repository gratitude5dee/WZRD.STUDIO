import { ChevronDown, Download, Link2, GitCompare, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface GalleryToolbarProps {
  aspectRatio: string;
  model: string;
  onAspectRatioChange?: (ratio: string) => void;
  onModelChange?: (model: string) => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
  onCompare?: () => void;
}

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const MODELS = ['Flux Dev', 'Flux Pro', 'DALL-E 3', 'Midjourney'];

export const GalleryToolbar = ({
  aspectRatio,
  model,
  onAspectRatioChange,
  onModelChange,
  onDownload,
  onCopyLink,
  onCompare,
}: GalleryToolbarProps) => {
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  return (
    <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
      {/* Left: Aspect Ratio & Model Selectors */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio */}
        <div className="relative">
          <button
            onClick={() => setShowRatioMenu(!showRatioMenu)}
            className="px-3 py-1.5 rounded-lg bg-[#1C1C1F] border border-[#3F3F46] hover:border-[#6366F1] text-sm text-[#FAFAFA] flex items-center gap-2 transition-colors"
          >
            {aspectRatio}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showRatioMenu && (
            <div className="absolute top-full left-0 mt-1 py-1 bg-[#1C1C1F] border border-[#3F3F46] rounded-lg shadow-lg z-10 min-w-[100px]">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    onAspectRatioChange?.(ratio);
                    setShowRatioMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
                >
                  {ratio}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="px-3 py-1.5 rounded-lg bg-[#1C1C1F] border border-[#3F3F46] hover:border-[#6366F1] text-sm text-[#FAFAFA] flex items-center gap-2 transition-colors"
          >
            {model}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showModelMenu && (
            <div className="absolute top-full left-0 mt-1 py-1 bg-[#1C1C1F] border border-[#3F3F46] rounded-lg shadow-lg z-10 min-w-[140px]">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onModelChange?.(m);
                    setShowModelMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          className="w-8 h-8 rounded-lg hover:bg-[#27272A] flex items-center justify-center transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-[#A1A1AA]" />
        </button>
        <button
          onClick={onCopyLink}
          className="w-8 h-8 rounded-lg hover:bg-[#27272A] flex items-center justify-center transition-colors"
          title="Copy link"
        >
          <Link2 className="w-4 h-4 text-[#A1A1AA]" />
        </button>
        <button
          onClick={onCompare}
          className="w-8 h-8 rounded-lg hover:bg-[#27272A] flex items-center justify-center transition-colors"
          title="Compare"
        >
          <GitCompare className="w-4 h-4 text-[#A1A1AA]" />
        </button>
        <button
          className="w-8 h-8 rounded-lg hover:bg-[#27272A] flex items-center justify-center transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4 text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
};

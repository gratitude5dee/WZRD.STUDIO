import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Maximize2, Copy, MoreHorizontal } from 'lucide-react';

interface GalleryCardProps {
  id: string;
  imageUrl: string;
  title: string;
  model: string;
  onDownload?: () => void;
  onMaximize?: () => void;
  onCopy?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

export const GalleryCard = ({
  id,
  imageUrl,
  title,
  model,
  onDownload,
  onMaximize,
  onCopy,
  selected,
  onClick,
}: GalleryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${
          selected
            ? 'border-[#6366F1] shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            : isHovered
            ? 'border-[#3F3F46]'
            : 'border-[#27272A]'
        }
      `}
    >
      {/* Image */}
      <div className="aspect-square bg-[#0A0A0B]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay with actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.();
              }}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
              }}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.();
              }}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info footer */}
      <div className="p-3 bg-[#141416] border-t border-[#27272A]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#FAFAFA] font-medium truncate flex-1">
            {title}
          </p>
          <span className="text-xs text-[#71717A] ml-2">{model}</span>
        </div>
      </div>
    </motion.div>
  );
};

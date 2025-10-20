import { Save, Share2, History, ZoomIn, ChevronDown } from 'lucide-react';
import { CircularIconButton } from './CircularIconButton';
import { motion } from 'framer-motion';

interface TopToolbarProps {
  onSave?: () => void;
  onShare?: () => void;
  onHistory?: () => void;
  onZoomFit?: () => void;
  isSaving?: boolean;
}

export const TopToolbar = ({
  onSave,
  onShare,
  onHistory,
  onZoomFit,
  isSaving,
}: TopToolbarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 z-10 flex items-center gap-2"
    >
      <CircularIconButton
        icon={ZoomIn}
        onClick={onZoomFit}
        tooltip="Zoom to fit (⌘0)"
        size="md"
      />
      <CircularIconButton
        icon={Save}
        onClick={onSave}
        tooltip="Save project (⌘S)"
        size="md"
        active={isSaving}
      />
      <CircularIconButton
        icon={Share2}
        onClick={onShare}
        tooltip="Share workflow"
        size="md"
      />
      <CircularIconButton
        icon={History}
        onClick={onHistory}
        tooltip="Version history"
        size="md"
      />
    </motion.div>
  );
};

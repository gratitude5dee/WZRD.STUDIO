import { motion } from 'framer-motion';
import { Workflow } from 'lucide-react';

interface WorkflowLabelChipProps {
  label: string;
}

export const WorkflowLabelChip = ({ label }: WorkflowLabelChipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-[#1C1C1F] border border-[#3F3F46] flex items-center gap-2 shadow-lg"
    >
      <Workflow className="w-3.5 h-3.5 text-[#6366F1]" />
      <span className="text-sm font-medium text-[#FAFAFA]">{label}</span>
    </motion.div>
  );
};

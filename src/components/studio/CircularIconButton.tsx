import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CircularIconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CircularIconButton = ({
  icon: Icon,
  onClick,
  active,
  tooltip,
  className,
  size = 'md',
}: CircularIconButtonProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={tooltip}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200',
        'border border-[#3F3F46] hover:border-[#6366F1]',
        active
          ? 'bg-[#6366F1] text-white'
          : 'bg-[#1C1C1F] text-[#A1A1AA] hover:text-[#FAFAFA]',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </motion.button>
  );
};

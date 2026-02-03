import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  className?: string;
}

export const MagneticButton = ({ 
  children, 
  variant = 'primary',
  onClick,
  className
}: MagneticButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    
    setPosition({ x: deltaX, y: deltaY });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onClick={onClick}
      className={cn(
        "relative group px-8 py-4 font-display font-bold text-lg rounded-lg overflow-hidden",
        variant === 'primary' && "bg-gradient-to-r from-cyan-500 to-magenta-500 text-black",
        variant === 'ghost' && "border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Glow on hover */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-magenta-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </motion.button>
  );
};

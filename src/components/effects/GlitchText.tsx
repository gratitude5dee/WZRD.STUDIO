import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText = ({ text, className }: GlitchTextProps) => {
  const [glitching, setGlitching] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn("relative inline-block", className)}>
      {/* Main text */}
      <span className="relative z-10 text-white">{text}</span>
      
      {/* Glitch layers */}
      {glitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-cyan-400 opacity-70"
            style={{ clipPath: 'inset(0 0 50% 0)', transform: 'translateX(-2px)' }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 text-magenta-400 opacity-70"
            style={{ clipPath: 'inset(50% 0 0 0)', transform: 'translateX(2px)' }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
};

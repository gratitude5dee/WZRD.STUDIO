
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, FileCode, Users, Music, Mic, Play, Share, Undo, Redo } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import CreditsDisplay from '@/components/CreditsDisplay';
import { Logo } from '@/components/ui/logo';

interface StoryboardHeaderProps {
  viewMode: 'studio' | 'timeline' | 'editor';
  setViewMode: (mode: 'studio' | 'timeline' | 'editor') => void;
}

const StoryboardHeader = ({ viewMode, setViewMode }: StoryboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "w-full sticky top-0 z-50",
      "bg-gradient-to-b from-[rgba(12,12,18,0.98)] to-[rgba(8,8,14,0.95)]",
      "backdrop-blur-2xl border-b border-white/[0.05]",
      "shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]",
      "px-6 py-3"
    )}>
      {/* Top shine line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      <div className="flex items-center justify-between mb-3">
        <Logo size="sm" showVersion={false} />
      </div>
      
      {/* Bottom row with action buttons */}
      <div className="flex items-center justify-between">
        {/* Left section with navigation buttons */}
        <div className="flex items-center space-x-2">
          {[
            { icon: Settings, label: 'Settings' },
            { icon: FileCode, label: 'Style' },
            { icon: Users, label: 'Cast' },
            { icon: Music, label: 'Soundtrack' },
            { icon: Mic, label: 'Voiceover' }
          ].map((item) => (
            <motion.div 
              key={item.label}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "text-sm px-3 py-2 rounded-xl",
                  "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                  "backdrop-blur-md border border-white/[0.08]",
                  "hover:bg-white/[0.1] hover:border-white/[0.12]",
                  "shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]",
                  "transition-all duration-200",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5 mr-1.5" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>
        
        {/* Right section with action buttons */}
        <div className="flex items-center gap-2">
          <CreditsDisplay showTooltip={true} />
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "w-9 h-9 rounded-xl",
                "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                "backdrop-blur-md border border-white/[0.08]",
                "hover:bg-white/[0.1] hover:border-white/[0.12]",
                "shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]",
                "transition-all duration-200",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Undo className="w-4 h-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "w-9 h-9 rounded-xl",
                "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                "backdrop-blur-md border border-white/[0.08]",
                "hover:bg-white/[0.1] hover:border-white/[0.12]",
                "shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]",
                "transition-all duration-200",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </motion.div>
          
          {/* Preview Button - Premium Glass with Glow */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              variant="default" 
              className={cn(
                "relative overflow-hidden rounded-xl",
                "bg-gradient-to-br from-primary/90 to-primary/70",
                "border border-primary/40",
                "shadow-[0_0_30px_rgba(20,184,166,0.35),0_4px_20px_rgba(20,184,166,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]",
                "hover:shadow-[0_0_40px_rgba(20,184,166,0.5),0_6px_28px_rgba(20,184,166,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]",
                "transition-all duration-300"
              )}
            >
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.05] to-white/[0.12]" />
              
              <Play className="w-4 h-4 fill-current mr-2 relative z-10" />
              <span className="relative z-10 font-semibold">Preview</span>
              
              {/* Animated shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              />
            </Button>
          </motion.div>
          
          {/* Share Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              className={cn(
                "px-4 py-2 rounded-xl",
                "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                "backdrop-blur-md border border-white/[0.08]",
                "hover:bg-white/[0.1] hover:border-white/[0.12]",
                "shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]",
                "transition-all duration-200",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Share className="w-4 h-4 mr-1.5" />
              <span>Share</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default StoryboardHeader;

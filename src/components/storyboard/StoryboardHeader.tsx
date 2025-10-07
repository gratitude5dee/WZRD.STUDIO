
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

  const headerButtonBase = "text-sm transition-all-fast rounded-md px-3 py-1.5 flex items-center gap-1.5";
  const ghostBtnClass = cn(headerButtonBase, "text-zinc-300 hover:text-white hover:bg-white/5");
  const iconBtnClass = cn(headerButtonBase, "text-zinc-400 hover:text-white bg-transparent hover:bg-white/10 border border-white/10 hover:border-white/20 h-8 w-8 p-0 justify-center");
  const actionBtnClass = cn(headerButtonBase, "bg-white/5 hover:bg-white/10 text-white shadow-sm border border-white/10");

  return (
    <header className={cn(
      "w-full sticky top-0 z-50",
      "bg-gradient-to-b from-zinc-950/98 to-zinc-900/95",
      "backdrop-blur-xl border-b border-zinc-800/50",
      "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]",
      "px-6 py-3"
    )}>
      <div className="flex items-center justify-between mb-2">
        <Logo size="sm" showVersion={false} />
      </div>
      
      {/* Bottom row with other buttons */}
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
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "text-sm px-3 py-1.5 rounded-lg",
                  "bg-zinc-900/30 backdrop-blur-sm",
                  "border border-zinc-800/30",
                  "hover:bg-zinc-800/50 hover:border-zinc-700/50",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]",
                  "transition-all duration-200",
                  "text-zinc-300 hover:text-white"
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
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "w-9 h-9 rounded-lg",
                "bg-zinc-900/30 backdrop-blur-sm",
                "border border-zinc-800/30",
                "hover:bg-zinc-800/50 hover:border-zinc-700/50",
                "shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]",
                "transition-all duration-200",
                "text-zinc-400 hover:text-white"
              )}
            >
              <Undo className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "w-9 h-9 rounded-lg",
                "bg-zinc-900/30 backdrop-blur-sm",
                "border border-zinc-800/30",
                "hover:bg-zinc-800/50 hover:border-zinc-700/50",
                "shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]",
                "transition-all duration-200",
                "text-zinc-400 hover:text-white"
              )}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </motion.div>
          
          {/* Preview Button - Premium Primary */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="default" 
              className={cn(
                "relative overflow-hidden",
                "bg-gradient-to-br from-blue-600 to-purple-600",
                "border border-blue-500/30",
                "shadow-[0_0_24px_rgba(139,92,246,0.4),0_4px_20px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
                "hover:shadow-[0_0_32px_rgba(139,92,246,0.5),0_6px_28px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
                "transition-all duration-300"
              )}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10" />
              
              <Play className="w-4 h-4 fill-current mr-2 relative z-10" />
              <span className="relative z-10 font-medium">Preview</span>
              
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            </Button>
          </motion.div>
          
          {/* Share Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="ghost" 
              className={cn(
                "px-3 py-2 rounded-lg",
                "bg-zinc-900/30 backdrop-blur-sm",
                "border border-zinc-800/30",
                "hover:bg-zinc-800/50 hover:border-zinc-700/50",
                "shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]",
                "transition-all duration-200",
                "text-zinc-300 hover:text-white"
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

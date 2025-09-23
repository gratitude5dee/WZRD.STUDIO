
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
    <header className="w-full bg-gradient-to-b from-[#101420]/95 to-[#0A0D16]/80 backdrop-blur-lg border-b border-white/10 px-6 py-2 shadow-md sticky top-0 z-10">
      <div className="flex items-center justify-between mb-2">
        <Logo size="sm" showVersion={false} />
      </div>
      
      {/* Bottom row with other buttons */}
      <div className="flex items-center justify-between">
        {/* Left section with navigation buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className={ghostBtnClass}>
            <Settings className="h-4 w-4 mr-1.5" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className={ghostBtnClass}>
            <FileCode className="h-4 w-4 mr-1.5" />
            Style
          </Button>
          <Button variant="ghost" size="sm" className={ghostBtnClass}>
            <Users className="h-4 w-4 mr-1.5" />
            Cast
          </Button>
          <Button variant="ghost" size="sm" className={ghostBtnClass}>
            <Music className="h-4 w-4 mr-1.5" />
            Soundtrack
          </Button>
          <Button variant="ghost" size="sm" className={ghostBtnClass}>
            <Mic className="h-4 w-4 mr-1.5" />
            Voiceover
          </Button>
        </div>
        
        {/* Right section with action buttons */}
        <div className="flex items-center gap-2">
          <CreditsDisplay showTooltip={true} />
          <Button 
            variant="ghost" 
            className={iconBtnClass}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            className={iconBtnClass}
          >
            <Redo className="w-4 h-4" />
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="default" 
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-glow-purple-sm transition-all-std"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Preview</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              className={actionBtnClass}
            >
              <Share className="w-4 h-4 mr-1" />
              <span>Share</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default StoryboardHeader;

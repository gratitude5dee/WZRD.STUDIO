import { Logo } from '@/components/ui/logo';
import CreditsDisplay from '@/components/CreditsDisplay';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = ({ viewMode, setViewMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStudioClick = () => {
    setViewMode('studio');
    
    // If we're not already on the studio route, navigate to it
    if (!location.pathname.includes('/studio')) {
      navigate('/studio');
    }
  };

  const handleTimelineClick = () => {
    setViewMode('timeline');
  };

  const handleEditorClick = () => {
    setViewMode('editor');
  };

  return (
    <header className="bg-[#0F1117] border-b border-[#1D2130] h-16 flex items-center px-6 justify-between">
      <div className="flex items-center">
        <div className="text-white font-bold text-xl mr-8">WZRD</div>
        
        <div className="flex space-x-1">
          <Button
            variant={viewMode === 'studio' ? 'default' : 'ghost'}
            className={viewMode === 'studio' ? 'bg-purple-700 hover:bg-purple-800' : 'text-zinc-400'}
            onClick={handleStudioClick}
          >
            Studio
          </Button>
          
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            className={viewMode === 'timeline' ? 'bg-purple-700 hover:bg-purple-800' : 'text-zinc-400'}
            onClick={handleTimelineClick}
          >
            Timeline
          </Button>
          
          <Button
            variant={viewMode === 'editor' ? 'default' : 'ghost'}
            className={viewMode === 'editor' ? 'bg-purple-700 hover:bg-purple-800' : 'text-zinc-400'}
            onClick={handleEditorClick}
          >
            Editor
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <CreditsDisplay showTooltip={true} />
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          G
        </div>
      </div>
    </header>
  );
};

export default Header;

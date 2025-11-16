import { Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { disableDemoMode } from '@/utils/demoMode';

export const DemoBanner = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    disableDemoMode();
    navigate('/login?mode=signup');
  };

  const handleExit = () => {
    disableDemoMode();
    window.location.href = '/';
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <span className="text-white font-medium text-sm md:text-base">
            Demo Mode Active - Experience WZRD.Studio capabilities
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSignUp}
            className="bg-white text-purple-600 hover:bg-white/90 shadow-md hover:shadow-lg transition-all"
          >
            Sign Up for Full Access
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <button
            onClick={handleExit}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            aria-label="Exit demo mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

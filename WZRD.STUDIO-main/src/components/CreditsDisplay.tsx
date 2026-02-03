
import { useCredits } from '@/hooks/useCredits';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface CreditsDisplayProps {
  showTooltip?: boolean;
  showButton?: boolean;
}

const CreditsDisplay = ({ showTooltip = true, showButton = false }: CreditsDisplayProps) => {
  const { availableCredits, isLoading } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleGetMoreCredits = () => {
    navigate('/credits');
  };

  const content = (
    <div className="flex items-center gap-1 text-white">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium">
        {isLoading ? '...' : availableCredits} credits
      </span>
    </div>
  );

  if (showTooltip) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>Credits for AI generations</p>
          </TooltipContent>
        </Tooltip>
        {showButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-7 text-xs text-white/80 hover:text-white hover:bg-zinc-800"
            onClick={handleGetMoreCredits}
          >
            Get more
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {content}
      {showButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 h-7 text-xs text-white/80 hover:text-white hover:bg-zinc-800"
          onClick={handleGetMoreCredits}
        >
          Get more
        </Button>
      )}
    </div>
  );
};

export default CreditsDisplay;

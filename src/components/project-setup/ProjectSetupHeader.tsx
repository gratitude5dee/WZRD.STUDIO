import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface ProjectSetupHeaderProps {
  currentStep?: number;
  totalSteps?: number;
}

const ProjectSetupHeader = ({ currentStep = 1, totalSteps = 4 }: ProjectSetupHeaderProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  return (
    <header className={cn(
      "w-full border-b px-6 py-4 shadow-lg",
      "bg-gradient-to-r from-card/95 via-card/80 to-card/95",
      "backdrop-blur-xl border-border/30"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleBack}>
          <Logo size="sm" showVersion={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">Set up your project</span>
              <span className="text-lg">✨</span>
            </div>
            <span className="text-xs text-muted-foreground">Visualize your concept</span>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Step</span>
            <span className="text-sm font-semibold text-primary">{currentStep}</span>
            <span className="text-sm text-muted-foreground">of {totalSteps}</span>
          </div>
          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" className="bg-transparent hover:bg-primary/10 text-primary">
            Upgrade
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            G
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProjectSetupHeader;

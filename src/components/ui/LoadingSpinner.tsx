import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className={cn(
          sizeClasses[size],
          "border-purple-500/30 border-t-purple-500 rounded-full animate-spin"
        )} 
      />
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({ message, className }: LoadingOverlayProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-white text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

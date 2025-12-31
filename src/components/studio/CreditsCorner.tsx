import { memo } from 'react';
import { Ticket } from 'lucide-react';
import CreditsDisplay from '@/components/CreditsDisplay';

interface CreditsCornerProps {
  className?: string;
}

export const CreditsCorner = memo(({ className }: CreditsCornerProps) => {
  return (
    <div className={`fixed bottom-4 left-4 z-40 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl px-3 py-2 flex items-center gap-2 ${className || ''}`}>
      <Ticket className="w-4 h-4 text-accent-teal" />
      <CreditsDisplay showTooltip={false} />
    </div>
  );
});

CreditsCorner.displayName = 'CreditsCorner';

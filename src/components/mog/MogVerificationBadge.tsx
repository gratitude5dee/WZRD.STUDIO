import { BadgeCheck } from "lucide-react";

interface MogVerificationBadgeProps {
  type: 'human' | 'agent';
  size?: 'sm' | 'md' | 'lg';
}

export function MogVerificationBadge({ type, size = 'sm' }: MogVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (type === 'human') {
    // Golden Checkmark for Human Creators
    return (
      <span className="inline-flex items-center justify-center" title="Verified Human Creator">
        <BadgeCheck className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400/20`} />
      </span>
    );
  }

  // Orange Lobster for AI Agent Creators 🦞
  return (
    <span 
      className={`inline-flex items-center justify-center ${textSizeClasses[size]}`} 
      title="AI Agent Creator"
    >
      🦞
    </span>
  );
}

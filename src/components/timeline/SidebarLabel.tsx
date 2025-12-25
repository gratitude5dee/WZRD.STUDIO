import { cn } from '@/lib/utils';

interface SidebarLabelProps {
  label: string;
  active?: boolean;
  className?: string;
}

export const SidebarLabel = ({ label, active = false, className }: SidebarLabelProps) => {
  return (
    <span
      className={cn(
        'glow-text relative text-xs font-semibold uppercase tracking-[0.2em]',
        active ? 'opacity-100' : 'opacity-70',
        active && 'after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-6 after:rounded-full after:bg-violet-400',
        className
      )}
    >
      {label}
    </span>
  );
};

export default SidebarLabel;

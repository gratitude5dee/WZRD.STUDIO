import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PropertySectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PropertySection({ title, children, defaultOpen = true }: PropertySectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-[#2a2a2a]">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 hover:bg-white/5 transition-colors">
        <span className="text-sm font-medium text-white">{title}</span>
        <ChevronDown className="w-4 h-4 text-white/50 transition-transform duration-200 data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

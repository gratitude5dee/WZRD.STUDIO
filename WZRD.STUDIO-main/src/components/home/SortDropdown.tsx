import { ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'updated' | 'created' | 'name';

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const options = [
    { value: 'updated' as SortOption, label: 'Last edited' },
    { value: 'created' as SortOption, label: 'Created date' },
    { value: 'name' as SortOption, label: 'Name (A-Z)' },
  ];

  const currentLabel = options.find(opt => opt.value === value)?.label || 'Last edited';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/60 hover:text-white hover:border-white/[0.16] transition-colors">
        <ArrowUpDown className="w-4 h-4" />
        <span>{currentLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1A1A1A] border-white/[0.08]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`text-sm cursor-pointer ${
              value === option.value ? 'text-white' : 'text-white/60'
            } hover:text-white hover:bg-white/[0.04]`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm text-white/70 min-w-[100px]">{label}</label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-10 h-10 rounded border border-border hover:border-border/80 transition-colors flex-shrink-0"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#1a1a1a] border-[#2a2a2a]">
          <div className="space-y-3">
            <input
              type="color"
              value={value}
              onChange={handleColorChange}
              className="w-full h-32 cursor-pointer"
            />
          </div>
        </PopoverContent>
      </Popover>

      <Input
        value={value}
        onChange={handleHexChange}
        placeholder="#FFFFFF"
        className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white h-10"
      />
    </div>
  );
}

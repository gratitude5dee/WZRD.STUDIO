
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export const IconButton = ({ icon, label, onClick }: IconButtonProps) => {
  return (
    <button 
      className="flex items-center gap-2 text-zinc-300 hover:text-white text-xs p-1 hover:bg-zinc-800/50 rounded-sm transition-colors w-full text-left"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

interface ModelListItemProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  credits: number;
  time: string;
  isSelected?: boolean;
  onClick: () => void;
}

export const ModelListItem = ({ 
  icon, 
  name, 
  description, 
  credits, 
  time, 
  isSelected, 
  onClick 
}: ModelListItemProps) => {
  return (
    <button 
      className={cn(
        "w-full flex items-center justify-between p-2 hover:bg-zinc-800 rounded-md group transition-colors",
        isSelected && "bg-zinc-800"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-left">
          <div className="text-white text-sm">{name}</div>
          {description && <div className="text-zinc-400 text-xs">{description}</div>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-zinc-700 rounded-full text-[8px] flex items-center justify-center">
            ✦
          </div>
          <span className="text-zinc-400 text-xs">{credits}</span>
        </div>
        <div className="text-zinc-400 text-xs">{time}</div>
        {isSelected && <Check className="h-4 w-4 text-blue-500" />}
      </div>
    </button>
  );
};

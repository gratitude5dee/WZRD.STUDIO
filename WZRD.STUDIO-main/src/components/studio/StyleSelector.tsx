
import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Style {
  id: string;
  name: string;
  description?: string;
  icon?: string | React.ReactNode;
}

interface StyleSelectorProps {
  styles: Style[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  styles, 
  selectedStyleId, 
  onStyleSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredStyles = styles.filter(style => 
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-h-96 bg-black/90 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-2 sticky top-0 bg-black/90 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors text-sm"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        <div className="p-1">
          <button
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
              selectedStyleId === null ? "bg-zinc-800" : "hover:bg-zinc-800/60"
            )}
            onClick={() => onStyleSelect('')}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
              <span className="text-white text-xs">N</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-white">None</span>
            </div>
            {selectedStyleId === null && (
              <Check className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          
          {filteredStyles.map((style) => (
            <button
              key={style.id}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                selectedStyleId === style.id ? "bg-zinc-800" : "hover:bg-zinc-800/60"
              )}
              onClick={() => onStyleSelect(style.id)}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden flex items-center justify-center">
                {typeof style.icon === 'string' ? (
                  <img src={style.icon} alt={style.name} className="w-full h-full object-cover" />
                ) : style.icon ? (
                  style.icon
                ) : (
                  <span className="text-white text-xs">{style.name[0]}</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <span className="text-white">{style.name}</span>
              </div>
              {selectedStyleId === style.id && (
                <Check className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 border-t border-zinc-800 flex justify-between">
        <button className="text-zinc-400 hover:text-zinc-300 text-sm">
          See all Styles
        </button>
        <button className="text-zinc-400 hover:text-zinc-300 text-sm flex items-center">
          <span className="mr-1">+</span>
          New style
        </button>
      </div>
    </div>
  );
};

export default StyleSelector;

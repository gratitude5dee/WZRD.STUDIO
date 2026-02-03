
import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface HistoryItem {
  id: string;
  date: string;
  prompt: string;
  result: string;
  type: 'text' | 'image' | 'video';
  thumbnail?: string;
}

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  blockType: 'text' | 'image' | 'video';
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onSelectItem, blockType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = items.filter(item => 
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.type === 'text' && item.result.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full h-full bg-black/80 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-2 sticky top-0 bg-black border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search History..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors text-sm"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto p-2" style={{ maxHeight: "calc(100% - 56px)" }}>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="text-zinc-500 mb-2">No generation history found</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-start gap-3 p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors text-left"
                onClick={() => onSelectItem(item)}
              >
                {item.type !== 'text' && item.thumbnail && (
                  <div className="w-12 h-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-500 mb-1">{item.date}</div>
                  <div className="text-xs text-zinc-300 truncate mb-1">
                    <span className="text-zinc-400 italic">Prompt:</span> {item.prompt}
                  </div>
                  {item.type === 'text' && (
                    <div className="text-xs text-zinc-400 line-clamp-2">{item.result}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;

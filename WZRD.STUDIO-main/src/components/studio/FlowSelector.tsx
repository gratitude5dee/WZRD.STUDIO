
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Flow {
  id: string;
  name: string;
  blocks: number;
  description?: string;
  icon?: React.ReactNode;
}

interface FlowSelectorProps {
  flows: Flow[];
  onFlowSelect: (flowId: string) => void;
}

const FlowSelector: React.FC<FlowSelectorProps> = ({ flows, onFlowSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-h-96 bg-black/90 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-2 sticky top-0 bg-black/90 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors text-sm"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        {filteredFlows.length === 0 ? (
          <div className="p-6 text-center text-zinc-500">
            No flows found
          </div>
        ) : (
          <div className="p-1">
            {filteredFlows.map((flow) => (
              <button
                key={flow.id}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-zinc-800/60"
                onClick={() => onFlowSelect(flow.id)}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  {flow.icon ? flow.icon : (
                    <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white">{flow.name}</div>
                  <div className="text-xs text-zinc-500">{flow.blocks} Blocks</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowSelector;

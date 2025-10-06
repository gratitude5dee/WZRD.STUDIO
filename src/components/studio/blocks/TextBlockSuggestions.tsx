import React from 'react';
import { Info } from 'lucide-react';
import { PROMPT_TEMPLATES, SUGGESTION_ORDER } from './promptTemplates';
import { ActionTemplate } from '@/types/studioTypes';
import { Button } from '@/components/ui/button';

interface TextBlockSuggestionsProps {
  onSelectAction: (template: ActionTemplate) => void;
}

const TextBlockSuggestions: React.FC<TextBlockSuggestionsProps> = ({ onSelectAction }) => {
  return (
    <div className="space-y-3">
      {/* Info section */}
      <button
        onClick={() => {/* TODO: Open help modal */}}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg border border-zinc-800/30 hover:border-zinc-700/50 transition-all"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Learn about Text Blocks</span>
      </button>

      {/* Suggestions Grid */}
      <div className="space-y-1.5">
        {SUGGESTION_ORDER.map(templateId => {
          const template = PROMPT_TEMPLATES[templateId];
          return (
            <button
              key={template.id}
              onClick={() => onSelectAction(template)}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-zinc-800/50 group-hover:bg-zinc-700/50 rounded-lg transition-colors">
                  <span className="text-base">{template.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-200 group-hover:text-white transition-colors font-medium">
                    {template.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 transition-colors truncate">
                    {template.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <div className="pt-2 border-t border-zinc-800/30">
        <div className="text-[11px] text-zinc-500 text-center">
          Or start typing your own prompt...
        </div>
      </div>
    </div>
  );
};

export default TextBlockSuggestions;

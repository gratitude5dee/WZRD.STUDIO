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
    <div className="space-y-4 p-4">
      {/* Info section */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 pb-2 border-b border-zinc-800">
        <Info className="w-3.5 h-3.5" />
        <span>Learn about Text Blocks</span>
      </div>

      {/* Try to section */}
      <div>
        <h3 className="text-xs font-medium text-zinc-300 mb-3">Try to...</h3>
        <div className="space-y-2">
          {SUGGESTION_ORDER.map(templateId => {
            const template = PROMPT_TEMPLATES[templateId];
            return (
              <button
                key={template.id}
                onClick={() => onSelectAction(template)}
                className="w-full text-left px-3 py-2.5 rounded-md bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{template.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm text-zinc-200 group-hover:text-white transition-colors">
                      {template.label}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {template.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sample prompt hint */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 italic">
          Or type your own prompt below...
        </div>
      </div>
    </div>
  );
};

export default TextBlockSuggestions;

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
    <div className="space-y-2 mb-3">
      <button 
        className="w-full flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-2 rounded-lg transition-colors text-left text-xs"
        onClick={() => {/* TODO: Open help modal */}}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Info className="w-3.5 h-3.5" />
        <span>Learn about Text Blocks</span>
      </button>

      {SUGGESTION_ORDER.map(templateId => {
        const template = PROMPT_TEMPLATES[templateId];
        return (
          <button
            key={template.id}
            onClick={() => onSelectAction(template)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-2 rounded-lg transition-colors text-left text-xs"
          >
            <span className="text-sm">{template.icon}</span>
            <span>{template.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TextBlockSuggestions;

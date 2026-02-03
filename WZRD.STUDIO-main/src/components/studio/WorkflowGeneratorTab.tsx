import { useState, useCallback } from 'react';
import { Send, Loader2, Workflow, Type, Image, Video, Share2, Wand2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

interface WorkflowExample {
  id: string;
  prompt: string;
  title: string;
  type: string;
  icon: React.ElementType;
}

const WORKFLOW_EXAMPLES: WorkflowExample[] = [
  {
    id: 'coffee-marketing',
    prompt: 'Generate a workflow for coffee shop marketing',
    title: 'Coffee shop marketing',
    type: 'Multi-node workflow',
    icon: Workflow,
  },
  {
    id: 'product-descriptions',
    prompt: 'Add a text node for product descriptions',
    title: 'Product description copy',
    type: 'Single node',
    icon: Type,
  },
  {
    id: 'social-media',
    prompt: 'Create a workflow for social media content',
    title: 'Social media pack',
    type: 'Multi-node workflow',
    icon: Share2,
  },
  {
    id: 'logo-design',
    prompt: 'Add an image node for logo design',
    title: 'Logo exploration',
    type: 'Single node',
    icon: Image,
  },
  {
    id: 'video-production',
    prompt: 'Generate a video production workflow',
    title: 'Video production plan',
    type: 'Multi-node workflow',
    icon: Video,
  },
];

interface WorkflowGeneratorTabProps {
  onWorkflowGenerated: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => void;
}

export function WorkflowGeneratorTab({ onWorkflowGenerated }: WorkflowGeneratorTabProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.nodes && data?.edges) {
        onWorkflowGenerated(data.nodes, data.edges);
        toast.success(`Created ${data.nodes.length} nodes!`);
        setPrompt('');
      } else {
        throw new Error('Invalid workflow response');
      }
    } catch (error: any) {
      console.error('Workflow generation failed:', error);
      toast.error(error.message || 'Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, onWorkflowGenerated]);

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-80 bg-surface-2 border border-border-default rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative px-4 py-3 border-b border-border-subtle">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/10 to-accent-teal/10" />
        <div className="relative flex items-center gap-2">
          <motion.div 
            className="p-1.5 rounded-lg bg-accent-purple/20"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(147, 51, 234, 0)',
                '0 0 12px 3px rgba(147, 51, 234, 0.4)',
                '0 0 0 0 rgba(147, 51, 234, 0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Wand2 className="w-4 h-4 text-accent-purple" />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Workflow Generator</h3>
            <p className="text-[11px] text-text-tertiary">Describe what you want to create</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Generate a workflow..."
            className="w-full h-24 px-4 py-3 rounded-xl bg-surface-3 border border-border-default text-sm text-text-primary placeholder:text-text-disabled resize-none focus:outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
              <Loader2 className="w-4 h-4 animate-spin text-accent-purple" />
              <span className="text-xs text-accent-purple">Generating workflow...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isGenerating && (
        <div className="px-4 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary mb-2">Examples</p>
          <div className="space-y-2">
            {WORKFLOW_EXAMPLES.map((example, index) => {
              const Icon = example.icon;
              return (
                <motion.button
                  key={example.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.25, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02, x: 4, transition: { duration: 0.15 } }}
                  onClick={() => handleExampleClick(example.prompt)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-3/50 hover:bg-surface-3',
                    'border border-transparent hover:border-accent-purple/30 transition-colors text-left group'
                  )}
                >
                  <div className="p-1.5 rounded-lg bg-surface-4 text-text-tertiary group-hover:text-accent-purple transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{example.title}</p>
                    <p className="text-[11px] text-text-tertiary">{example.type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-accent-purple transition-colors" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 py-2 border-t border-border-subtle bg-surface-3/30">
        <p className="text-[10px] text-text-disabled text-center">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-4 text-text-tertiary font-mono">Enter</kbd> to generate
        </p>
      </div>
    </div>
  );
}

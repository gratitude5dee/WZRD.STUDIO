import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, Workflow, Type, Image, Video, Share2, ArrowRight, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

interface WorkflowExample {
  id: string;
  prompt: string;
  nodeType: 'single' | 'multiple';
  icon: React.ElementType;
  description: string;
}

const WORKFLOW_EXAMPLES: WorkflowExample[] = [
  {
    id: 'coffee-marketing',
    prompt: 'Generate a workflow for coffee shop marketing',
    nodeType: 'multiple',
    icon: Workflow,
    description: 'Multi-node workflow'
  },
  {
    id: 'product-descriptions',
    prompt: 'Add a text node for product descriptions',
    nodeType: 'single',
    icon: Type,
    description: 'Single node'
  },
  {
    id: 'social-media',
    prompt: 'Create a workflow for social media content',
    nodeType: 'multiple',
    icon: Share2,
    description: 'Multi-node workflow'
  },
  {
    id: 'logo-design',
    prompt: 'Add an image node for logo design',
    nodeType: 'single',
    icon: Image,
    description: 'Single node'
  },
  {
    id: 'video-production',
    prompt: 'Generate a video production workflow',
    nodeType: 'multiple',
    icon: Video,
    description: 'Multi-node workflow'
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
        body: { prompt }
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-200">AI Workflow Generator</h3>
            <p className="text-[10px] text-zinc-500">Describe what you want to create</p>
          </div>
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-b border-zinc-800/50">
        <div className="relative">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Generate a workflow..."
            className="pr-10 h-10 bg-zinc-900/50 border-zinc-700/50 text-white text-sm placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            disabled={isGenerating}
          />
          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="absolute right-1 top-1 h-8 w-8 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2"
          >
            <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-xs text-purple-300">Generating workflow...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Examples Section */}
      {!isGenerating && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Examples
            </span>
          </div>
          
          <div className="space-y-1.5">
            {WORKFLOW_EXAMPLES.map((example, index) => {
              const Icon = example.icon;
              return (
                <motion.button
                  key={example.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleExampleClick(example.prompt)}
                  className={cn(
                    'w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left group',
                    'bg-zinc-900/30 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50'
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-700/50 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{example.prompt}</p>
                    <p className="text-[10px] text-zinc-600">{example.description}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-zinc-800/50">
        <p className="text-[10px] text-zinc-600 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[9px]">Enter</kbd> to generate
        </p>
      </div>
    </div>
  );
}

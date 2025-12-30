import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, Workflow, Type, Image, Video, Share2, ArrowRight } from 'lucide-react';
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
    description: 'Multiple Nodes'
  },
  {
    id: 'product-descriptions',
    prompt: 'Add a text node for product descriptions',
    nodeType: 'single',
    icon: Type,
    description: 'Single Node'
  },
  {
    id: 'social-media',
    prompt: 'Create a workflow for social media content',
    nodeType: 'multiple',
    icon: Share2,
    description: 'Multiple Nodes'
  },
  {
    id: 'logo-design',
    prompt: 'Add an image node for logo design',
    nodeType: 'single',
    icon: Image,
    description: 'Single Node'
  },
  {
    id: 'video-production',
    prompt: 'Generate a video production workflow',
    nodeType: 'multiple',
    icon: Video,
    description: 'Multiple Nodes'
  },
];

interface AIWorkflowGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowGenerated: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => void;
}

export function AIWorkflowGenerator({ open, onOpenChange, onWorkflowGenerated }: AIWorkflowGeneratorProps) {
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
        onOpenChange(false);
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
  }, [prompt, onWorkflowGenerated, onOpenChange]);

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-zinc-950 border-zinc-800 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative pt-8 pb-4 px-6 border-b border-zinc-800/50">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">AI Workflow Generator</h2>
            <p className="text-sm text-zinc-400 mt-1">Describe what you want to create</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Field */}
          <div className="relative">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Generate a workflow for coffee shop marketing"
              className="pr-12 h-12 bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              disabled={isGenerating}
              autoFocus
            />
            <Button
              size="icon"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-1.5 top-1.5 h-9 w-9 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Loading State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
              >
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-sm text-purple-300">Generating your workflow...</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Examples Section */}
          {!isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                  Try These Examples
                </span>
              </div>
              
              <div className="space-y-2">
                {WORKFLOW_EXAMPLES.map((example, index) => {
                  const Icon = example.icon;
                  return (
                    <motion.button
                      key={example.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleExampleClick(example.prompt)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group',
                        'bg-zinc-900/30 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50'
                      )}
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-700/50 transition-colors">
                        <Icon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 truncate">{example.prompt}</p>
                        <p className="text-xs text-zinc-500">{example.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          {/* Keyboard Shortcuts */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-600 pt-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Enter</kbd> to generate</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Esc</kbd> to cancel</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

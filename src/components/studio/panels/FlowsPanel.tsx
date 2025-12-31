import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
  Workflow,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowsStore, type SavedFlow } from '@/store/flowsStore';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FlowsPanelProps {
  projectId: string;
  onClose: () => void;
}

export const FlowsPanel: React.FC<FlowsPanelProps> = ({ projectId, onClose }) => {
  const {
    savedFlows,
    isLoading,
    fetchFlows,
    saveCurrentFlow,
    loadFlow,
    deleteFlow,
    duplicateFlow,
    renameFlow,
    selectedFlowId,
  } = useFlowsStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchFlows(projectId);
  }, [projectId, fetchFlows]);

  const handleSaveFlow = async () => {
    if (!newFlowName.trim()) {
      toast.error('Please enter a flow name');
      return;
    }

    await saveCurrentFlow(projectId, newFlowName, newFlowDescription);
    toast.success('Flow saved successfully');
    setShowSaveDialog(false);
    setNewFlowName('');
    setNewFlowDescription('');
  };

  const handleLoadFlow = async (flowId: string) => {
    await loadFlow(flowId);
    toast.success('Flow loaded');
    onClose();
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (confirm('Are you sure you want to delete this flow?')) {
      await deleteFlow(flowId);
      toast.success('Flow deleted');
    }
  };

  const handleDuplicate = async (flow: SavedFlow) => {
    await duplicateFlow(flow.id, `${flow.name} (Copy)`);
    toast.success('Flow duplicated');
  };

  const handleRename = async (flowId: string) => {
    if (!editName.trim()) return;
    await renameFlow(flowId, editName);
    setEditingFlowId(null);
    toast.success('Flow renamed');
  };

  return (
    <div className="w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-white">Saved Flows</span>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="p-1.5 rounded-lg bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-800/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Flow name..."
                value={newFlowName}
                onChange={(event) => setNewFlowName(event.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent-purple/50"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)..."
                value={newFlowDescription}
                onChange={(event) => setNewFlowDescription(event.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent-purple/50 resize-none h-16"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveFlow}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Save Flow'
                  )}
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-h-80 overflow-y-auto">
        {isLoading && savedFlows.length === 0 ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : savedFlows.length === 0 ? (
          <div className="p-8 text-center">
            <Workflow className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No saved flows yet</p>
            <p className="text-xs text-zinc-600 mt-1">Save your current workflow to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {savedFlows.map((flow) => (
              <motion.div
                key={flow.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'group p-3 rounded-lg transition-all cursor-pointer',
                  selectedFlowId === flow.id
                    ? 'bg-accent-purple/20 border border-accent-purple/30'
                    : 'hover:bg-zinc-800/50 border border-transparent'
                )}
                onClick={() => handleLoadFlow(flow.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingFlowId === flow.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-sm text-white"
                          onClick={(event) => event.stopPropagation()}
                          autoFocus
                        />
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRename(flow.id);
                          }}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingFlowId(null);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-white truncate">{flow.name}</p>
                        {flow.description && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{flow.description}</p>
                        )}
                      </>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(event) => event.stopPropagation()}
                        className="p-1 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingFlowId(flow.id);
                          setEditName(flow.name);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDuplicate(flow);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteFlow(flow.id);
                        }}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                  <span>{flow.nodeCount} nodes</span>
                  <span>•</span>
                  <span>{flow.edgeCount} edges</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(flow.updatedAt, { addSuffix: true })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

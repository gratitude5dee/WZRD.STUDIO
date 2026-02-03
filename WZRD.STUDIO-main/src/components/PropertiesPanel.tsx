
import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeChange: (nodeId: string, data: any) => void;
}

const PropertiesPanel = ({ selectedNode, onNodeChange }: PropertiesPanelProps) => {
  const [nodeData, setNodeData] = useState<any>(selectedNode?.data || {});

  useEffect(() => {
    setNodeData(selectedNode?.data || {});
  }, [selectedNode]);

  const handleInputChange = (key: string, value: string) => {
    const newData = { ...nodeData, [key]: value };
    setNodeData(newData);
    if (selectedNode) {
      onNodeChange(selectedNode.id, newData);
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-4 text-zinc-400 text-sm">
        Select a node to view its properties
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm text-zinc-400">Title</label>
        <input
          type="text"
          value={nodeData.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
          className="w-full bg-zinc-800/50 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-zinc-400">Prompt</label>
        <textarea
          value={nodeData.prompt || ''}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          className="w-full bg-zinc-800/50 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors resize-none h-24"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-zinc-400">Image URL</label>
        <input
          type="text"
          value={nodeData.imageUrl || ''}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          className="w-full bg-zinc-800/50 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;

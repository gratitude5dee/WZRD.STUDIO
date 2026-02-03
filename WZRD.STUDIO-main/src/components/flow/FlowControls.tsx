
import { Panel } from 'reactflow';
import { Button } from '../ui/button';
import { Save, Upload } from 'lucide-react';

interface FlowControlsProps {
  onSave: () => void;
  onLoad: (workflowId: string) => void;
}

const FlowControls = ({ onSave, onLoad }: FlowControlsProps) => {
  return (
    <>
      {/* Save/Load Controls */}
      <Panel position="top-left" className="flex gap-2">
        <Button
          onClick={onSave}
          variant="outline"
          className="bg-black/80 text-white border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Workflow
        </Button>
        <Button
          onClick={() => onLoad("your-workflow-id")}
          variant="outline"
          className="bg-black/80 text-white border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Load Workflow
        </Button>
      </Panel>

      {/* Navigation Instructions */}
      <Panel position="bottom-center" className="bg-black/80 p-3 rounded-lg backdrop-blur mb-4 border border-zinc-800">
        <div className="flex gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-zinc-900/80 rounded border border-zinc-800">Middle Click + Drag</span>
            <span>Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-zinc-900/80 rounded border border-zinc-800">Scroll</span>
            <span>Zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-zinc-900/80 rounded border border-zinc-800">Drag</span>
            <span>Move Nodes</span>
          </div>
        </div>
      </Panel>
    </>
  );
};

export default FlowControls;

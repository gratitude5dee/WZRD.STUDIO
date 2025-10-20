import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TimelineFlowProps {
  projectId?: string;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Scene 1' },
    position: { x: 50, y: 50 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'Scene 2' },
    position: { x: 250, y: 50 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
];

export function TimelineFlow({ projectId }: TimelineFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950">
      {/* Playback Controls */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPause}
            className="h-7 w-7 p-0 text-white hover:bg-purple-500/20 hover:text-purple-400"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled
            className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 max-w-md">
          <Slider
            value={[currentTime]}
            onValueChange={handleTimeChange}
            max={duration}
            step={1}
            className="w-full"
          />
        </div>

        <div className="text-xs text-white/40">
          {nodes.length} nodes
        </div>
      </div>

      {/* ReactFlow Timeline */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-zinc-950"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="#ffffff10"
          />
          <Controls className="bg-black/50 backdrop-blur-sm border border-white/[0.08]" />
          <MiniMap
            className="bg-black/50 backdrop-blur-sm border border-white/[0.08]"
            nodeColor="#8B5CF6"
            maskColor="#0A0A0A90"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

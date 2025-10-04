import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetTransform: () => void;
  zoomLevel: number;
}

const CanvasControls = ({ onZoomIn, onZoomOut, onResetTransform, zoomLevel }: CanvasControlsProps) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 bg-canvas-block border border-canvas-connector-default rounded-lg p-2 shadow-lg z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="hover:bg-canvas-accent-blue/20 text-canvas-text-primary"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="text-xs text-canvas-text-secondary text-center py-1 min-w-[3rem]">
        {Math.round(zoomLevel * 100)}%
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="hover:bg-canvas-accent-blue/20 text-canvas-text-primary"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <div className="h-px bg-canvas-connector-default my-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onResetTransform}
        className="hover:bg-canvas-accent-blue/20 text-canvas-text-primary"
        title="Reset View"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CanvasControls;

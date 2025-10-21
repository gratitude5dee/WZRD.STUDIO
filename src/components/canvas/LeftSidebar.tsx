import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useState, useEffect } from 'react';

export const LeftSidebar = () => {
  const { viewport, setViewport } = useCanvasStore();
  const [zoomPercentage, setZoomPercentage] = useState(100);

  useEffect(() => {
    setZoomPercentage(Math.round(viewport.scale * 100));
  }, [viewport.scale]);

  const handleZoomIn = () => {
    const newScale = Math.min(viewport.scale * 1.2, 5);
    setViewport({ ...viewport, scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(viewport.scale / 1.2, 0.1);
    setViewport({ ...viewport, scale: newScale });
  };

  const handleFitToScreen = () => {
    setViewport({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="w-16 h-full bg-[#0A0A0A] border-r border-border/30 flex flex-col items-center py-4 gap-4">
      {/* Zoom Controls */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="w-10 h-10 hover:bg-white/5"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-muted-foreground" />
        </Button>

        <div className="flex items-center justify-center w-10 h-8 text-xs text-muted-foreground">
          {zoomPercentage}%
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="w-10 h-10 hover:bg-white/5"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitToScreen}
          className="w-10 h-10 hover:bg-white/5"
          title="Fit to Screen"
        >
          <Maximize2 className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

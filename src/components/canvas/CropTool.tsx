import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import type { CanvasObject } from '@/types/canvas';

interface CropToolProps {
  objectId: string;
  onApply: () => void;
  onCancel: () => void;
}

export function CropTool({ objectId, onApply, onCancel }: CropToolProps) {
  const { objects, updateObject } = useCanvasStore();
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  const object = objects.find(obj => obj.id === objectId);

  useEffect(() => {
    if (object && object.type === 'image') {
      // Store crop data in metadata instead
      const metadata = (object as any).metadata || {};
      setCropData({
        x: metadata.cropX || 0,
        y: metadata.cropY || 0,
        width: metadata.cropWidth || 1,
        height: metadata.cropHeight || 1,
      });
    }
  }, [object]);

  const handleApply = () => {
    if (object) {
      // For now, just update the object without crop data since type doesn't support it yet
      // This can be extended when proper crop support is added to the CanvasObject type
      updateObject(objectId, object);
    }
    onApply();
  };

  const handleReset = () => {
    setCropData({ x: 0, y: 0, width: 1, height: 1 });
  };

  if (!object) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
      {/* Crop Overlay */}
      <div className="relative">
        {/* Crop controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background rounded-lg p-2 shadow-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
          >
            <Check className="w-4 h-4" />
            Apply
          </Button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background rounded-lg p-3 shadow-lg text-sm">
          <p className="text-muted-foreground">
            Drag handles to adjust crop area • Press <kbd className="px-1 bg-accent rounded">Enter</kbd> to apply • <kbd className="px-1 bg-accent rounded">Esc</kbd> to cancel
          </p>
        </div>

        {/* Crop area visualization would go here */}
        <div className="w-[600px] h-[400px] border-2 border-primary rounded-lg" />
      </div>
    </div>
  );
}

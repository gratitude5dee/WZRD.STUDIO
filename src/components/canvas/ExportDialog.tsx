import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useState as useExportState } from 'react';
import { ExportService } from '@/services/exportService';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objects: any[];
  viewport: { x: number; y: number; scale: number };
  selectedIds: string[];
}

export function ExportDialog({
  open,
  onOpenChange,
  objects,
  viewport,
  selectedIds,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<'png' | 'gif'>('png');
  const [quality, setQuality] = useState(1);
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(true);
  const [selectedOnly, setSelectedOnly] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const objectsToExport = selectedOnly
        ? objects.filter(obj => selectedIds.includes(obj.id))
        : objects;

      if (objectsToExport.length === 0) {
        toast.error('No objects to export');
        return;
      }

      setProgress(30);

      let result: string | Blob;
      if (format === 'png') {
        result = await ExportService.exportToPNG(objectsToExport, viewport, {
          format,
          quality,
          scale,
          transparent,
          selectedOnly,
        });
      } else {
        result = await ExportService.exportToGIF(objectsToExport, viewport, {
          format,
          quality,
          scale,
          transparent,
          selectedOnly,
        });
      }

      setProgress(80);

      if (typeof result === 'string') {
        const filename = `kanvas-${Date.now()}.${format}`;
        ExportService.downloadImage(result, filename);
      } else {
        const url = URL.createObjectURL(result);
        const filename = `kanvas-${Date.now()}.${format}`;
        ExportService.downloadImage(url, filename);
        URL.revokeObjectURL(url);
      }

      setProgress(100);
      toast.success('Export completed!');
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Canvas</DialogTitle>
          <DialogDescription>
            Configure export settings and download your canvas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'png' | 'gif')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="png" />
                <Label htmlFor="png" className="font-normal cursor-pointer">
                  PNG (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gif" id="gif" />
                <Label htmlFor="gif" className="font-normal cursor-pointer">
                  GIF (Coming Soon)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <Label>Quality: {Math.round(quality * 100)}%</Label>
            <Slider
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              min={0.1}
              max={1}
              step={0.1}
            />
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <Label>Scale: {scale}x</Label>
            <Slider
              value={[scale]}
              onValueChange={([v]) => setScale(v)}
              min={0.5}
              max={4}
              step={0.5}
            />
          </div>

          {/* Transparent Background */}
          <div className="flex items-center justify-between">
            <Label htmlFor="transparent">Transparent Background</Label>
            <Switch
              id="transparent"
              checked={transparent}
              onCheckedChange={setTransparent}
            />
          </div>

          {/* Selected Only */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between">
              <Label htmlFor="selected">
                Export Selected Only ({selectedIds.length})
              </Label>
              <Switch
                id="selected"
                checked={selectedOnly}
                onCheckedChange={setSelectedOnly}
              />
            </div>
          )}

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exporting...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

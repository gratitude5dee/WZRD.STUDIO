import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExport } from '@/hooks/useExport';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const qualities: Array<{ label: string; value: 'low' | 'medium' | 'high' | '4k' }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: '4K', value: '4k' },
];

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high' | '4k'>('high');
  const { exportVideo, isExporting, progress, error, downloadUrl, resetExportState } = useExport();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetExportState();
    }
    onOpenChange(nextOpen);
  };

  const handleExport = async () => {
    await exportVideo({ format, quality });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0F1117] border border-[#1D2130] text-white">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription className="text-[#8E94A8]">
            Choose your desired format and quality to render your timeline via Remotion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-[#8E94A8] mb-2">Format</p>
            <div className="flex gap-2">
              {['mp4', 'webm'].map((option) => (
                <Button
                  key={option}
                  variant={format === option ? 'default' : 'outline'}
                  className={format === option ? 'bg-[#9b87f5] hover:bg-[#b5a3f9]' : 'border-[#1D2130] text-white'}
                  onClick={() => setFormat(option as 'mp4' | 'webm')}
                >
                  {option.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-[#8E94A8] mb-2">Quality</p>
            <div className="grid grid-cols-2 gap-2">
              {qualities.map((option) => (
                <Button
                  key={option.value}
                  variant={quality === option.value ? 'default' : 'outline'}
                  className={quality === option.value ? 'bg-[#9b87f5] hover:bg-[#b5a3f9]' : 'border-[#1D2130] text-white'}
                  onClick={() => setQuality(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} className="bg-[#1D2130]" />
              <p className="text-xs text-[#8E94A8]">Rendering your video...</p>
            </div>
          )}
          {downloadUrl && (
            <div className="space-y-2">
              <p className="text-xs text-[#8E94A8]">Export complete!</p>
              <Button asChild className="bg-[#9b87f5] hover:bg-[#b5a3f9] w-full">
                <a href={downloadUrl} target="_blank" rel="noreferrer">
                  Download
                </a>
              </Button>
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button disabled={isExporting} onClick={handleExport} className="bg-[#9b87f5] hover:bg-[#b5a3f9]">
            {isExporting ? 'Exporting...' : 'Start Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

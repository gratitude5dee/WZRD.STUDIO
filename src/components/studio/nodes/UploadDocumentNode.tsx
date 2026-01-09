import { memo, useState, useCallback } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { FileText, Upload, X, File } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';
import type { NodeStatus } from '@/types/computeFlow';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadDocumentNodeData {
  status?: string;
  progress?: number;
  error?: string;
  documentUrl?: string;
  fileName?: string;
  textContent?: string;
}

export const UploadDocumentNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as UploadDocumentNodeData;
  const status = (nodeData?.status || 'idle') as NodeStatus;
  const progress = nodeData?.progress || 0;
  const error = nodeData?.error;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
  const [documentUrl, setDocumentUrl] = useState<string | null>(nodeData?.documentUrl || null);
  const [fileName, setFileName] = useState<string | null>(nodeData?.fileName || null);
  const [textContent, setTextContent] = useState<string | null>(nodeData?.textContent || null);
  const [isUploading, setIsUploading] = useState(false);

  const handles = [
    {
      id: 'text-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'text' as const,
      label: 'Text',
    },
  ];

  const handleFileSelect = useCallback(async (file: File) => {
    const validTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv'];
    const validExtensions = ['.txt', '.md', '.pdf', '.csv', '.json'];
    
    const isValid = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      toast.error('Please select a text document (TXT, MD, PDF, CSV)');
      return;
    }

    setIsUploading(true);
    try {
      // For text files, read the content directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        setTextContent(text);
      }

      // Upload to storage
      const path = `uploads/${id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('canvas-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('canvas-assets')
        .getPublicUrl(path);

      setDocumentUrl(publicUrl);
      setFileName(file.name);
      toast.success('Document uploaded!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.pdf,.csv,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentUrl(null);
    setFileName(null);
    setTextContent(null);
  }, []);

  return (
    <BaseNode
      handles={handles}
      nodeType="text"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className={cn(
        "w-72 bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden",
        selected && "ring-2 ring-amber-500/50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-white font-mono text-sm">Upload Document</span>
          </div>
          <span className="text-zinc-500 text-xs">Source</span>
        </div>

        {/* Upload Area */}
        <div
          className="p-3"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {documentUrl ? (
            <div className="relative">
              <div className="flex items-start gap-3 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700">
                <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                  <File className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate font-medium">{fileName}</p>
                  {textContent && (
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">
                      {textContent.slice(0, 100)}...
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors shrink-0"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleClick}
              className={cn(
                "h-24 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/60",
                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                "hover:border-amber-500/50 hover:bg-zinc-800/50 transition-colors",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <Upload className={cn("w-6 h-6", isUploading ? "animate-pulse text-amber-400" : "text-zinc-500")} />
              <p className="text-xs text-zinc-400">
                {isUploading ? 'Uploading...' : 'Drop document or click'}
              </p>
              <p className="text-[10px] text-zinc-600">TXT, MD, PDF, CSV</p>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

UploadDocumentNode.displayName = 'UploadDocumentNode';

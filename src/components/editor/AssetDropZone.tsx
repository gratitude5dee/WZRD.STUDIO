import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, Music, FileText, CheckCircle2, X, Loader2 } from 'lucide-react';
import { editorTheme, typography } from '@/lib/editor/theme';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export function AssetDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const simulateUpload = (file: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, progress: 100, status: 'complete' } : f
          )
        );
      } else {
        setUploadedFiles(prev =>
          prev.map(f => (f.id === file.id ? { ...f, progress } : f))
        );
      }
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const newFiles: UploadedFile[] = files.map(file => {
      const uploadFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
      };

      if (file.type.startsWith('image/')) {
        uploadFile.preview = URL.createObjectURL(file);
      }

      simulateUpload(uploadFile);
      return uploadFile;
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map(file => {
      const uploadFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
      };

      if (file.type.startsWith('image/')) {
        uploadFile.preview = URL.createObjectURL(file);
      }

      simulateUpload(uploadFile);
      return uploadFile;
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-hidden">
      {/* Drop Zone */}
      <motion.div
        className="relative flex-shrink-0 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
        style={{
          borderColor: isDragging ? 'hsl(var(--purple-500))' : editorTheme.border.subtle,
          background: isDragging
            ? 'hsl(var(--purple-500) / 0.05)'
            : editorTheme.bg.tertiary,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*,video/*,audio/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
        />
        
        <div className="relative py-12 px-6 text-center z-0">
          <motion.div
            animate={{
              y: isDragging ? -8 : 0,
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{
              background: isDragging
                ? 'linear-gradient(135deg, hsl(var(--purple-600)), hsl(var(--purple-400)))'
                : 'linear-gradient(135deg, hsl(var(--purple-600) / 0.2), hsl(var(--purple-400) / 0.1))',
            }}
          >
            <Upload
              size={32}
              style={{
                color: isDragging ? '#fff' : 'hsl(var(--purple-400))',
              }}
            />
          </motion.div>

          <h3
            className="mb-2"
            style={{
              color: editorTheme.text.primary,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {isDragging ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          
          <p
            className="mb-4"
            style={{
              color: editorTheme.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            or click to browse
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { icon: Image, label: 'Images' },
              { icon: Video, label: 'Videos' },
              { icon: Music, label: 'Audio' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{
                  background: editorTheme.bg.secondary,
                  color: editorTheme.text.tertiary,
                  fontSize: typography.fontSize.xs,
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated background gradient */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, hsl(var(--purple-500) / 0.1), transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Files List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {uploadedFiles.map(uploadedFile => {
            const FileIcon = getFileIcon(uploadedFile.file);
            const isComplete = uploadedFile.status === 'complete';

            return (
              <motion.div
                key={uploadedFile.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative rounded-lg p-3 border"
                style={{
                  background: editorTheme.bg.tertiary,
                  borderColor: editorTheme.border.subtle,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Preview or Icon */}
                  <div
                    className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      width: 48,
                      height: 48,
                      background: uploadedFile.preview
                        ? 'transparent'
                        : editorTheme.bg.secondary,
                    }}
                  >
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon
                        size={24}
                        style={{ color: 'hsl(var(--purple-400))' }}
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate mb-1"
                      style={{
                        color: editorTheme.text.primary,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      {uploadedFile.file.name}
                    </p>
                    <p
                      style={{
                        color: editorTheme.text.tertiary,
                        fontSize: typography.fontSize.xs,
                      }}
                    >
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {!isComplete && (
                      <div
                        className="mt-2 h-1 rounded-full overflow-hidden"
                        style={{ background: editorTheme.bg.secondary }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              'linear-gradient(90deg, hsl(var(--purple-600)), hsl(var(--purple-400)))',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2
                        size={20}
                        style={{ color: 'hsl(var(--purple-400))' }}
                      />
                    ) : (
                      <Loader2
                        size={20}
                        className="animate-spin"
                        style={{ color: 'hsl(var(--purple-400))' }}
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="flex-shrink-0 p-1 rounded-md transition-colors"
                    style={{ color: editorTheme.text.tertiary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = editorTheme.bg.hover;
                      e.currentTarget.style.color = editorTheme.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = editorTheme.text.tertiary;
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {uploadedFiles.length === 0 && (
          <div
            className="text-center py-8"
            style={{
              color: editorTheme.text.tertiary,
              fontSize: typography.fontSize.sm,
            }}
          >
            No files uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: AssetUploader
// PURPOSE: Drag-and-drop file uploader with preview and validation
// ============================================================================

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAssetUpload } from "@/hooks/useAssets";
import { assetService } from "@/services/assetService";
import type {
  AssetType,
  AssetCategory,
  AssetVisibility,
  AssetUploadRequest,
  AssetUploadResponse,
} from "@/types/assets";
import { cn } from "@/lib/utils";

interface AssetUploaderProps {
  projectId?: string;
  assetType?: AssetType;
  assetCategory?: AssetCategory;
  visibility?: AssetVisibility;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  onUploadComplete?: (assetIds: string[]) => void;
  label?: string;
  getAssetTypeForFile?: (file: File) => AssetType;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const ASSET_TYPE_ACCEPTS: Record<AssetType, { [key: string]: string[] }> = {
  image: {
    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  },
  video: {
    "video/*": [".mp4", ".mov", ".avi", ".webm"],
  },
  audio: {
    "audio/*": [".mp3", ".wav", ".ogg", ".webm", ".aac"],
  },
  document: {
    "application/pdf": [".pdf"],
    "application/json": [".json"],
  },
  model: {
    "model/*": [".glb", ".gltf"],
  },
  font: {
    "font/*": [".ttf", ".otf", ".woff", ".woff2"],
  },
  other: {
    "*/*": [],
  },
};

interface UploadExecutionContext {
  projectId?: string;
  assetType: AssetType;
  assetCategory: AssetCategory;
  visibility: AssetVisibility;
  uploadFn: (request: AssetUploadRequest) => Promise<AssetUploadResponse>;
  onProgress?: (fileName: string, progress: number) => void;
}

export async function uploadDroppedFiles(
  files: File[],
  context: UploadExecutionContext
): Promise<string[]> {
  const uploadedAssetIds: string[] = [];

  for (const file of files) {
    context.onProgress?.(file.name, 0);
    const base64 = await assetService.fileToBase64(file);
    context.onProgress?.(file.name, 50);

    const response = await context.uploadFn({
      projectId: context.projectId,
      assetType: context.assetType,
      assetCategory: context.assetCategory,
      visibility: context.visibility,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      },
    });

    context.onProgress?.(file.name, 100);

    if (response?.success && response.assetId) {
      uploadedAssetIds.push(response.assetId);
    }
  }

  return uploadedAssetIds;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  projectId,
  assetType = "image",
  assetCategory = "upload",
  visibility = "private",
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes,
  onUploadComplete,
  label,
  getAssetTypeForFile,
  className,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const uploadMutation = useAssetUpload();
  const displayLabel = label ?? assetType.toUpperCase();

  const determineAssetType = useCallback(
    (file: File): AssetType => {
      if (getAssetTypeForFile) {
        return getAssetTypeForFile(file);
      }
      return assetType;
    },
    [assetType, getAssetTypeForFile]
  );

  const onDrop = useCallback(
    (incomingFiles: File[]) => {
      setFiles((prev) => {
        const availableSlots = Math.max(maxFiles - prev.length, 0);
        if (availableSlots === 0) {
          return prev;
        }

        const sanitized = incomingFiles
          .filter((file) => {
            const withinSize = file.size <= maxSize;
            if (!withinSize) {
              console.warn(
                `File ${file.name} exceeds the maximum size of ${Math.round(
                  maxSize / 1024 / 1024
                )}MB and was skipped.`
              );
            }
            return withinSize;
          })
          .slice(0, availableSlots)
          .map((file) =>
            Object.assign(file, {
              preview: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : undefined,
            })
          );

        return sanitized.length > 0 ? [...prev, ...sanitized] : prev;
      });
    },
    [maxFiles, maxSize]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const updateProgress = useCallback((fileName: string, progress: number) => {
    setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadedAssetIds = await uploadDroppedFiles(files, {
        projectId,
        assetType,
        assetCategory,
        visibility,
        uploadFn: uploadMutation.mutateAsync,
        onProgress: updateProgress,
      });

      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
      setUploadProgress({});

      if (onUploadComplete) {
        onUploadComplete(uploadedAssetIds);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDropzoneClick = useCallback(() => {
    if (uploading || files.length >= maxFiles) return;
    fileInputRef.current?.click();
  }, [files.length, maxFiles, uploading]);

  const handleDropzoneKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleDropzoneClick();
      }
    },
    [handleDropzoneClick]
  );

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    if (!uploading && files.length < maxFiles) {
      setIsDragActive(true);
    }
  }, [files.length, maxFiles, uploading]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploading && files.length < maxFiles) {
      setIsDragActive(true);
    }
  }, [files.length, maxFiles, uploading]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current = 0;
      setIsDragActive(false);

      if (uploading || files.length >= maxFiles) {
        return;
      }

      const droppedFiles = event.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        onDrop(Array.from(droppedFiles));
      }
    },
    [files.length, maxFiles, onDrop, uploading]
  );

  const accept = acceptedFileTypes
    ? { "application/octet-stream": acceptedFileTypes }
    : ASSET_TYPE_ACCEPTS[assetType];

  const acceptAttribute = Object.entries(accept)
    .flatMap(([mime, extensions]) => [mime, ...extensions])
    .join(",");

  return (
    <div className={cn("space-y-4", className)} data-testid="asset-uploader">
      {/* Drop Zone */}
      <Card
        className="border-2 border-dashed hover:border-primary/50 transition-colors"
        data-testid="asset-uploader-dropzone"
      >
        <div className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={maxFiles > 1}
            accept={acceptAttribute}
            onChange={handleFileInput}
            disabled={uploading || files.length >= maxFiles}
            data-testid="asset-uploader-input"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? "Drop files to upload" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            {assetType.toUpperCase()} files up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max {maxFiles} files</p>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2" data-testid="asset-uploader-file-list">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            {!uploading && (
              <Button size="sm" onClick={handleUpload} data-testid="asset-upload-button">
                Upload All
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <Card
                key={`${file.name}-${index}`}
                className="p-3"
                data-testid="asset-uploader-file-row"
              >
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-muted-foreground" data-testid="asset-file-icon" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {(file.size / 1024).toFixed(0)} KB
                      </Badge>
                      {uploadProgress[file.name] !== undefined && (
                        <span
                          className="text-xs text-muted-foreground"
                          data-testid="asset-upload-progress"
                        >
                          {uploadProgress[file.name]}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress[file.name] !== undefined && (
                      <Progress
                        value={uploadProgress[file.name]}
                        className="h-1 mt-2"
                        data-testid="asset-upload-progress-bar"
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      data-testid="asset-remove-file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                  {uploading && uploadProgress[file.name] !== 100 && (
                    <Loader2
                      className="w-4 h-4 animate-spin text-muted-foreground"
                      data-testid="asset-upload-spinner"
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

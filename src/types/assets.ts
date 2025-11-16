// ============================================================================
// TYPE DEFINITIONS: Asset Management
// PURPOSE: Type-safe interfaces for asset management system
// ============================================================================

export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "model"
  | "font"
  | "other";

export type AssetCategory = "upload" | "generated" | "system" | "template";

export type AssetVisibility = "private" | "project" | "public";

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "quarantined";

export interface MediaMetadata {
  // Image
  width?: number;
  height?: number;
  aspect_ratio?: string;
  color_space?: string;
  has_alpha?: boolean;

  // Video
  duration_ms?: number;
  fps?: number;
  codec?: string;
  bitrate?: number;

  // Audio
  channels?: number;
  sample_rate?: number;

  // Processing
  processed_at?: string;
  has_thumbnail?: boolean;
  file_size?: number;

  // Generic
  [key: string]: any;
}

export interface ProjectAsset {
  id: string;
  user_id: string;
  project_id: string | null;

  // File info
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file_size_bytes: number;

  // Classification
  asset_type: AssetType;
  asset_category: AssetCategory;

  // Storage
  storage_provider: string;
  storage_bucket: string;
  storage_path: string;
  cdn_url: string | null;

  // Metadata
  media_metadata: MediaMetadata;

  // Processing
  processing_status: ProcessingStatus;
  processing_error: string | null;

  // Thumbnails
  thumbnail_bucket: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  preview_bucket: string | null;
  preview_path: string | null;
  preview_url: string | null;

  // Usage
  used_in_pages: string[];
  usage_count: number;

  // Access
  visibility: AssetVisibility;
  is_archived: boolean;

  // Audit
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
}

export interface AssetUploadRequest {
  projectId?: string;
  assetType: AssetType;
  assetCategory: AssetCategory;
  visibility: AssetVisibility;
  file: {
    name: string;
    type: string;
    size: number;
    base64: string;
  };
}

export interface AssetUploadResponse {
  success: boolean;
  assetId?: string;
  asset?: ProjectAsset;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface AssetUsage {
  id: string;
  asset_id: string;
  used_in_table: string;
  used_in_record_id: string;
  used_in_field: string | null;
  usage_metadata: Record<string, any>;
  usage_count?: number;
  created_at: string;
}

export interface AssetCollection {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parent_collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFilters {
  projectId?: string;
  assetType?: AssetType[];
  assetCategory?: AssetCategory[];
  visibility?: AssetVisibility[];
  processingStatus?: ProcessingStatus[];
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "created_at" | "updated_at" | "file_name" | "file_size_bytes";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
  onlyArchived?: boolean;
}

export interface AssetStats {
  totalAssets: number;
  totalSizeBytes: number;
  byType: Record<string, { count: number; sizeBytes: number }>;
}

export interface ProcessingQueue {
  id: string;
  asset_id: string;
  job_type: string;
  priority: number;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

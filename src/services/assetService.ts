// ============================================================================
// SERVICE: Asset Management
// PURPOSE: Type-safe API for asset CRUD operations
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import { mockAssetApi } from "./mockAssetApi";
import type {
  ProjectAsset,
  AssetUploadRequest,
  AssetUploadResponse,
  AssetFilters,
  AssetUsage,
  AssetCollection,
  AssetStats,
} from "@/types/assets";

const useMockAssets =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_USE_MOCK_ASSETS === "true") ||
  (typeof process !== "undefined" && process.env?.VITE_USE_MOCK_ASSETS === "true");

export const assetService = {
  /**
   * Upload a new asset
   */
  async upload(request: AssetUploadRequest): Promise<AssetUploadResponse> {
    if (useMockAssets) {
      return mockAssetApi.upload(request);
    }
    try {
      const { data, error } = await supabase.functions.invoke("asset-upload", {
        body: request,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Asset upload failed:", error);
      throw error;
    }
  },

  /**
   * List assets with filters
   */
  async list(filters: AssetFilters = {}): Promise<ProjectAsset[]> {
    if (useMockAssets) {
      return mockAssetApi.list(filters);
    }
    try {
      let query = supabase
        .from("project_assets")
        .select("*");

      if (filters.onlyArchived) {
        query = query.eq("is_archived", true);
      } else if (!filters.includeArchived) {
        query = query.eq("is_archived", false);
      }

      // Apply filters
      if (filters.projectId) {
        query = query.eq("project_id", filters.projectId);
      }

      if (filters.assetType && filters.assetType.length > 0) {
        query = query.in("asset_type", filters.assetType);
      }

      if (filters.assetCategory && filters.assetCategory.length > 0) {
        query = query.in("asset_category", filters.assetCategory);
      }

      if (filters.visibility && filters.visibility.length > 0) {
        query = query.in("visibility", filters.visibility);
      }

      if (filters.processingStatus && filters.processingStatus.length > 0) {
        query = query.in("processing_status", filters.processingStatus);
      }

      if (filters.searchQuery) {
        query = query.or(
          `original_file_name.ilike.%${filters.searchQuery}%,file_name.ilike.%${filters.searchQuery}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to list assets:", error);
      throw error;
    }
  },

  /**
   * Get single asset by ID
   */
  async getById(assetId: string): Promise<ProjectAsset | null> {
    if (useMockAssets) {
      return mockAssetApi.getById(assetId);
    }
    try {
      const { data, error } = await supabase
        .from("project_assets")
        .select("*")
        .eq("id", assetId)
        .single();

      if (error) throw error;

      // Update last_accessed_at
      await supabase
        .from("project_assets")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("id", assetId);

      return data;
    } catch (error) {
      console.error("Failed to get asset:", error);
      return null;
    }
  },

  /**
   * Update asset metadata
   */
  async update(
    assetId: string,
    updates: Partial<ProjectAsset>
  ): Promise<ProjectAsset> {
    if (useMockAssets) {
      return mockAssetApi.update(assetId, updates);
    }
    try {
      const { data, error } = await supabase
        .from("project_assets")
        .update(updates)
        .eq("id", assetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to update asset:", error);
      throw error;
    }
  },

  /**
   * Delete asset (hard delete from storage and database)
   */
  async delete(assetId: string): Promise<void> {
    if (useMockAssets) {
      await mockAssetApi.delete(assetId);
      return;
    }
    try {
      // Get asset details
      const asset = await this.getById(assetId);
      if (!asset) throw new Error("Asset not found");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(asset.storage_bucket)
        .remove([asset.storage_path]);

      if (storageError) {
        console.error("Failed to delete from storage:", storageError);
      }

      // Delete thumbnail if exists
      if (asset.thumbnail_bucket && asset.thumbnail_path) {
        await supabase.storage
          .from(asset.thumbnail_bucket)
          .remove([asset.thumbnail_path]);
      }

      // Delete preview if exists
      if (asset.preview_bucket && asset.preview_path) {
        await supabase.storage
          .from(asset.preview_bucket)
          .remove([asset.preview_path]);
      }

      // Delete database record (cascades to usage records)
      const { error: dbError } = await supabase
        .from("project_assets")
        .delete()
        .eq("id", assetId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Failed to delete asset:", error);
      throw error;
    }
  },

  /**
   * Archive asset (soft delete)
   */
  async archive(assetId: string): Promise<ProjectAsset> {
    if (useMockAssets) {
      return mockAssetApi.archive(assetId);
    }
    return this.update(assetId, { is_archived: true });
  },

  /**
   * Restore archived asset
   */
  async restore(assetId: string): Promise<ProjectAsset> {
    if (useMockAssets) {
      return mockAssetApi.restore(assetId);
    }
    return this.update(assetId, { is_archived: false });
  },

  /**
   * Track asset usage
   */
  async trackUsage(
    assetId: string,
    usedInTable: string,
    usedInRecordId: string,
    usedInField?: string,
    metadata?: Record<string, any>
  ): Promise<AssetUsage> {
    if (useMockAssets) {
      return mockAssetApi.trackUsage();
    }
    try {
      const { data, error } = await supabase
        .from("asset_usage")
        .upsert(
          {
            asset_id: assetId,
            used_in_table: usedInTable,
            used_in_record_id: usedInRecordId,
            used_in_field: usedInField || null,
            usage_metadata: metadata || {},
          },
          {
            onConflict:
              "asset_id,used_in_table,used_in_record_id,used_in_field",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) throw error;

      const { data: assetData, error: assetError } = await supabase
        .from("project_assets")
        .select("usage_count")
        .eq("id", assetId)
        .single();

      if (assetError) throw assetError;

      return {
        ...data,
        usage_count: assetData?.usage_count,
      };
    } catch (error) {
      console.error("Failed to track usage:", error);
      throw error;
    }
  },

  /**
   * Remove asset usage tracking
   */
  async removeUsage(
    assetId: string,
    usedInTable: string,
    usedInRecordId: string,
    usedInField?: string
  ): Promise<void> {
    if (useMockAssets) {
      await mockAssetApi.removeUsage();
      return;
    }
    try {
      let query = supabase
        .from("asset_usage")
        .delete()
        .eq("asset_id", assetId)
        .eq("used_in_table", usedInTable)
        .eq("used_in_record_id", usedInRecordId);

      if (usedInField) {
        query = query.eq("used_in_field", usedInField);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error("Failed to remove usage:", error);
      throw error;
    }
  },

  /**
   * Get asset usage records
   */
  async getUsage(assetId: string): Promise<AssetUsage[]> {
    if (useMockAssets) {
      return mockAssetApi.getUsage();
    }
    try {
      const { data, error } = await supabase
        .from("asset_usage")
        .select("*")
        .eq("asset_id", assetId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get usage:", error);
      return [];
    }
  },

  /**
   * Get storage stats for user
   */
  async getStorageStats(userId?: string): Promise<AssetStats> {
    if (useMockAssets) {
      return mockAssetApi.getStorageStats();
    }
    try {
      let query = supabase
        .from("project_assets")
        .select("asset_type, file_size_bytes")
        .eq("is_archived", false);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats: AssetStats = {
        totalAssets: data.length,
        totalSizeBytes: data.reduce((sum, a) => sum + a.file_size_bytes, 0),
        byType: {},
      };

      data.forEach((asset) => {
        if (!stats.byType[asset.asset_type]) {
          stats.byType[asset.asset_type] = { count: 0, sizeBytes: 0 };
        }
        stats.byType[asset.asset_type].count++;
        stats.byType[asset.asset_type].sizeBytes += asset.file_size_bytes;
      });

      return stats;
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      throw error;
    }
  },

  /**
   * Convert file to base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  },

  /**
   * Get download URL for asset
   */
  async getDownloadUrl(assetId: string): Promise<string | null> {
    if (useMockAssets) {
      return mockAssetApi.getDownloadUrl(assetId);
    }
    try {
      const asset = await this.getById(assetId);
      if (!asset) return null;

      const { data } = await supabase.storage
        .from(asset.storage_bucket)
        .createSignedUrl(asset.storage_path, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error("Failed to get download URL:", error);
      return null;
    }
  },

  // Collection methods
  collections: {
    async create(
      collection: Omit<
        AssetCollection,
        "id" | "created_at" | "updated_at"
      >
    ): Promise<AssetCollection> {
      if (useMockAssets) {
        return mockAssetApi.collections.create(collection);
      }
      const { data, error } = await supabase
        .from("asset_collections")
        .insert(collection)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async list(projectId?: string): Promise<AssetCollection[]> {
      if (useMockAssets) {
        return mockAssetApi.collections.list(projectId);
      }
      let query = supabase.from("asset_collections").select("*");

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async update(
      collectionId: string,
      updates: Partial<AssetCollection>
    ): Promise<AssetCollection> {
      if (useMockAssets) {
        return mockAssetApi.collections.update(collectionId, updates);
      }
      const { data, error } = await supabase
        .from("asset_collections")
        .update(updates)
        .eq("id", collectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(collectionId: string): Promise<void> {
      if (useMockAssets) {
        await mockAssetApi.collections.delete(collectionId);
        return;
      }
      const { error } = await supabase
        .from("asset_collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;
    },

    async addAsset(collectionId: string, assetId: string): Promise<void> {
      if (useMockAssets) {
        await mockAssetApi.collections.addAsset(collectionId, assetId);
        return;
      }
      const { error } = await supabase
        .from("asset_collection_items")
        .insert({ collection_id: collectionId, asset_id: assetId });

      if (error) throw error;
    },

    async removeAsset(collectionId: string, assetId: string): Promise<void> {
      if (useMockAssets) {
        await mockAssetApi.collections.removeAsset(collectionId, assetId);
        return;
      }
      const { error } = await supabase
        .from("asset_collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("asset_id", assetId);

      if (error) throw error;
    },

    async getAssets(collectionId: string): Promise<ProjectAsset[]> {
      if (useMockAssets) {
        return mockAssetApi.collections.getAssets(collectionId);
      }
      const { data, error } = await supabase
        .from("asset_collection_items")
        .select("asset_id, project_assets(*)")
        .eq("collection_id", collectionId);

      if (error) throw error;

      // Extract assets from the joined query
      return (data || [])
        .map((item: any) => item.project_assets)
        .filter(Boolean);
    },
  },
};

// ============================================================================
// HOOKS: Asset Management with TanStack Query
// PURPOSE: React hooks for asset management with caching and state management
// ============================================================================

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { assetService } from "@/services/assetService";
import type { AssetFilters, AssetUploadRequest } from "@/types/assets";
import { toast } from "sonner";
import { MOCK_ASSET_EVENT_NAME } from "@/services/mockAssetApi";

export const ASSET_QUERY_KEYS = {
  all: ["assets"] as const,
  lists: () => [...ASSET_QUERY_KEYS.all, "list"] as const,
  list: (filters: AssetFilters) =>
    [...ASSET_QUERY_KEYS.lists(), filters] as const,
  detail: (id: string) => [...ASSET_QUERY_KEYS.all, "detail", id] as const,
  usage: (id: string) => [...ASSET_QUERY_KEYS.all, "usage", id] as const,
  stats: () => [...ASSET_QUERY_KEYS.all, "stats"] as const,
  collections: () => [...ASSET_QUERY_KEYS.all, "collections"] as const,
  collectionAssets: (id: string) =>
    [...ASSET_QUERY_KEYS.collections(), "assets", id] as const,
};

const useMockAssets =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_USE_MOCK_ASSETS === "true") ||
  (typeof process !== "undefined" && process.env?.VITE_USE_MOCK_ASSETS === "true");

/**
 * Hook to list assets with filters
 */
export function useAssets(filters: AssetFilters = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!useMockAssets || typeof window === "undefined") return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.list(filters) });
    };
    window.addEventListener(MOCK_ASSET_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(MOCK_ASSET_EVENT_NAME, handler);
    };
  }, [queryClient, filters]);

  return useQuery({
    queryKey: ASSET_QUERY_KEYS.list(filters),
    queryFn: () => assetService.list(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook for infinite scroll/pagination of assets
 */
export function useInfiniteAssets(filters: AssetFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...ASSET_QUERY_KEYS.lists(), "infinite", filters],
    queryFn: ({ pageParam = 0 }) =>
      assetService.list({ ...filters, offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length * 20 : undefined,
    initialPageParam: 0,
  });
}

/**
 * Hook to get single asset
 */
export function useAsset(assetId: string | undefined) {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.detail(assetId!),
    queryFn: () => assetService.getById(assetId!),
    enabled: !!assetId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to upload asset
 */
export function useAssetUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssetUploadRequest) => assetService.upload(request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Asset uploaded successfully", {
          description: `${data.asset?.original_file_name} has been uploaded`,
        });
        queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.stats() });
      } else {
        toast.error("Upload failed", {
          description: data.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Upload failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update asset
 */
export function useAssetUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      updates,
    }: {
      assetId: string;
      updates: Partial<any>;
    }) => assetService.update(assetId, updates),
    onSuccess: (data) => {
      toast.success("Asset updated");
      queryClient.invalidateQueries({
        queryKey: ASSET_QUERY_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.lists() });
    },
    onError: (error: Error) => {
      toast.error("Update failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete asset
 */
export function useAssetDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => assetService.delete(assetId),
    onSuccess: () => {
      toast.success("Asset deleted");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error("Delete failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to archive asset
 */
export function useAssetArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => assetService.archive(assetId),
    onSuccess: () => {
      toast.success("Asset archived");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.lists() });
    },
    onError: (error: Error) => {
      toast.error("Archive failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to restore archived asset
 */
export function useAssetRestore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => assetService.restore(assetId),
    onSuccess: () => {
      toast.success("Asset restored");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.lists() });
    },
    onError: (error: Error) => {
      toast.error("Restore failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to track asset usage
 */
export function useAssetUsageTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      usedInTable,
      usedInRecordId,
      usedInField,
      metadata,
    }: {
      assetId: string;
      usedInTable: string;
      usedInRecordId: string;
      usedInField?: string;
      metadata?: Record<string, any>;
    }) =>
      assetService.trackUsage(
        assetId,
        usedInTable,
        usedInRecordId,
        usedInField,
        metadata
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSET_QUERY_KEYS.usage(variables.assetId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSET_QUERY_KEYS.detail(variables.assetId),
      });
    },
  });
}

/**
 * Hook to get asset usage
 */
export function useAssetUsage(assetId: string | undefined) {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.usage(assetId!),
    queryFn: () => assetService.getUsage(assetId!),
    enabled: !!assetId,
  });
}

/**
 * Hook to get storage stats
 */
export function useStorageStats(userId?: string) {
  return useQuery({
    queryKey: [...ASSET_QUERY_KEYS.stats(), userId],
    queryFn: () => assetService.getStorageStats(userId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get download URL
 */
export function useAssetDownloadUrl(assetId: string | undefined) {
  return useQuery({
    queryKey: [...ASSET_QUERY_KEYS.detail(assetId!), "download-url"],
    queryFn: () => assetService.getDownloadUrl(assetId!),
    enabled: !!assetId,
    staleTime: 3600000, // 1 hour (matches signed URL expiry)
  });
}

/**
 * Hook to manage collections
 */
export function useCollections(projectId?: string) {
  return useQuery({
    queryKey: [...ASSET_QUERY_KEYS.collections(), projectId],
    queryFn: () => assetService.collections.list(projectId),
    staleTime: 30000,
  });
}

/**
 * Hook to create collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.collections.create,
    onSuccess: () => {
      toast.success("Collection created");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.collections() });
    },
    onError: (error: Error) => {
      toast.error("Failed to create collection", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to add asset to collection
 */
export function useAddAssetToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      assetId,
    }: {
      collectionId: string;
      assetId: string;
    }) => assetService.collections.addAsset(collectionId, assetId),
    onSuccess: () => {
      toast.success("Asset added to collection");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.collections() });
    },
    onError: (error: Error) => {
      toast.error("Failed to add asset", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to remove asset from collection
 */
export function useRemoveAssetFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      assetId,
    }: {
      collectionId: string;
      assetId: string;
    }) => assetService.collections.removeAsset(collectionId, assetId),
    onSuccess: () => {
      toast.success("Asset removed from collection");
      queryClient.invalidateQueries({ queryKey: ASSET_QUERY_KEYS.collections() });
    },
    onError: (error: Error) => {
      toast.error("Failed to remove asset", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to get collection assets
 */
export function useCollectionAssets(collectionId: string | undefined) {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.collectionAssets(collectionId!),
    queryFn: () => assetService.collections.getAssets(collectionId!),
    enabled: !!collectionId,
  });
}

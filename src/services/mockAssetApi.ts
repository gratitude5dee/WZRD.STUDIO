import { v4 as uuidv4 } from "uuid";
import type {
  ProjectAsset,
  AssetUploadRequest,
  AssetUploadResponse,
  AssetFilters,
  AssetUsage,
  AssetCollection,
  AssetStats,
} from "@/types/assets";

const MOCK_THUMBNAIL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
const MOCK_PREVIEW =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAIElEQVR4nGNgGAWjYBSMglEwCkbBqBgFo2AUjIJRMAAAHQgCko8n94AAAAASUVORK5CYII=";

const EVENT_NAME = "mock-assets-updated";

type CollectionItem = {
  collection_id: string;
  asset_id: string;
};

const now = () => new Date().toISOString();

const baseAsset = (overrides: Partial<ProjectAsset>): ProjectAsset => ({
  id: uuidv4(),
  user_id: "mock-user",
  project_id: "demo-project",
  file_name: "mock-file",
  original_file_name: "mock-file",
  mime_type: "image/png",
  file_size_bytes: 1024,
  asset_type: "image",
  asset_category: "upload",
  storage_provider: "mock-storage",
  storage_bucket: "mock-bucket",
  storage_path: "mock/path",
  cdn_url: MOCK_PREVIEW,
  media_metadata: {},
  processing_status: "completed",
  processing_error: null,
  thumbnail_bucket: null,
  thumbnail_path: null,
  thumbnail_url: MOCK_THUMBNAIL,
  preview_bucket: null,
  preview_path: null,
  preview_url: MOCK_PREVIEW,
  used_in_pages: [],
  usage_count: 0,
  visibility: "project",
  is_archived: false,
  created_at: now(),
  updated_at: now(),
  last_accessed_at: now(),
  ...overrides,
});

const assets: ProjectAsset[] = [
  baseAsset({
    id: "mock-image",
    original_file_name: "hero.png",
    file_name: "hero.png",
    asset_type: "image",
    cdn_url: MOCK_PREVIEW,
  }),
  baseAsset({
    id: "mock-video",
    original_file_name: "intro.mp4",
    file_name: "intro.mp4",
    asset_type: "video",
    mime_type: "video/mp4",
  }),
];

const collections: AssetCollection[] = [];
const collectionItems: CollectionItem[] = [];

const dispatchUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
};

const matchesFilters = (asset: ProjectAsset, filters: AssetFilters) => {
  if (!filters.includeArchived && !filters.onlyArchived && asset.is_archived) return false;
  if (filters.onlyArchived && !asset.is_archived) return false;
  if (filters.assetType && filters.assetType.length > 0 && !filters.assetType.includes(asset.asset_type)) {
    return false;
  }
  if (
    filters.assetCategory &&
    filters.assetCategory.length > 0 &&
    !filters.assetCategory.includes(asset.asset_category)
  ) {
    return false;
  }
  if (filters.visibility && filters.visibility.length > 0 && !filters.visibility.includes(asset.visibility)) {
    return false;
  }
  if (
    filters.processingStatus &&
    filters.processingStatus.length > 0 &&
    !filters.processingStatus.includes(asset.processing_status)
  ) {
    return false;
  }
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    if (
      !asset.original_file_name.toLowerCase().includes(query) &&
      !asset.file_name.toLowerCase().includes(query)
    ) {
      return false;
    }
  }
  return true;
};

const sortAssets = (list: ProjectAsset[], filters: AssetFilters) => {
  const sortBy = filters.sortBy || "created_at";
  const sortOrder = filters.sortOrder || "desc";
  return [...list].sort((a, b) => {
    const aValue = (a as any)[sortBy];
    const bValue = (b as any)[sortBy];
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

const paginate = (list: ProjectAsset[], filters: AssetFilters) => {
  if (!filters.limit) return list;
  const start = filters.offset || 0;
  return list.slice(start, start + filters.limit);
};

const createAssetFromUpload = (request: AssetUploadRequest): ProjectAsset => {
  const extension = request.file.name.split(".").pop() || "bin";
  return baseAsset({
    id: uuidv4(),
    project_id: request.projectId || "demo-project",
    original_file_name: request.file.name,
    file_name: request.file.name,
    mime_type: request.file.type,
    file_size_bytes: request.file.size,
    asset_type: request.assetType,
    asset_category: request.assetCategory,
    visibility: request.visibility,
    storage_path: `${Date.now()}-${request.file.name}`,
    processing_status: "processing",
    cdn_url: extension === "png" ? MOCK_PREVIEW : null,
    thumbnail_url: extension === "png" ? MOCK_THUMBNAIL : null,
  });
};

const mockAssetApi = {
  EVENT_NAME,
  async upload(request: AssetUploadRequest): Promise<AssetUploadResponse> {
    const asset = createAssetFromUpload(request);
    assets.unshift(asset);
    dispatchUpdate();

    setTimeout(() => {
      const target = assets.find((a) => a.id === asset.id);
      if (target) {
        target.processing_status = "completed";
        target.thumbnail_url = target.thumbnail_url || MOCK_THUMBNAIL;
        target.preview_url = target.preview_url || MOCK_PREVIEW;
        target.cdn_url = target.cdn_url || MOCK_PREVIEW;
        target.updated_at = now();
        dispatchUpdate();
      }
    }, 250);

    return {
      success: true,
      assetId: asset.id,
      asset,
    };
  },

  async list(filters: AssetFilters = {}): Promise<ProjectAsset[]> {
    const filtered = assets.filter((asset) => matchesFilters(asset, filters));
    const sorted = sortAssets(filtered, filters);
    return paginate(sorted, filters);
  },

  async getById(assetId: string): Promise<ProjectAsset | null> {
    return assets.find((asset) => asset.id === assetId) || null;
  },

  async update(assetId: string, updates: Partial<ProjectAsset>): Promise<ProjectAsset> {
    const index = assets.findIndex((asset) => asset.id === assetId);
    if (index === -1) throw new Error("Asset not found");
    assets[index] = { ...assets[index], ...updates, updated_at: now() };
    dispatchUpdate();
    return assets[index];
  },

  async delete(assetId: string): Promise<void> {
    const index = assets.findIndex((asset) => asset.id === assetId);
    if (index === -1) throw new Error("Asset not found");
    assets.splice(index, 1);
    dispatchUpdate();
  },

  async archive(assetId: string): Promise<ProjectAsset> {
    return this.update(assetId, { is_archived: true });
  },

  async restore(assetId: string): Promise<ProjectAsset> {
    return this.update(assetId, { is_archived: false });
  },

  async trackUsage(): Promise<AssetUsage> {
    return {
      id: uuidv4(),
      asset_id: "mock",
      used_in_table: "mock",
      used_in_record_id: "mock",
      used_in_field: null,
      usage_metadata: {},
      created_at: now(),
    };
  },

  async removeUsage(): Promise<void> {
    return;
  },

  async getUsage(): Promise<AssetUsage[]> {
    return [];
  },

  async getStorageStats(): Promise<AssetStats> {
    return {
      totalAssets: assets.length,
      totalSizeBytes: assets.reduce((sum, asset) => sum + asset.file_size_bytes, 0),
      byType: assets.reduce<Record<string, { count: number; sizeBytes: number }>>((acc, asset) => {
        if (!acc[asset.asset_type]) {
          acc[asset.asset_type] = { count: 0, sizeBytes: 0 };
        }
        acc[asset.asset_type].count += 1;
        acc[asset.asset_type].sizeBytes += asset.file_size_bytes;
        return acc;
      }, {}),
    };
  },

  async getDownloadUrl(assetId: string): Promise<string | null> {
    const asset = await this.getById(assetId);
    return asset?.cdn_url || null;
  },

  collections: {
    async create(collection: Omit<AssetCollection, "id" | "created_at" | "updated_at">) {
      const newCollection: AssetCollection = {
        ...collection,
        id: uuidv4(),
        created_at: now(),
        updated_at: now(),
      };
      collections.push(newCollection);
      return newCollection;
    },

    async list(projectId?: string) {
      return projectId
        ? collections.filter((collection) => collection.project_id === projectId)
        : [...collections];
    },

    async update(collectionId: string, updates: Partial<AssetCollection>) {
      const index = collections.findIndex((collection) => collection.id === collectionId);
      if (index === -1) throw new Error("Collection not found");
      collections[index] = { ...collections[index], ...updates, updated_at: now() };
      return collections[index];
    },

    async delete(collectionId: string) {
      const index = collections.findIndex((collection) => collection.id === collectionId);
      if (index === -1) return;
      collections.splice(index, 1);
    },

    async addAsset(collectionId: string, assetId: string) {
      collectionItems.push({ collection_id: collectionId, asset_id: assetId });
    },

    async removeAsset(collectionId: string, assetId: string) {
      const index = collectionItems.findIndex(
        (item) => item.collection_id === collectionId && item.asset_id === assetId
      );
      if (index >= 0) {
        collectionItems.splice(index, 1);
      }
    },

    async getAssets(collectionId: string) {
      const ids = collectionItems
        .filter((item) => item.collection_id === collectionId)
        .map((item) => item.asset_id);
      return assets.filter((asset) => ids.includes(asset.id));
    },
  },
};

export type MockAssetApi = typeof mockAssetApi;
export { mockAssetApi };
export const MOCK_ASSET_EVENT_NAME = EVENT_NAME;

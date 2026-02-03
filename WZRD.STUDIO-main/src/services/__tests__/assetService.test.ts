import { describe, it, expect, beforeEach, vi } from "vitest";
import { assetService } from "../assetService";
import type { AssetUploadRequest, ProjectAsset } from "@/types/assets";

const mockInvoke = vi.fn();
const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    storage: {
      from: (...args: any[]) => mockStorageFrom(...args),
    },
  },
}));

const createListQuery = (data: ProjectAsset[]) => {
  const state: any = {
    eq: [],
    in: [],
    or: null,
    gte: [],
    lte: [],
    order: null,
    limit: null,
    range: null,
  };
  const builder: any = {
    __state: state,
    select: vi.fn(() => builder),
    eq: vi.fn((column: string, value: any) => {
      state.eq.push([column, value]);
      return builder;
    }),
    in: vi.fn((column: string, value: any[]) => {
      state.in.push([column, value]);
      return builder;
    }),
    or: vi.fn((value: string) => {
      state.or = value;
      return builder;
    }),
    gte: vi.fn((column: string, value: string) => {
      state.gte.push([column, value]);
      return builder;
    }),
    lte: vi.fn((column: string, value: string) => {
      state.lte.push([column, value]);
      return builder;
    }),
    order: vi.fn((column: string, options: any) => {
      state.order = [column, options];
      return builder;
    }),
    limit: vi.fn((value: number) => {
      state.limit = value;
      return builder;
    }),
    range: vi.fn((from: number, to: number) => {
      state.range = [from, to];
      return builder;
    }),
    then: vi.fn((resolve: any) => resolve({ data, error: null })),
  };
  return builder;
};

const createSingleQuery = (asset: ProjectAsset | null) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: asset, error: null })),
    })),
  })),
});

const createUpdateWithSelectBuilder = (asset: ProjectAsset) => ({
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: asset, error: null })),
      })),
    })),
  })),
});

const createSimpleUpdateBuilder = () => ({
  update: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
});

const createDeleteBuilder = () => {
  const eq = vi.fn(() => Promise.resolve({ error: null }));
  return {
    delete: vi.fn(() => ({ eq })),
    __eq: eq,
  };
};

const baseAsset: ProjectAsset = {
  id: "asset-1",
  user_id: "user-1",
  project_id: "project-123",
  file_name: "hero.png",
  original_file_name: "hero.png",
  mime_type: "image/png",
  file_size_bytes: 1024,
  asset_type: "image",
  asset_category: "upload",
  storage_provider: "supabase",
  storage_bucket: "assets",
  storage_path: "hero.png",
  cdn_url: "https://cdn.example.com/hero.png",
  media_metadata: {},
  processing_status: "completed",
  processing_error: null,
  thumbnail_bucket: "thumbs",
  thumbnail_path: "hero-thumb.png",
  thumbnail_url: "https://cdn.example.com/hero-thumb.png",
  preview_bucket: "previews",
  preview_path: "hero-preview.png",
  preview_url: "https://cdn.example.com/hero-preview.png",
  used_in_pages: [],
  usage_count: 0,
  visibility: "project",
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_accessed_at: new Date().toISOString(),
};

describe("assetService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("upload", () => {
    it("uploads assets successfully", async () => {
      const request: AssetUploadRequest = {
        projectId: "project-123",
        assetType: "image",
        assetCategory: "upload",
        visibility: "project",
        file: {
          name: "hero.png",
          type: "image/png",
          size: 1024,
          base64: "ZmFrZQ==",
        },
      };

      const response = { success: true, assetId: "asset-1" };
      mockInvoke.mockResolvedValue({ data: response, error: null });

      const result = await assetService.upload(request);
      expect(result).toEqual(response);
      expect(mockInvoke).toHaveBeenCalledWith("asset-upload", { body: request });
    });

    it("throws when the Supabase function fails", async () => {
      mockInvoke.mockResolvedValue({ data: null, error: new Error("upload failed") });

      await expect(
        assetService.upload({
          projectId: "project-123",
          assetType: "image",
          assetCategory: "upload",
          visibility: "project",
          file: {
            name: "hero.png",
            type: "image/png",
            size: 1024,
            base64: "ZmFrZQ==",
          },
        })
      ).rejects.toThrow("upload failed");
    });
  });

  describe("list", () => {
    it("applies filters and ordering", async () => {
      const builder = createListQuery([baseAsset]);
      mockFrom.mockReturnValue(builder);

      const filters = {
        projectId: "project-123",
        assetType: ["image", "video"] as ("image" | "video")[],
        assetCategory: ["upload"] as ("upload")[],
        visibility: ["project"] as ("project")[],
        processingStatus: ["completed"] as ("completed")[],
        searchQuery: "hero",
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
        sortBy: "created_at" as const,
        sortOrder: "asc" as const,
        limit: 10,
        offset: 5,
      };

      const result = await assetService.list(filters);
      expect(result).toEqual([baseAsset]);

      expect(builder.__state.eq).toContainEqual(["project_id", "project-123"]);
      expect(builder.__state.in).toContainEqual(["asset_type", ["image", "video"]]);
      expect(builder.__state.in).toContainEqual(["asset_category", ["upload"]]);
      expect(builder.__state.in).toContainEqual(["visibility", ["project"]]);
      expect(builder.__state.in).toContainEqual(["processing_status", ["completed"]]);
      expect(builder.__state.or).toContain("hero");
      expect(builder.__state.gte).toContainEqual(["created_at", "2024-01-01"]);
      expect(builder.__state.lte).toContainEqual(["created_at", "2024-12-31"]);
      expect(builder.__state.order).toEqual([
        "created_at",
        { ascending: true },
      ]);
      expect(builder.__state.limit).toBe(10);
      expect(builder.__state.range).toEqual([5, 14]);
    });
  });

  describe("delete", () => {
    it("removes the asset record and storage artifacts", async () => {
      const deleteBuilder = createDeleteBuilder();
      const storageCalls: Record<string, ReturnType<typeof vi.fn>> = {};
      mockFrom
        .mockImplementationOnce(() => createSingleQuery(baseAsset))
        .mockImplementationOnce(() => createSimpleUpdateBuilder())
        .mockImplementationOnce(() => deleteBuilder);

      mockStorageFrom.mockImplementation((bucket: string) => {
        if (!storageCalls[bucket]) {
          storageCalls[bucket] = vi.fn().mockResolvedValue({ error: null });
        }
        return {
          remove: storageCalls[bucket],
        };
      });

      await assetService.delete(baseAsset.id);

      expect(storageCalls[baseAsset.storage_bucket]).toHaveBeenCalledWith([baseAsset.storage_path]);
      expect(storageCalls[baseAsset.thumbnail_bucket!]).toHaveBeenCalledWith([
        baseAsset.thumbnail_path,
      ]);
      expect(storageCalls[baseAsset.preview_bucket!]).toHaveBeenCalledWith([
        baseAsset.preview_path,
      ]);
      expect(deleteBuilder.__eq).toHaveBeenCalledWith("id", baseAsset.id);
    });
  });
});

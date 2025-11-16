import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AssetLibrary } from "../AssetLibrary";
import type { ProjectAsset, AssetFilters } from "@/types/assets";

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
  thumbnail_bucket: null,
  thumbnail_path: null,
  thumbnail_url: null,
  preview_bucket: null,
  preview_path: null,
  preview_url: null,
  used_in_pages: [],
  usage_count: 0,
  visibility: "project",
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_accessed_at: new Date().toISOString(),
};

const archivedAsset: ProjectAsset = {
  ...baseAsset,
  id: "asset-archived",
  original_file_name: "archived.png",
  is_archived: true,
};

const mockUseAssets = vi.fn((filters: AssetFilters = {}) => ({
  data: filters.onlyArchived ? [archivedAsset] : [baseAsset],
  isLoading: false,
}));
const deleteMutation = vi.fn();
const archiveMutation = vi.fn();
const restoreMutation = vi.fn();

vi.mock("@/hooks/useAssets", () => ({
  useAssets: (filters: AssetFilters) => mockUseAssets(filters),
  useAssetDelete: () => ({ mutateAsync: deleteMutation }),
  useAssetArchive: () => ({ mutateAsync: archiveMutation }),
  useAssetRestore: () => ({ mutateAsync: restoreMutation }),
  useAssetDownloadUrl: () => ({ data: "https://cdn.example.com/file" }),
}));

describe("AssetLibrary", () => {
  beforeEach(() => {
    mockUseAssets.mockClear();
    deleteMutation.mockReset();
    archiveMutation.mockReset();
    restoreMutation.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("propagates search terms to the data hook", async () => {
    render(<AssetLibrary projectId="project-123" />);

    fireEvent.change(screen.getByTestId("asset-search-input"), {
      target: { value: "hero" },
    });

    await waitFor(() => {
      expect(
        mockUseAssets.mock.calls.some(([filters]) => filters?.searchQuery === "hero")
      ).toBe(true);
    });
  });

  it("confirms before deleting assets", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AssetLibrary projectId="project-123" />);

    const card = await screen.findByTestId("asset-card-asset-1");
    fireEvent.click(within(card).getByTestId("asset-action-menu"));
    const deleteButton = await screen.findByTestId("asset-action-delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteMutation).toHaveBeenCalledWith("asset-1");
    });

    confirmSpy.mockRestore();
  });

  it("restores archived assets from the archive tab", async () => {
    render(<AssetLibrary projectId="project-123" />);

    fireEvent.click(screen.getByTestId("asset-tab-archived"));

    const archivedCard = await screen.findByTestId("asset-card-asset-archived");
    fireEvent.click(within(archivedCard).getByTestId("asset-action-menu"));

    const restoreButton = await screen.findByTestId("asset-action-restore");
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(restoreMutation).toHaveBeenCalledWith("asset-archived");
    });
  });
});

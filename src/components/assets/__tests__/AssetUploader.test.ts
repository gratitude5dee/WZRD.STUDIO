import { describe, it, expect, beforeEach, vi } from "vitest";
import { uploadDroppedFiles } from "../AssetUploader";
import { assetService } from "@/services/assetService";
import type { AssetType, AssetCategory, AssetVisibility } from "@/types/assets";

vi.mock("@/services/assetService", () => ({
  assetService: {
    fileToBase64: vi.fn(),
  },
}));

const baseContext = {
  projectId: "project-123",
  assetType: "image" as AssetType,
  assetCategory: "upload" as AssetCategory,
  visibility: "private" as AssetVisibility,
};

describe("uploadDroppedFiles", () => {
  beforeEach(() => {
    vi.mocked(assetService.fileToBase64).mockReset();
  });

  it("converts dropped files to base64 before invoking the edge function", async () => {
    const callOrder: string[] = [];
    vi.mocked(assetService.fileToBase64).mockImplementation(async () => {
      callOrder.push("fileToBase64");
      return "mock-base64";
    });

    const uploadFn = vi.fn().mockImplementation(async () => {
      callOrder.push("edge");
      return { success: true, assetId: "asset-1" };
    });

    const file = new File(["content"], "image.png", { type: "image/png" });

    const result = await uploadDroppedFiles([file], {
      ...baseContext,
      uploadFn,
    });

    expect(result).toEqual(["asset-1"]);
    expect(callOrder).toEqual(["fileToBase64", "edge"]);
  });

  it("forwards the converted payload to the upload function", async () => {
    vi.mocked(assetService.fileToBase64).mockResolvedValue("converted-value");
    const uploadFn = vi.fn().mockResolvedValue({ success: true, assetId: "asset-2" });
    const file = new File(["another"], "doc.txt", { type: "text/plain" });

    await uploadDroppedFiles([file], {
      ...baseContext,
      uploadFn,
    });

    expect(uploadFn).toHaveBeenCalledWith({
      projectId: baseContext.projectId,
      assetType: baseContext.assetType,
      assetCategory: baseContext.assetCategory,
      visibility: baseContext.visibility,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        base64: "converted-value",
      },
    });
  });

  it("reports progress updates for dragged files", async () => {
    vi.mocked(assetService.fileToBase64).mockResolvedValue("converted-value");
    const uploadFn = vi.fn().mockResolvedValue({ success: true, assetId: "asset-3" });
    const onProgress = vi.fn();
    const file = new File(["progress"], "clip.mp4", { type: "video/mp4" });

    await uploadDroppedFiles([file], {
      ...baseContext,
      uploadFn,
      onProgress,
    });

    expect(onProgress).toHaveBeenNthCalledWith(1, file.name, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, file.name, 50);
    expect(onProgress).toHaveBeenNthCalledWith(3, file.name, 100);
  });
});

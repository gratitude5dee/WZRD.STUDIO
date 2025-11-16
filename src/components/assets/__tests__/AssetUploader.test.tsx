import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetUploader } from "../AssetUploader";

const mutateAsync = vi.fn();
const fileToBase64 = vi.fn();

vi.mock("@/hooks/useAssets", () => ({
  useAssetUpload: () => ({ mutateAsync }),
}));

vi.mock("@/services/assetService", () => ({
  assetService: {
    fileToBase64: (...args: any[]) => fileToBase64(...args),
  },
}));

describe("AssetUploader", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    fileToBase64.mockReset();
  });

  it("uploads files and emits completion", async () => {
    fileToBase64.mockResolvedValue("ZmFrZQ==");
    mutateAsync.mockResolvedValue({ success: true, assetId: "asset-1" });
    const handleComplete = vi.fn();

    render(<AssetUploader projectId="project-123" onUploadComplete={handleComplete} />);

    const input = screen.getByTestId("asset-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "hero.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getAllByTestId("asset-uploader-file-row")).toHaveLength(1);

    fireEvent.click(screen.getByTestId("asset-upload-button"));

    await waitFor(() => expect(handleComplete).toHaveBeenCalledWith(["asset-1"]));
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project-123",
        file: expect.objectContaining({ name: "hero.png" }),
      })
    );
  });

  it("surfaces errors when uploads fail", async () => {
    fileToBase64.mockResolvedValue("ZmFrZQ==");
    mutateAsync.mockRejectedValue(new Error("upload failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<AssetUploader projectId="project-123" />);

    const input = screen.getByTestId("asset-uploader-input") as HTMLInputElement;
    const file = new File(["oops"], "hero.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByTestId("asset-upload-button"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(mutateAsync).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("updates the progress indicator as files move through the pipeline", async () => {
    fileToBase64.mockResolvedValue("ZmFrZQ==");
    mutateAsync.mockResolvedValue({ success: true, assetId: "asset-1" });

    render(<AssetUploader projectId="project-123" />);

    const input = screen.getByTestId("asset-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "hero.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByTestId("asset-upload-button"));

    await waitFor(() => {
      expect(screen.getByTestId("asset-upload-progress")).toHaveTextContent("100%");
    });
  });
});

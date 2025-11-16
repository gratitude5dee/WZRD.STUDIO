import { AssetUploader, AssetLibrary } from "@/components/assets";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AssetsPage = () => {
  return (
    <div className="space-y-8 p-6" data-testid="asset-management-page">
      <div>
        <h1 className="text-2xl font-semibold">Asset Management</h1>
        <p className="text-muted-foreground">
          Upload, preview, archive, and restore assets without leaving the browser.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Upload Assets</h2>
        <AssetUploader projectId="demo-project" visibility="project" />
      </Card>

      <Separator />

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">Library</h2>
            <p className="text-sm text-muted-foreground">
              Use the tabs to filter formats or view archived items.
            </p>
          </div>
        </div>
        <AssetLibrary projectId="demo-project" selectable multiSelect />
      </Card>
    </div>
  );
};

export default AssetsPage;

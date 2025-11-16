// ============================================================================
// COMPONENT: AssetLibrary
// PURPOSE: Display and manage asset library with filtering and search
// ============================================================================

import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  MoreVertical,
  Trash2,
  Download,
  Archive,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssets,
  useAssetDelete,
  useAssetArchive,
  useAssetRestore,
  useAssetDownloadUrl,
} from "@/hooks/useAssets";
import type { ProjectAsset, AssetType, AssetFilters } from "@/types/assets";
import { cn } from "@/lib/utils";

interface AssetLibraryProps {
  projectId?: string;
  selectable?: boolean;
  multiSelect?: boolean;
  onSelect?: (assets: ProjectAsset[]) => void;
  defaultFilters?: AssetFilters;
  className?: string;
}

const ASSET_TYPE_ICONS: Record<AssetType, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  model: FileText,
  font: FileText,
  other: FileText,
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  projectId,
  selectable = false,
  multiSelect = false,
  onSelect,
  defaultFilters = {},
  className,
}) => {
  const [filters, setFilters] = useState<AssetFilters>(() => ({
    projectId,
    includeArchived: defaultFilters.includeArchived ?? false,
    onlyArchived: defaultFilters.onlyArchived ?? false,
    ...defaultFilters,
  }));
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<AssetType | "all" | "archived">(
    defaultFilters.onlyArchived ? "archived" : "all"
  );

  const { data: assets, isLoading } = useAssets(filters);
  const deleteMutation = useAssetDelete();
  const archiveMutation = useAssetArchive();
  const restoreMutation = useAssetRestore();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, projectId }));
  }, [projectId]);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as AssetType | "all" | "archived");
    if (tab === "all") {
      setFilters((prev) => ({
        ...prev,
        assetType: undefined,
        onlyArchived: false,
        includeArchived: false,
      }));
    } else if (tab === "archived") {
      setFilters((prev) => ({
        ...prev,
        assetType: undefined,
        onlyArchived: true,
        includeArchived: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        assetType: [tab as AssetType],
        onlyArchived: false,
        includeArchived: false,
      }));
    }
  };

  const toggleAssetSelection = (asset: ProjectAsset) => {
    if (!selectable) return;

    setSelectedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(asset.id)) {
        newSet.delete(asset.id);
      } else {
        if (!multiSelect) {
          newSet.clear();
        }
        newSet.add(asset.id);
      }
      return newSet;
    });

    if (onSelect && assets) {
      const selected = assets.filter((a) => selectedAssets.has(a.id) || a.id === asset.id);
      onSelect(selected);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      await deleteMutation.mutateAsync(assetId);
    }
  };

  const handleArchive = async (assetId: string) => {
    await archiveMutation.mutateAsync(assetId);
  };

  const handleRestore = async (assetId: string) => {
    await restoreMutation.mutateAsync(assetId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="asset-library">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Search assets..."
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
          data-testid="asset-search-input"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all" data-testid="asset-tab-all">
            All
          </TabsTrigger>
          <TabsTrigger value="image" data-testid="asset-tab-image">
            Images
          </TabsTrigger>
          <TabsTrigger value="video" data-testid="asset-tab-video">
            Videos
          </TabsTrigger>
          <TabsTrigger value="audio" data-testid="asset-tab-audio">
            Audio
          </TabsTrigger>
          <TabsTrigger value="document" data-testid="asset-tab-document">
            Documents
          </TabsTrigger>
          <TabsTrigger value="archived" data-testid="asset-tab-archived">
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !assets || assets.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No assets found</p>
            </Card>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              data-testid="asset-grid"
            >
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssets.has(asset.id)}
                  onSelect={() => toggleAssetSelection(asset)}
                  onDelete={() => handleDelete(asset.id)}
                  onArchive={() => handleArchive(asset.id)}
                  onRestore={() => handleRestore(asset.id)}
                  selectable={selectable}
                  isArchived={asset.is_archived}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AssetCardProps {
  asset: ProjectAsset;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
  selectable: boolean;
  isArchived: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onDelete,
  onArchive,
  onRestore,
  selectable,
  isArchived,
}) => {
  const Icon = ASSET_TYPE_ICONS[asset.asset_type];
  const { data: downloadUrl } = useAssetDownloadUrl(asset.id);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = asset.original_file_name;
      a.click();
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        selectable && "cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={selectable ? onSelect : undefined}
      data-testid={`asset-card-${asset.id}`}
    >
      {/* Preview */}
      <div className="aspect-square bg-muted relative">
        {asset.asset_type === "image" && asset.cdn_url ? (
          <img
            src={asset.thumbnail_url || asset.cdn_url}
            alt={asset.original_file_name}
            className="w-full h-full object-cover"
            data-testid="asset-card-thumbnail"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Processing Status */}
        {asset.processing_status === "processing" && (
          <div
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            data-testid="asset-processing-overlay"
          >
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-6 h-6 text-primary fill-primary-foreground" />
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                data-testid="asset-action-menu"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              {!isArchived ? (
                <DropdownMenuItem onClick={onArchive} data-testid="asset-action-archive">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onRestore} data-testid="asset-action-restore">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
                data-testid="asset-action-delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium truncate" title={asset.original_file_name}>
          {asset.original_file_name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="secondary" className="text-xs" data-testid="asset-type-badge">
            {isArchived ? "archived" : asset.asset_type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(asset.file_size_bytes)}
          </span>
        </div>
      </div>
    </Card>
  );
};

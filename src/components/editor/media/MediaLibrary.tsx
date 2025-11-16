import { AssetLibrary, AssetUploader } from '@/components/assets';
import type { AssetType, ProjectAsset } from '@/types/assets';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface MediaLibraryProps {
  projectId?: string;
}

const ACCEPTED_MEDIA_FILE_TYPES = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp4',
  '.mov',
  '.webm',
  '.avi',
  '.mp3',
  '.wav',
  '.ogg',
];

const detectAssetTypeFromFile = (file: File): AssetType => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'document';
  return 'other';
};

export default function MediaLibrary({ projectId }: MediaLibraryProps) {
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);

  const addAssetToTimeline = (asset: ProjectAsset) => {
    const url = asset.cdn_url || asset.preview_url || asset.thumbnail_url;
    if (!url) {
      toast.error('Asset is still processing. Try again in a moment.');
      return;
    }

    const durationMs = asset.media_metadata?.duration_ms
      ?? (asset.asset_type === 'image' ? 5000 : 5000);

    if (asset.asset_type === 'audio') {
      const nextTrackIndex = audioTracks.length
        ? Math.max(...audioTracks.map((track) => track.trackIndex ?? 0)) + 1
        : 0;
      addAudioTrack({
        id: uuidv4(),
        mediaItemId: asset.id,
        type: 'audio',
        name: asset.original_file_name,
        url,
        startTime: 0,
        duration: durationMs,
        endTime: durationMs,
        volume: 1,
        isMuted: false,
        trackIndex: nextTrackIndex,
      });
      toast.success('Audio asset added to the timeline.');
      return;
    }

    if (asset.asset_type === 'image' || asset.asset_type === 'video') {
      const layer = clips.length
        ? Math.max(...clips.map((clip) => clip.layer ?? 0)) + 1
        : 0;
      addClip({
        id: uuidv4(),
        mediaItemId: asset.id,
        type: asset.asset_type === 'image' ? 'image' : 'video',
        name: asset.original_file_name,
        url,
        startTime: 0,
        duration: durationMs,
        layer,
        transforms: {
          position: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          rotation: 0,
          opacity: 1,
        },
      });
      toast.success('Asset added to the timeline.');
      return;
    }

    toast.info('Only image, video, or audio assets can be added to the timeline right now.');
  };

  const handleAssetSelection = (assets: ProjectAsset[]) => {
    const selected = assets[assets.length - 1];
    if (!selected) return;
    addAssetToTimeline(selected);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white">
      <div className="border-b border-[#2a2a2a] px-6 py-4">
        <h2 className="text-lg font-semibold">Media Library</h2>
        <p className="text-xs text-[#9ca3af]">
          Upload once and reuse assets across Studio, Editor, and Kanvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {projectId ? (
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="space-y-4">
              <AssetUploader
                projectId={projectId}
                assetType="image"
                label="Media"
                visibility="project"
                assetCategory="upload"
                maxFiles={25}
                maxSize={500 * 1024 * 1024}
                acceptedFileTypes={ACCEPTED_MEDIA_FILE_TYPES}
                getAssetTypeForFile={detectAssetTypeFromFile}
              />
              <p className="text-xs text-[#9ca3af]">
                Supported formats: images, videos, and audio. Uploads become instantly available below.
              </p>
            </div>

            <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl p-4">
              <AssetLibrary
                projectId={projectId}
                selectable
                onSelect={handleAssetSelection}
                className="max-h-[70vh] overflow-y-auto"
              />
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-[#9ca3af]">
            Select or create a project to start uploading media.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * FinalExportPanel - UI for saving timeline to final assets and creating final video
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Save,
  Download,
  Loader2,
  Play,
  Sparkles,
  Music,
  Mic,
  Volume2,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useFinalProjectAssets, FinalProjectAsset } from '@/hooks/useFinalProjectAssets';
import { useVideoEditorStore } from '@/store/videoEditorStore';

interface FinalExportPanelProps {
  className?: string;
  onGenerateAllVideos?: () => Promise<void>;
  isGeneratingVideos?: boolean;
}

const AssetTypeIcon = ({ type, subtype }: { type: string; subtype?: string }) => {
  if (type === 'audio') {
    if (subtype === 'voiceover') return <Mic className="h-3.5 w-3.5 text-cyan-400" />;
    if (subtype === 'sfx') return <Volume2 className="h-3.5 w-3.5 text-amber-400" />;
    return <Music className="h-3.5 w-3.5 text-pink-400" />;
  }
  if (type === 'video') return <Film className="h-3.5 w-3.5 text-violet-400" />;
  return <Sparkles className="h-3.5 w-3.5 text-emerald-400" />;
};

export function FinalExportPanel({
  className,
  onGenerateAllVideos,
  isGeneratingVideos = false,
}: FinalExportPanelProps) {
  const { projectId } = useParams<{ projectId?: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeVoiceover, setIncludeVoiceover] = useState(true);
  const [includeSfx, setIncludeSfx] = useState(true);
  const [includeMusic, setIncludeMusic] = useState(true);

  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);

  const {
    assets,
    isLoading,
    isSaving,
    isExporting,
    exportProgress,
    loadAssets,
    saveTimelineToFinal,
    removeAsset,
    createFinalAsset,
  } = useFinalProjectAssets(projectId);

  // Calculate timeline stats
  const stats = useMemo(() => {
    const totalVisuals = clips.length;
    const totalAudio = audioTracks.length;
    const totalDuration = clips.reduce((acc, clip) => acc + (clip.duration || 0), 0);

    return {
      totalVisuals,
      totalAudio,
      totalDuration: Math.round(totalDuration / 1000),
      totalAssets: assets.length,
    };
  }, [clips, audioTracks, assets]);

  // Group assets by type
  const groupedAssets = useMemo(() => {
    const groups: Record<string, FinalProjectAsset[]> = {
      visuals: [],
      voiceover: [],
      sfx: [],
      music: [],
    };

    assets.forEach((asset) => {
      if (asset.asset_type === 'audio') {
        const subtype = asset.asset_subtype || 'music';
        if (groups[subtype]) {
          groups[subtype].push(asset);
        }
      } else {
        groups.visuals.push(asset);
      }
    });

    return groups;
  }, [assets]);

  const handleSaveToFinal = async () => {
    const audioTypes: ('voiceover' | 'sfx' | 'music')[] = [];
    if (includeVoiceover) audioTypes.push('voiceover');
    if (includeSfx) audioTypes.push('sfx');
    if (includeMusic) audioTypes.push('music');

    await saveTimelineToFinal({
      includeVideo,
      includeAudio: audioTypes.length > 0,
      audioTypes,
    });

    await loadAssets();
  };

  const handleCreateFinal = async () => {
    const result = await createFinalAsset();
    if (result) {
      window.open(result, '_blank');
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        className={cn(
          'bg-surface-1/95 backdrop-blur-xl border border-border-subtle rounded-2xl',
          'shadow-2xl shadow-black/30 overflow-hidden',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-2/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
              <Film className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Final Export</h3>
              <p className="text-[10px] text-text-tertiary">
                {stats.totalVisuals} visuals, {stats.totalAudio} audio tracks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {assets.length > 0 && (
              <Badge className="bg-accent-purple/20 text-accent-purple border-0 text-[10px]">
                {assets.length} ready
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-text-tertiary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-border-subtle/50 pt-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  {onGenerateAllVideos && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9"
                      onClick={onGenerateAllVideos}
                      disabled={isGeneratingVideos || clips.length === 0}
                    >
                      {isGeneratingVideos ? (
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 mr-2" />
                      )}
                      Generate All Videos
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={handleSaveToFinal}
                    disabled={isSaving || (clips.length === 0 && audioTracks.length === 0)}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-2" />
                    )}
                    Save to Final
                  </Button>
                </div>

                {/* Export Options */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Include in Export
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/50 border border-border-subtle/50">
                      <Label className="text-xs text-text-secondary flex items-center gap-2">
                        <Film className="h-3 w-3 text-violet-400" />
                        Videos/Images
                      </Label>
                      <Switch
                        checked={includeVideo}
                        onCheckedChange={setIncludeVideo}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/50 border border-border-subtle/50">
                      <Label className="text-xs text-text-secondary flex items-center gap-2">
                        <Mic className="h-3 w-3 text-cyan-400" />
                        Voiceover
                      </Label>
                      <Switch
                        checked={includeVoiceover}
                        onCheckedChange={setIncludeVoiceover}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/50 border border-border-subtle/50">
                      <Label className="text-xs text-text-secondary flex items-center gap-2">
                        <Volume2 className="h-3 w-3 text-amber-400" />
                        Sound Effects
                      </Label>
                      <Switch
                        checked={includeSfx}
                        onCheckedChange={setIncludeSfx}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/50 border border-border-subtle/50">
                      <Label className="text-xs text-text-secondary flex items-center gap-2">
                        <Music className="h-3 w-3 text-pink-400" />
                        Music
                      </Label>
                      <Switch
                        checked={includeMusic}
                        onCheckedChange={setIncludeMusic}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                {assets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Final Assets ({assets.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface-2/30 hover:bg-surface-2/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AssetTypeIcon type={asset.asset_type} subtype={asset.asset_subtype} />
                            <span className="text-[11px] text-text-secondary truncate">
                              {asset.name}
                            </span>
                            {asset.duration_ms && (
                              <span className="text-[9px] text-text-disabled">
                                {Math.round(asset.duration_ms / 1000)}s
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeAsset(asset.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Progress */}
                {isExporting && (
                  <div className="space-y-2 p-3 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-accent-purple" />
                        Creating final video...
                      </span>
                      <span className="text-xs text-accent-purple font-medium">
                        {exportProgress}%
                      </span>
                    </div>
                    <Progress value={exportProgress} className="h-1.5" />
                  </div>
                )}

                {/* Create Final Asset Button */}
                <Button
                  size="lg"
                  className={cn(
                    'w-full h-11 bg-gradient-to-r from-accent-purple to-accent-pink',
                    'hover:from-accent-purple/90 hover:to-accent-pink/90',
                    'text-white font-semibold shadow-lg shadow-accent-purple/20',
                    'border-0'
                  )}
                  onClick={handleCreateFinal}
                  disabled={isExporting || assets.length === 0}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Final Asset...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Final Asset
                    </>
                  )}
                </Button>

                {/* Info */}
                {assets.length === 0 && (
                  <p className="text-[10px] text-text-disabled text-center">
                    Save your timeline to final assets first, then create the final video.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}

export default FinalExportPanel;

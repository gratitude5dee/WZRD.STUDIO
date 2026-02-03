import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVideoEditorStore, Clip, AudioTrack, CompositionSettings } from '@/store/videoEditorStore';

interface ExportOptions {
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high' | '4k';
}

const SUPPORTED_FORMATS: ExportOptions['format'][] = ['mp4', 'webm'];
const SUPPORTED_QUALITIES: ExportOptions['quality'][] = ['low', 'medium', 'high', '4k'];

interface ExportContext {
  projectId: string | null;
  clips: Clip[];
  audioTracks: AudioTrack[];
  composition: CompositionSettings;
}

interface ExportDependencies {
  invoke: typeof supabase.functions.invoke;
}

export interface ExportResult {
  url?: string;
  error?: string;
}

const buildPayload = (context: Required<Omit<ExportContext, 'projectId'>> & { projectId: string }) => ({
  projectId: context.projectId,
  clips: context.clips,
  audioTracks: context.audioTracks,
  composition: context.composition,
});

const validateRequest = (context: ExportContext, options: ExportOptions): string | null => {
  if (!context.projectId) {
    return 'Save the project before exporting.';
  }
  if (!SUPPORTED_FORMATS.includes(options.format)) {
    return 'Unsupported export format. Choose MP4 or WebM.';
  }
  if (!SUPPORTED_QUALITIES.includes(options.quality)) {
    return 'Unsupported quality preset.';
  }
  if (context.clips.length === 0 && context.audioTracks.length === 0) {
    return 'Add at least one clip or audio track before exporting.';
  }
  return null;
};

export const runExportRequest = async (
  deps: ExportDependencies,
  context: ExportContext,
  options: ExportOptions
): Promise<ExportResult> => {
  const validationError = validateRequest(context, options);
  if (validationError) {
    return { error: validationError };
  }

  const payload = buildPayload({
    projectId: context.projectId!,
    clips: context.clips,
    audioTracks: context.audioTracks,
    composition: context.composition,
  });

  try {
    const { data, error } = await deps.invoke('export-video', {
      body: { ...payload, format: options.format, quality: options.quality },
    });

    if (error) {
      throw new Error(error.message ?? 'Export failed.');
    }

    if (!data?.url) {
      throw new Error('Export completed without a downloadable URL.');
    }

    return { url: data.url };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to export video. Please try again.',
    };
  }
};

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const resetExportState = useCallback(() => {
    setIsExporting(false);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
  }, []);

  const exportVideo = useCallback(async ({ format, quality }: ExportOptions) => {
    const { project, clips, audioTracks, composition } = useVideoEditorStore.getState();
    const context: ExportContext = { projectId: project.id, clips, audioTracks, composition };

    setIsExporting(true);
    setProgress(10);
    setError(null);
    setDownloadUrl(null);

    const result = await runExportRequest(
      { invoke: supabase.functions.invoke.bind(supabase.functions) },
      context,
      { format, quality }
    );

    if (result.error) {
      setError(result.error);
      setIsExporting(false);
      return;
    }

    setProgress(100);
    setDownloadUrl(result.url ?? null);
    setIsExporting(false);
  }, []);

  return { exportVideo, isExporting, progress, error, downloadUrl, resetExportState };
}

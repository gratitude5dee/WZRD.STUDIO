import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { falAI } from '@/lib/falai-client';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';

interface FalModel {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

type GenerationType = 'image' | 'video' | 'audio';

interface GeneratedMediaInfo {
  url: string;
  type: GenerationType;
  duration?: number;
  format?: string;
}

type UnknownRecord = Record<string, unknown>;

interface MediaCandidate {
  url: string;
  duration?: number;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const isSupportedUrl = (value: string) =>
  value.startsWith('http') || value.startsWith('data:');

const getStringField = (record: UnknownRecord, field: string): string | undefined => {
  const value = record[field];
  return typeof value === 'string' ? value : undefined;
};

const getNumberField = (record: UnknownRecord, field: string): number | undefined => {
  const value = record[field];
  return typeof value === 'number' ? value : undefined;
};

const getCandidateFromValue = (value: unknown): MediaCandidate | null => {
  if (!value) return null;

  if (typeof value === 'string') {
    return isSupportedUrl(value) ? { url: value } : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const url = getStringField(value, 'url');
  if (url && isSupportedUrl(url)) {
    const duration =
      getNumberField(value, 'duration') ??
      getNumberField(value, 'length') ??
      getNumberField(value, 'frames');
    return { url, duration };
  }

  // Some responses use direct string fields like signed_url
  const signedUrl = getStringField(value, 'signed_url');
  if (signedUrl && isSupportedUrl(signedUrl)) {
    const duration =
      getNumberField(value, 'duration') ??
      getNumberField(value, 'length') ??
      getNumberField(value, 'frames');
    return { url: signedUrl, duration };
  }

  return null;
};

const findMediaCandidate = (value: unknown, propertyKeys: string[]): MediaCandidate | null => {
  const visited = new Set<unknown>();

  const search = (current: unknown): MediaCandidate | null => {
    if (typeof current === 'string') {
      return isSupportedUrl(current) ? { url: current } : null;
    }

    if (!isRecord(current) || visited.has(current)) {
      return null;
    }

    visited.add(current);

    const directCandidate = getCandidateFromValue(current);
    if (directCandidate) {
      return directCandidate;
    }

    for (const key of propertyKeys) {
      const valueAtKey = current[key];
      const candidate = getCandidateFromValue(valueAtKey);
      if (candidate) {
        return candidate;
      }

      if (Array.isArray(valueAtKey)) {
        for (const item of valueAtKey) {
          const nestedCandidate = search(item);
          if (nestedCandidate) {
            return nestedCandidate;
          }
        }
      } else {
        const nestedCandidate = search(valueAtKey);
        if (nestedCandidate) {
          return nestedCandidate;
        }
      }
    }

    for (const nestedKey of ['data', 'output', 'result']) {
      const nestedCandidate = search(current[nestedKey]);
      if (nestedCandidate) {
        return nestedCandidate;
      }
    }

    return null;
  };

  return search(value);
};

const unwrapFalResponse = (value: unknown): unknown => {
  if (isRecord(value) && 'success' in value) {
    const successValue = value.success;
    if (typeof successValue === 'boolean' && successValue && 'data' in value) {
      return value.data;
    }
  }
  return value;
};

const CATEGORY_MAP: Record<GenerationType, string> = {
  image: 'image-generation',
  video: 'video-generation',
  audio: 'audio-generation',
};

const FALLBACK_MODELS: Record<GenerationType, FalModel[]> = {
  image: [
    { id: 'fal-ai/flux/dev', name: 'FLUX Dev (Image)' },
    { id: 'fal-ai/flux-1/schnell', name: 'FLUX Schnell (Fast Image)' },
    { id: 'fal-ai/ideogram/v3', name: 'Ideogram V3' },
  ],
  video: [
    { id: 'fal-ai/magi', name: 'MAGI-1 (Text to Video)' },
    { id: 'fal-ai/magi/image-to-video', name: 'MAGI-1 (Image to Video)' },
    { id: 'fal-ai/kling-video/v2/master/text-to-video', name: 'Kling V2 (Text to Video)' },
  ],
  audio: [
    { id: 'fal-ai/dia-tts', name: 'DIA Text to Speech' },
    { id: 'fal-ai/minimax/speech-02-hd', name: 'MiniMax Speech HD' },
    { id: 'fal-ai/ace-step/prompt-to-audio', name: 'ACE STEP Prompt to Audio' },
  ],
};

const DEFAULT_DURATIONS: Record<GenerationType, number> = {
  image: 5,
  video: 10,
  audio: 30,
};

const DEFAULT_CONTENT_TYPES: Record<GenerationType, string> = {
  image: 'image/png',
  video: 'video/mp4',
  audio: 'audio/mpeg',
};

const AIGenerationPanel: React.FC = () => {
  const {
    project,
    addClip,
    addAudioTrack,
    aiGeneration,
    startGeneration,
    finishGeneration,
  } = useVideoEditor();

  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<GenerationType>('image');
  const [selectedModel, setSelectedModel] = useState<string>('fal-ai/flux/dev');
  const [modelsByType, setModelsByType] = useState<Record<GenerationType, FalModel[]>>(FALLBACK_MODELS);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [durationOverride, setDurationOverride] = useState<string>('');

  useEffect(() => {
    const loadModels = async (type: GenerationType) => {
      setLoadingModels(true);
      try {
        const response = await falAI.getModels(CATEGORY_MAP[type]);
        if (response?.models?.length) {
          setModelsByType(prev => ({ ...prev, [type]: response.models }));
          if (!modelsByType[type]?.some(model => model.id === selectedModel) && type === generationType) {
            setSelectedModel(response.models[0].id);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch models, using fallback list.', error);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels('image');
    loadModels('video');
    loadModels('audio');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modelsByType[generationType]?.length) {
      setModelsByType(prev => ({ ...prev, [generationType]: FALLBACK_MODELS[generationType] }));
    }
    if (!modelsByType[generationType]?.some(model => model.id === selectedModel)) {
      const defaultModel = modelsByType[generationType]?.[0]?.id || FALLBACK_MODELS[generationType][0].id;
      setSelectedModel(defaultModel);
    }
  }, [generationType, modelsByType, selectedModel]);

  const modelsForType = useMemo(() => modelsByType[generationType] || FALLBACK_MODELS[generationType], [generationType, modelsByType]);

  const resetState = () => {
    setProgress(0);
    setStatusMessage('');
    setErrorMessage('');
    setDurationOverride('');
  };

  const extractImageInfo = (data: unknown): GeneratedMediaInfo | null => {
    const candidate = findMediaCandidate(data, ['images', 'image', 'url']);
    if (!candidate) {
      return null;
    }

    return {
      url: candidate.url,
      type: 'image',
      duration: candidate.duration ?? DEFAULT_DURATIONS.image,
      format: inferFormatFromUrl(candidate.url, 'image/png'),
    };
  };

  const extractVideoInfo = (data: unknown): GeneratedMediaInfo | null => {
    const candidate = findMediaCandidate(data, ['video', 'videos', 'url']);
    if (!candidate) {
      return null;
    }

    return {
      url: candidate.url,
      type: 'video',
      duration: candidate.duration ?? DEFAULT_DURATIONS.video,
      format: inferFormatFromUrl(candidate.url, 'video/mp4'),
    };
  };

  const extractAudioInfo = (data: unknown): GeneratedMediaInfo | null => {
    const candidate = findMediaCandidate(data, ['audio', 'audios', 'audio_url', 'url']);
    if (!candidate) {
      return null;
    }

    return {
      url: candidate.url,
      type: 'audio',
      duration: candidate.duration ?? DEFAULT_DURATIONS.audio,
      format: inferFormatFromUrl(candidate.url, 'audio/mpeg'),
    };
  };

  const inferFormatFromUrl = (url: string, fallback: string): string => {
    if (url.startsWith('data:')) {
      const match = url.match(/data:(.*?);/);
      return match?.[1] || fallback;
    }
    const extensionMatch = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    if (extensionMatch) {
      const extension = extensionMatch[1].toLowerCase();
      switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
          return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        case 'mp4':
        case 'mov':
        case 'webm':
          return `video/${extension === 'mov' ? 'quicktime' : extension}`;
        case 'mp3':
        case 'wav':
        case 'ogg':
          return `audio/${extension === 'mp3' ? 'mpeg' : extension}`;
        default:
          return fallback;
      }
    }
    return fallback;
  };

  const fetchAndUploadMedia = async (media: GeneratedMediaInfo): Promise<{ url: string; duration?: number; name: string }> => {
    if (!project.id) {
      throw new Error('Project not found. Please create or open a project first.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('You must be logged in to save generated media.');
    }

    let contentType = media.format || DEFAULT_CONTENT_TYPES[media.type];
    let fileBuffer: ArrayBuffer | Uint8Array;

    if (media.url.startsWith('data:')) {
      const [header, base64Data] = media.url.split(',');
      const match = header.match(/data:(.*?);base64/);
      if (match) {
        contentType = match[1];
      }
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBuffer = bytes;
    } else {
      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error(`Failed to download generated media: ${response.statusText}`);
      }
      const blob = await response.blob();
      contentType = blob.type || contentType;
      fileBuffer = await blob.arrayBuffer();
    }

    const bucket = media.type === 'audio' ? 'audio' : 'videos';
    const extension = contentTypeToExtension(contentType, media.type);
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = `${project.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const mediaName = `AI ${media.type.charAt(0).toUpperCase() + media.type.slice(1)} ${new Date().toLocaleTimeString()}`;

    const mediaId = await supabaseService.media.create(project.id!, {
      type: media.type === 'image' ? 'image' : media.type === 'audio' ? 'audio' : 'video',
      name: mediaName,
      bucket,
      storagePath: filePath,
      durationMs: (media.duration || DEFAULT_DURATIONS[media.type]) * 1000,
      startTimeMs: 0,
    });

    // Add to store based on type
    if (media.type === 'audio') {
      addAudioTrack({
        id: mediaId.id,
        type: 'audio',
        url: publicUrl,
        name: mediaName,
        duration: media.duration || DEFAULT_DURATIONS[media.type],
        startTime: 0,
        volume: 1,
        isMuted: false,
      });
    } else {
      addClip({
        id: mediaId.id,
        type: media.type === 'image' ? 'image' : 'video',
        url: publicUrl,
        name: mediaName,
        duration: media.duration || DEFAULT_DURATIONS[media.type],
        startTime: 0,
        layer: 0,
        transforms: {
          position: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          rotation: 0,
          opacity: 1,
        },
      });
    }

    return { url: publicUrl, duration: media.duration, name: mediaName };
  };

  const contentTypeToExtension = (contentType: string, type: GenerationType): string => {
    if (!contentType) {
      switch (type) {
        case 'image':
          return 'png';
        case 'video':
          return 'mp4';
        case 'audio':
          return 'mp3';
      }
    }

    if (contentType.includes('png')) return 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('mp4')) return 'mp4';
    if (contentType.includes('quicktime')) return 'mov';
    if (contentType.includes('webm')) return 'webm';
    if (contentType.includes('wav')) return 'wav';
    if (contentType.includes('ogg')) return 'ogg';
    if (contentType.includes('mpeg')) return 'mp3';
    if (contentType.includes('mp3')) return 'mp3';

    switch (type) {
      case 'image':
        return 'png';
      case 'video':
        return 'mp4';
      case 'audio':
        return 'mp3';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please provide a prompt before generating.');
      return;
    }

    if (!project.id) {
      toast.error('Please create or open a project before generating media.');
      return;
    }

    resetState();
    startGeneration();
    setStatusMessage('Submitting prompt to fal.ai...');

    let hasResolved = false;
    let resolveOutput: ((value: unknown) => void) | null = null;
    let rejectOutput: ((reason?: unknown) => void) | null = null;

    const outputPromise = new Promise<unknown>((resolve, reject) => {
      resolveOutput = (value: unknown) => {
        if (!hasResolved) {
          hasResolved = true;
          resolve(value);
        }
      };
      rejectOutput = (reason?: unknown) => {
        if (!hasResolved) {
          hasResolved = true;
          reject(reason);
        }
      };
    });

    try {
      const metadata = { metadata: { projectId: project.id, source: 'timeline' as const } };

      const baseOptions = {
        modelId: selectedModel,
        ...metadata,
        onProgress: (value: number) => {
          setProgress(Math.round(value));
          setStatusMessage(`Generating... ${Math.round(value)}%`);
        },
        onComplete: (output: unknown) => {
          setStatusMessage('Generation complete. Preparing media...');
          setProgress(100);
          resolveOutput?.(output);
        },
        onError: (error: Error) => {
          setStatusMessage(error.message);
          rejectOutput?.(error);
        },
      };

      let response;
      if (generationType === 'image') {
        response = await falAI.generateImage(prompt, baseOptions);
      } else if (generationType === 'video') {
        const videoOptions: Record<string, unknown> = { ...baseOptions };
        if (durationOverride) {
          const parsedDuration = parseInt(durationOverride, 10);
          if (!Number.isNaN(parsedDuration)) {
            videoOptions.duration = parsedDuration;
          }
        }
        response = await falAI.generateVideo(prompt, videoOptions);
      } else {
        const audioOptions: Record<string, unknown> = { ...baseOptions };
        if (durationOverride) {
          const parsedDuration = parseInt(durationOverride, 10);
          if (!Number.isNaN(parsedDuration)) {
            audioOptions.duration = parsedDuration;
          }
        }
        response = await falAI.generateAudio(prompt, audioOptions);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'fal.ai request failed');
      }

      if (response.data && !hasResolved) {
        resolveOutput?.(response.data);
      }

      const output = await outputPromise;
      const normalizedOutput = unwrapFalResponse(output);

      let mediaInfo: GeneratedMediaInfo | null = null;
      if (generationType === 'image') {
        mediaInfo = extractImageInfo(normalizedOutput);
      } else if (generationType === 'video') {
        mediaInfo = extractVideoInfo(normalizedOutput);
      } else {
        mediaInfo = extractAudioInfo(normalizedOutput);
      }

      if (!mediaInfo?.url) {
        console.error('Unsupported fal.ai response format:', normalizedOutput);
        throw new Error('Failed to parse fal.ai response. Please try again or choose a different model.');
      }

      if (durationOverride) {
        const customDuration = parseInt(durationOverride, 10);
        if (!Number.isNaN(customDuration)) {
          mediaInfo.duration = customDuration;
        }
      }

      await fetchAndUploadMedia(mediaInfo);
      const successMessage = 'Generation completed successfully.';
      toast.success('AI media generated and added to your project!');
      setStatusMessage(successMessage);
      finishGeneration('completed', successMessage);
    } catch (error) {
      console.error('AI generation failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate media. Please try again later.';
      setErrorMessage(message);
      setStatusMessage(message);
      toast.error(message);
      finishGeneration('failed', message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Generation</h3>
          <p className="text-sm text-zinc-400">Create new media assets without leaving the editor.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-xs uppercase tracking-wide text-zinc-400">Media Type</Label>
        <Select
          value={generationType}
          onValueChange={(value: GenerationType) => setGenerationType(value)}
          disabled={aiGeneration.status === 'running'}
        >
          <SelectTrigger className="bg-[#0A0D16] border-[#1D2130] text-white">
            <SelectValue placeholder="Select media type" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0D16] border-[#1D2130] text-white">
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-xs uppercase tracking-wide text-zinc-400">Model</Label>
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={aiGeneration.status === 'running' || loadingModels}
        >
          <SelectTrigger className="bg-[#0A0D16] border-[#1D2130] text-white">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0D16] border-[#1D2130] text-white max-h-64">
            {modelsForType.map(model => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <span>{model.name || model.id}</span>
                  {model.description && (
                    <span className="text-xs text-zinc-400">{model.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
            {!modelsForType.length && (
              <div className="px-3 py-2 text-sm text-zinc-400">No models available.</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-xs uppercase tracking-wide text-zinc-400">Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe what you want to create..."
          className="min-h-[120px] bg-[#0A0D16] border-[#1D2130] text-white"
          disabled={aiGeneration.status === 'running'}
        />
      </div>

      {(generationType === 'video' || generationType === 'audio') && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-wide text-zinc-400">Desired Duration (seconds)</Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={durationOverride}
            onChange={(event) => setDurationOverride(event.target.value)}
            placeholder={DEFAULT_DURATIONS[generationType].toString()}
            className="bg-[#0A0D16] border-[#1D2130] text-white"
            disabled={aiGeneration.status === 'running'}
          />
          <p className="text-xs text-zinc-500">Optional. Leave blank to use the model default duration.</p>
        </div>
      )}

      <Button
        className="w-full bg-purple-600 hover:bg-purple-500"
        onClick={handleGenerate}
        disabled={aiGeneration.status === 'running'}
      >
        {aiGeneration.status === 'running' ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </span>
        )}
      </Button>

      {(progress > 0 || aiGeneration.status === 'running') && (
        <div className="flex flex-col gap-2 rounded-lg border border-[#1D2130] bg-[#0A0D16] p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{statusMessage || 'Preparing generation...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default AIGenerationPanel;

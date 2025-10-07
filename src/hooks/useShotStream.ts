import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShotDetails } from '@/types/storyboardTypes';

export type ShotStreamStatus = 'creating' | 'drafting' | 'enriching' | 'ready';

export interface ShotStreamMessage {
  id: string;
  status: ShotStreamStatus;
  title?: string;
  thumbnail?: string | null;
  description?: string | null;
  visual_prompt?: string | null;
  shot_number?: number;
  scene_id?: string;
}

export interface ShotStreamMeta {
  requestId: string;
  projectId: string;
  sceneId: string;
  latency: number;
}

type PhaseDurations = Partial<Record<ShotStreamStatus, number>>;

interface UseShotStreamOptions {
  endpoint?: string;
  onShotReady?: (shot: Partial<ShotDetails>) => void;
  onError?: (error: Error) => void;
}

interface ParsedEvent {
  event?: string;
  data?: string;
}

const statusOrder: ShotStreamStatus[] = ['creating', 'drafting', 'enriching', 'ready'];

const computeProgress = (status: ShotStreamStatus): number => {
  const index = statusOrder.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / statusOrder.length) * 100;
};

const extractEvents = (buffer: string): { events: ParsedEvent[]; remainder: string } => {
  const events: ParsedEvent[] = [];
  let workingBuffer = buffer;

  while (true) {
    const delimiterIndex = workingBuffer.indexOf('\n\n');
    if (delimiterIndex === -1) break;
    const chunk = workingBuffer.slice(0, delimiterIndex);
    workingBuffer = workingBuffer.slice(delimiterIndex + 2);

    const event: ParsedEvent = {};
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('event:')) {
        event.event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const dataLine = line.slice(5).trim();
        event.data = event.data ? `${event.data}\n${dataLine}` : dataLine;
      }
    }
    if (event.event || event.data) {
      events.push(event);
    }
  }

  return { events, remainder: workingBuffer };
};

export const useShotStream = (
  projectId: string | undefined,
  { endpoint, onShotReady, onError }: UseShotStreamOptions = {}
) => {
  const [messages, setMessages] = useState<ShotStreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [meta, setMeta] = useState<ShotStreamMeta | null>(null);
  const [phaseDurations, setPhaseDurations] = useState<PhaseDurations>({});
  const [progress, setProgress] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef('');
  const startTimeRef = useRef<number | null>(null);
  const markRef = useRef<string | null>(null);
  const measureNamesRef = useRef<string[]>([]);
  const lastStatusRef = useRef<ShotStreamStatus | null>(null);

  const streamEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
    return `${base}/gen/shots`;
  }, [endpoint]);

  const clearPerformance = useCallback(() => {
    if (typeof performance === 'undefined') return;
    if (markRef.current) {
      performance.clearMarks(markRef.current);
    }
    measureNamesRef.current.forEach(name => performance.clearMeasures(name));
    measureNamesRef.current = [];
    markRef.current = null;
    lastStatusRef.current = null;
  }, []);

  const recordMeasure = useCallback(
    (suffix: string) => {
      if (typeof performance === 'undefined' || !markRef.current) return;
      const measureName = `${markRef.current}:${suffix}`;
      measureNamesRef.current.push(measureName);
      try {
        performance.measure(measureName, markRef.current);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('Failed to record performance measure', measureName, error);
        }
      }
    },
    []
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
    clearPerformance();
  }, [clearPerformance]);

  const start = useCallback(
    async (payload: Record<string, unknown> = {}) => {
      if (!projectId) {
        onError?.(new Error('projectId is required for streaming shots'));
        return;
      }

      cancel();
      if (typeof performance !== 'undefined') {
        startTimeRef.current = performance.now();
        const mark = `shot-stream:${projectId}:${Date.now()}`;
        markRef.current = mark;
        performance.mark(mark);
      } else {
        startTimeRef.current = Date.now();
        markRef.current = null;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setMessages([]);
      bufferRef.current = '';
      setLatencyMs(null);
      setMeta(null);
      setPhaseDurations({});
      setProgress(0);
      setIsStreaming(true);

      try {
        const response = await fetch(streamEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          signal: controller.signal,
          body: JSON.stringify({ projectId, ...payload })
        });

        if (!response.ok || !response.body) {
          throw new Error(`Streaming request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let firstChunkReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decoded = decoder.decode(value, { stream: true });

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            if (startTimeRef.current !== null) {
              const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
              const latency = now - startTimeRef.current;
              setLatencyMs(latency);
              recordMeasure('first-chunk');
            }
          }

          bufferRef.current += decoded;
          const { events, remainder } = extractEvents(bufferRef.current);
          bufferRef.current = remainder;
          let shouldTerminate = false;

          for (const event of events) {
            if (!event.data) continue;
            if (event.event === 'error') {
              const err = new Error(event.data);
              onError?.(err);
              console.error('Shot stream error', err);
              continue;
            }

            if (event.event === 'done') {
              setProgress(100);
              recordMeasure('done');
              shouldTerminate = true;
              break;
            }

            if (event.event === 'meta') {
              try {
                const metaPayload = JSON.parse(event.data) as ShotStreamMeta;
                setMeta(metaPayload);
              } catch (err) {
                console.error('Failed to parse shot stream meta event', err);
              }
              continue;
            }

            if (event.event === 'shot') {
              try {
                const payload = JSON.parse(event.data) as ShotStreamMessage;
                setMessages(prev => {
                  const existingIndex = prev.findIndex(item => item.id === payload.id);
                  if (existingIndex >= 0) {
                    const next = [...prev];
                    next[existingIndex] = { ...next[existingIndex], ...payload };
                    return next;
                  }
                  return [...prev, payload];
                });

                if (startTimeRef.current !== null) {
                  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                  const elapsed = now - startTimeRef.current;
                  setPhaseDurations(prev => ({ ...prev, [payload.status]: elapsed }));
                }

                if (lastStatusRef.current !== payload.status) {
                  lastStatusRef.current = payload.status;
                  recordMeasure(`phase:${payload.status}`);
                }

                setProgress(prev => Math.max(prev, computeProgress(payload.status)));

                if (payload.status === 'ready') {
                  const optimisticShot: Partial<ShotDetails> = {
                    id: payload.id,
                    scene_id: payload.scene_id ?? '',
                    project_id: projectId,
                    shot_number: payload.shot_number ?? 0,
                    visual_prompt: payload.visual_prompt ?? null,
                    prompt_idea: payload.description ?? null,
                    shot_type: payload.title ?? null,
                    image_url: payload.thumbnail ?? null,
                    image_status: 'completed',
                    audio_status: 'pending',
                    video_status: 'pending',
                    dialogue: null,
                    sound_effects: null,
                    video_url: null,
                    audio_url: null,
                    luma_generation_id: null
                  } as Partial<ShotDetails>;
                  onShotReady?.(optimisticShot);
                }
              } catch (err) {
                console.error('Failed to parse shot event', err);
              }
            }
          }

          if (shouldTerminate) {
            break;
          }
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        console.error('Shot stream failed', error);
        onError?.(error as Error);
      } finally {
        setIsStreaming(false);
        controllerRef.current = null;
        clearPerformance();
      }
    },
    [projectId, streamEndpoint, cancel, onError, onShotReady, recordMeasure, clearPerformance]
  );

  useEffect(() => cancel, [cancel]);

  return {
    isStreaming,
    latencyMs,
    messages,
    meta,
    phaseDurations,
    progress,
    start,
    cancel
  };
};

export type UseShotStreamReturn = ReturnType<typeof useShotStream>;

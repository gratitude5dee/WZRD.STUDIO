import { useEffect, useRef, useState } from 'react';
import { AudioTrack } from '@/store/videoEditorStore';

interface WaveformRendererProps {
  track: AudioTrack;
}

export function WaveformRenderer({ track }: WaveformRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const zoom = 50; // Default zoom, will be passed in Phase 3
  
  // Load and process audio waveform
  useEffect(() => {
    const loadWaveform = async () => {
      try {
        // Check if waveform is already cached
        const cached = await getWaveformFromCache(track.id);
        if (cached) {
          setWaveformData(cached);
          return;
        }
        
        // Generate waveform
        const waveform = await generateWaveform(track.url);
        setWaveformData(waveform);
        
        // Cache for future use
        cacheWaveform(track.id, waveform);
      } catch (error) {
        console.error('Failed to load waveform:', error);
      }
    };
    
    loadWaveform();
  }, [track.url, track.id]);
  
  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate dimensions
    const width = ((track.duration || 0) / 1000) * zoom;
    const height = canvas.height;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform
    ctx.fillStyle = track.isMuted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))';
    ctx.globalAlpha = track.volume || 1;
    
    const barWidth = width / waveformData.length;
    const centerY = height / 2;
    
    waveformData.forEach((amplitude, i) => {
      const barHeight = amplitude * centerY;
      const x = i * barWidth;
      
      // Draw symmetric bars
      ctx.fillRect(x, centerY - barHeight, Math.max(barWidth, 1), barHeight * 2);
    });
  }, [waveformData, zoom, track.duration, track.volume, track.isMuted]);
  
  const widthPx = ((track.duration || 0) / 1000) * zoom;
  const leftPx = ((track.startTime || 0) / 1000) * zoom;
  
  return (
    <div
      className="absolute top-0 left-0 h-full"
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        height={64}
      />
      
      {/* Volume indicator */}
      <div 
        className="absolute top-1 right-1 text-xs text-primary-foreground bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono"
      >
        {Math.round((track.volume || 1) * 100)}%
      </div>
    </div>
  );
}

// Helper: Generate waveform from audio URL
async function generateWaveform(audioUrl: string): Promise<number[]> {
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const channelData = audioBuffer.getChannelData(0);
  const samples = 200; // Number of bars in waveform
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    let sum = 0;
    
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j]);
    }
    
    waveform.push(sum / blockSize);
  }
  
  return waveform;
}

// Helper: Cache waveform in IndexedDB
async function cacheWaveform(trackId: string, waveform: number[]): Promise<void> {
  try {
    const db = await openWaveformDB();
    const tx = db.transaction('waveforms', 'readwrite');
    tx.objectStore('waveforms').put({ id: trackId, data: waveform });
  } catch (error) {
    console.error('Failed to cache waveform:', error);
  }
}

// Helper: Get waveform from cache
async function getWaveformFromCache(trackId: string): Promise<number[] | null> {
  try {
    const db = await openWaveformDB();
    const tx = db.transaction('waveforms', 'readonly');
    const store = tx.objectStore('waveforms');
    const request = store.get(trackId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get waveform from cache:', error);
    return null;
  }
}

// Helper: Open IndexedDB
function openWaveformDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WaveformCache', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('waveforms')) {
        db.createObjectStore('waveforms', { keyPath: 'id' });
      }
    };
  });
}

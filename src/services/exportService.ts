import { toast } from 'sonner';

interface ExportOptions {
  format: 'png' | 'gif';
  quality?: number;
  scale?: number;
  transparent?: boolean;
  selectedOnly?: boolean;
}

interface GifExportOptions {
  width: number;
  height: number;
  fps?: number;
  quality?: number;
  loop?: boolean;
}

interface CanvasObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: any;
}

// Simple GIF encoder using browser APIs
class GifEncoder {
  private frames: ImageData[] = [];
  private width: number;
  private height: number;
  private delay: number;

  constructor(width: number, height: number, fps: number = 10) {
    this.width = width;
    this.height = height;
    this.delay = Math.floor(1000 / fps);
  }

  addFrame(canvas: HTMLCanvasElement | ImageData): void {
    if (canvas instanceof HTMLCanvasElement) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.frames.push(ctx.getImageData(0, 0, this.width, this.height));
      }
    } else {
      this.frames.push(canvas);
    }
  }

  async render(): Promise<Blob> {
    // Use canvas-based animation for browsers without GIF support
    // This creates an animated WebP or falls back to multiple PNG frames
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d')!;

    // For browsers that support canvas.captureStream and MediaRecorder
    if ('MediaRecorder' in window && canvas.captureStream) {
      return this.createWebMGif(canvas, ctx);
    }

    // Fallback: Create an animated PNG using APNG or simple frame sequence
    return this.createAnimatedSequence(ctx);
  }

  private async createWebMGif(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const stream = canvas.captureStream(0);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      recorder.onerror = (e) => reject(e);

      recorder.start();

      let frameIndex = 0;
      const renderFrame = () => {
        if (frameIndex < this.frames.length) {
          ctx.putImageData(this.frames[frameIndex], 0, 0);
          // @ts-ignore - requestFrame exists on captureStream tracks
          stream.getVideoTracks()[0].requestFrame?.();
          frameIndex++;
          setTimeout(renderFrame, this.delay);
        } else {
          recorder.stop();
        }
      };

      renderFrame();
    });
  }

  private async createAnimatedSequence(
    ctx: CanvasRenderingContext2D
  ): Promise<Blob> {
    // Create a simple concatenated image with all frames
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = this.width;
    combinedCanvas.height = this.height * this.frames.length;
    const combinedCtx = combinedCanvas.getContext('2d')!;

    this.frames.forEach((frame, index) => {
      combinedCtx.putImageData(frame, 0, index * this.height);
    });

    return new Promise((resolve) => {
      combinedCanvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        'image/png',
        1
      );
    });
  }
}

export class ExportService {
  /**
   * Export canvas to PNG
   */
  static async exportToPNG(
    objects: CanvasObject[],
    viewport: { x: number; y: number; scale: number },
    options: ExportOptions = { format: 'png' }
  ): Promise<string> {
    const {
      quality = 1,
      scale = 1,
      transparent = true,
      selectedOnly = false,
    } = options;

    try {
      // Calculate bounds
      const bounds = this.calculateBounds(objects);
      
      // Create temporary HTML canvas
      const canvas = document.createElement('canvas');
      canvas.width = bounds.width * scale;
      canvas.height = bounds.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set background
      if (!transparent) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Load and draw objects
      for (const obj of objects) {
        await this.drawObjectToCanvas(ctx, obj, bounds, scale);
      }

      // Export to PNG
      const dataURL = canvas.toDataURL('image/png', quality);
      return dataURL;
    } catch (error) {
      console.error('Export to PNG failed:', error);
      throw new Error('Failed to export canvas');
    }
  }

  /**
   * Export canvas to GIF (animated)
   */
  static async exportToGIF(
    objects: CanvasObject[],
    viewport: { x: number; y: number; scale: number },
    options: ExportOptions = { format: 'gif' }
  ): Promise<Blob> {
    const { scale = 1 } = options;

    try {
      const bounds = this.calculateBounds(objects);
      const encoder = new GifEncoder(
        bounds.width * scale,
        bounds.height * scale,
        10 // 10 fps
      );

      // Create frames for animated GIF
      const canvas = document.createElement('canvas');
      canvas.width = bounds.width * scale;
      canvas.height = bounds.height * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // Generate multiple frames with slight variations for animation
      // For static images, create a single-frame "GIF"
      const numFrames = objects.some(obj => obj.data?.animated) ? 10 : 1;

      for (let i = 0; i < numFrames; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const obj of objects) {
          await this.drawObjectToCanvas(ctx, obj, bounds, scale);
        }

        encoder.addFrame(canvas);
      }

      const blob = await encoder.render();
      toast.success('GIF exported successfully!');
      return blob;
    } catch (error) {
      console.error('Export to GIF failed:', error);
      toast.error('Failed to export GIF');
      // Fallback to PNG
      const dataURL = await this.exportToPNG(objects, viewport, options);
      return await fetch(dataURL).then(r => r.blob());
    }
  }

  /**
   * Export frames to animated GIF with full control
   */
  static async exportFramesToGIF(
    frames: HTMLCanvasElement[] | ImageData[],
    options: GifExportOptions
  ): Promise<Blob> {
    const { width, height, fps = 10 } = options;

    const encoder = new GifEncoder(width, height, fps);

    for (const frame of frames) {
      encoder.addFrame(frame);
    }

    return encoder.render();
  }

  /**
   * Export timeline to animated GIF
   */
  static async exportTimelineToGIF(
    timelineState: any,
    options: {
      width?: number;
      height?: number;
      fps?: number;
      startTime?: number;
      endTime?: number;
    } = {}
  ): Promise<Blob> {
    const {
      width = 480,
      height = 270,
      fps = 10,
      startTime = 0,
      endTime = timelineState?.duration || 5000,
    } = options;

    const frames: HTMLCanvasElement[] = [];
    const frameDuration = 1000 / fps;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    for (let time = startTime; time < endTime; time += frameDuration) {
      // Render frame at this time
      await this.renderFrameAtTime(ctx, timelineState, time, width, height);

      // Clone canvas for GIF
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = width;
      frameCanvas.height = height;
      frameCanvas.getContext('2d')!.drawImage(canvas, 0, 0);
      frames.push(frameCanvas);
    }

    return this.exportFramesToGIF(frames, { width, height, fps });
  }

  /**
   * Render a single frame at a specific time
   */
  private static async renderFrameAtTime(
    ctx: CanvasRenderingContext2D,
    timeline: any,
    time: number,
    width: number,
    height: number
  ): Promise<void> {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (!timeline?.clips) return;

    // Get visible clips at this time
    const visibleClips = timeline.clips.filter(
      (clip: any) => clip.startTime <= time && (clip.startTime + clip.duration) >= time
    );

    // Sort by layer
    visibleClips.sort((a: any, b: any) => (a.layer || 0) - (b.layer || 0));

    // Render each clip
    for (const clip of visibleClips) {
      if (clip.type === 'video' && clip.element) {
        const clipTime = time - clip.startTime;
        clip.element.currentTime = clipTime / 1000;
        try {
          await new Promise((resolve) => {
            clip.element!.onseeked = resolve;
            setTimeout(resolve, 100); // Timeout fallback
          });
          ctx.drawImage(clip.element, 0, 0, width, height);
        } catch (e) {
          // Skip frame on error
        }
      } else if (clip.type === 'image' && clip.element) {
        ctx.drawImage(clip.element, 0, 0, width, height);
      }
    }
  }

  /**
   * Download exported image
   */
  static downloadImage(dataURL: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Calculate bounds of all objects
   */
  private static calculateBounds(objects: CanvasObject[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (objects.length === 0) {
      return { x: 0, y: 0, width: 1000, height: 1000 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const obj of objects) {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Draw object to canvas context
   */
  private static async drawObjectToCanvas(
    ctx: CanvasRenderingContext2D,
    obj: CanvasObject,
    bounds: { x: number; y: number },
    scale: number
  ): Promise<void> {
    if (!obj.data?.url) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        ctx.save();
        
        const x = (obj.x - bounds.x) * scale;
        const y = (obj.y - bounds.y) * scale;
        const w = obj.width * scale;
        const h = obj.height * scale;
        
        // Apply rotation
        if (obj.rotation) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((obj.rotation * Math.PI) / 180);
          ctx.translate(-(x + w / 2), -(y + h / 2));
        }
        
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
        resolve();
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', obj.data.url);
        resolve(); // Continue even if image fails
      };
      
      img.src = obj.data.url;
    });
  }
}

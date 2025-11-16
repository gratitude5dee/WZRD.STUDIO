import { toast } from 'sonner';

interface ExportOptions {
  format: 'png' | 'gif';
  quality?: number;
  scale?: number;
  transparent?: boolean;
  selectedOnly?: boolean;
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
    // For now, export as PNG sequence (GIF encoding requires additional library)
    toast.info('GIF export coming soon! Exporting as PNG for now.');
    
    const dataURL = await this.exportToPNG(objects, viewport, options);
    const blob = await fetch(dataURL).then(r => r.blob());
    return blob;
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

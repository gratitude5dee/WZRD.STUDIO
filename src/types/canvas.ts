// Canvas Types for Infinite Kanvas Integration

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasObject {
  id: string;
  type: 'image' | 'video' | 'text' | 'shape';
  layerIndex: number;
  transform: Transform;
  visibility: boolean;
  locked: boolean;
  data: ImageData | VideoData | TextData | ShapeData;
  createdAt: string;
  updatedAt: string;
}

export interface ImageData {
  url: string;
  width: number;
  height: number;
  filters?: ImageFilter[];
}

export interface VideoData {
  url: string;
  width: number;
  height: number;
  duration: number;
  currentTime: number;
}

export interface TextData {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface ShapeData {
  shapeType: 'rectangle' | 'circle' | 'polygon';
  fill: string;
  stroke: string;
  strokeWidth: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
}

export interface ImageFilter {
  type: 'blur' | 'brighten' | 'contrast' | 'grayscale' | 'hue' | 'saturate';
  value: number;
}

export interface CanvasProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  canvasState: {
    viewport: ViewportState;
    objects: CanvasObject[];
  };
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  width: number;
  height: number;
  backgroundColor: string;
  fps: number;
}

export interface Asset {
  id: string;
  projectId: string;
  userId: string;
  type: 'image' | 'video' | 'audio';
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface TimelineNode {
  id: string;
  projectId: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  createdAt: string;
}

export interface TimelineEdge {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  edgeData: Record<string, any>;
  createdAt: string;
}

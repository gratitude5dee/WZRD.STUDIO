import type { CanvasObject, ViewportState } from '@/types/canvas';

export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function getObjectBounds(obj: CanvasObject): BoundingBox {
  const { transform, data } = obj;
  let width = 100;
  let height = 100;

  if (obj.type === 'image' || obj.type === 'video') {
    width = (data as any).width || 100;
    height = (data as any).height || 100;
  } else if (obj.type === 'shape' && 'width' in data) {
    width = (data as any).width || 100;
    height = (data as any).height || 100;
  }

  const scaledWidth = width * transform.scaleX;
  const scaledHeight = height * transform.scaleY;

  return {
    left: transform.x,
    top: transform.y,
    right: transform.x + scaledWidth,
    bottom: transform.y + scaledHeight,
  };
}

export function getViewportBounds(
  viewport: ViewportState,
  canvasWidth: number,
  canvasHeight: number
): BoundingBox {
  const { x, y, scale } = viewport;
  return {
    left: -x / scale,
    top: -y / scale,
    right: (-x + canvasWidth) / scale,
    bottom: (-y + canvasHeight) / scale,
  };
}

export function isInViewport(
  objectBounds: BoundingBox,
  viewportBounds: BoundingBox,
  margin: number = 200
): boolean {
  return !(
    objectBounds.right < viewportBounds.left - margin ||
    objectBounds.left > viewportBounds.right + margin ||
    objectBounds.bottom < viewportBounds.top - margin ||
    objectBounds.top > viewportBounds.bottom + margin
  );
}

export function cullObjects(
  objects: CanvasObject[],
  viewport: ViewportState,
  canvasWidth: number,
  canvasHeight: number
): CanvasObject[] {
  const viewportBounds = getViewportBounds(viewport, canvasWidth, canvasHeight);
  
  return objects.filter(obj => {
    const bounds = getObjectBounds(obj);
    return isInViewport(bounds, viewportBounds);
  });
}

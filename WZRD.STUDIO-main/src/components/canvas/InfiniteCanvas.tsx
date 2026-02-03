import { useCanvasStore } from '@/lib/stores/canvas-store';
import { Canvas as FabricCanvas, FabricImage, Rect, IText, Circle } from 'fabric';
import { useEffect, useRef, useCallback, useState } from 'react';
import type { CanvasObject } from '@/types/canvas';
import { cullObjects } from '@/lib/canvas/viewport-culling';
import { CanvasGrid } from './CanvasGrid';
import { MiniMap } from './MiniMap';

interface InfiniteCanvasProps {
  projectId: string;
  width: number;
  height: number;
  onObjectSelect?: (objectIds: string[]) => void;
}

export default function InfiniteCanvas({ projectId, width, height, onObjectSelect }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const dragStateRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  
  const {
    objects,
    selectedIds,
    viewport,
    setViewport,
    updateTransform,
    setSelectedIds,
    clearSelection,
    setProjectId,
  } = useCanvasStore();

  useEffect(() => {
    setProjectId(projectId);
  }, [projectId, setProjectId]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#0A0A0A',
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    // Mouse wheel zoom
    fabricCanvas.on('mouse:wheel', (opt) => {
      const evt = opt.e;
      evt.preventDefault();
      evt.stopPropagation();

      const delta = evt.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.1, Math.min(10, zoom));

      const point = fabricCanvas.getScenePoint(evt);
      fabricCanvas.zoomToPoint(point, zoom);
      setZoomLevel(zoom);

      const vpt = fabricCanvas.viewportTransform;
      if (vpt) {
        setViewport({
          x: vpt[4],
          y: vpt[5],
          scale: zoom,
        });
      }
    });

    // Pan with Alt/Ctrl + drag
    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey || evt.ctrlKey) {
        fabricCanvas.selection = false;
        dragStateRef.current.isDragging = true;
        dragStateRef.current.lastX = evt.clientX;
        dragStateRef.current.lastY = evt.clientY;
        fabricCanvas.defaultCursor = 'grabbing';
      }
    });

    fabricCanvas.on('mouse:move', (opt) => {
      if (dragStateRef.current.isDragging) {
        const evt = opt.e as MouseEvent;
        const vpt = fabricCanvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - dragStateRef.current.lastX;
          vpt[5] += evt.clientY - dragStateRef.current.lastY;
          dragStateRef.current.lastX = evt.clientX;
          dragStateRef.current.lastY = evt.clientY;
          fabricCanvas.requestRenderAll();

          setViewport({
            x: vpt[4],
            y: vpt[5],
            scale: fabricCanvas.getZoom(),
          });
        }
      }
    });

    fabricCanvas.on('mouse:up', () => {
      dragStateRef.current.isDragging = false;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
    });

    // Selection events
    fabricCanvas.on('selection:created', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected
          .map((obj) => (obj as any).canvasObjectId)
          .filter(Boolean);
        if (ids.length > 0) {
          setSelectedIds(ids);
          onObjectSelect?.(ids);
        }
      }
    });

    fabricCanvas.on('selection:updated', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected
          .map((obj) => (obj as any).canvasObjectId)
          .filter(Boolean);
        if (ids.length > 0) {
          setSelectedIds(ids);
          onObjectSelect?.(ids);
        }
      }
    });

    fabricCanvas.on('selection:cleared', () => {
      clearSelection();
    });

    // Object modification events
    fabricCanvas.on('object:modified', (e) => {
      const obj = e.target as any;
      if (obj && obj.canvasObjectId) {
        updateTransform(obj.canvasObjectId, {
          x: obj.left || 0,
          y: obj.top || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          rotation: obj.angle || 0,
        });
      }
    });

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [width, height]);

  // Sync objects from store to canvas with viewport culling
  useEffect(() => {
    if (!canvas) return;

    // Apply viewport culling for performance
    const culledObjects = cullObjects(objects, viewport, width, height);

    const canvasObjects = canvas.getObjects();

    // Remove objects not in culled list
    canvasObjects.forEach((fabricObj: any) => {
      if (!culledObjects.find(obj => obj.id === fabricObj.canvasObjectId)) {
        canvas.remove(fabricObj);
      }
    });

    // Add or update culled objects
    culledObjects.forEach(async (storeObj) => {
      const existingObj = canvasObjects.find((fObj: any) => fObj.canvasObjectId === storeObj.id);
      
      if (!existingObj) {
        const newObj = await createFabricObject(storeObj);
        if (newObj) {
          canvas.add(newObj);
        }
      } else {
        updateFabricObject(existingObj, storeObj);
      }
    });

    canvas.renderAll();
  }, [canvas, objects, viewport, width, height]);

  // Update selection
  useEffect(() => {
    if (!canvas) return;

    const canvasObjects = canvas.getObjects();
    const selectedObjects = selectedIds
      .map((id) => canvasObjects.find((obj: any) => obj.canvasObjectId === id))
      .filter(Boolean);

    if (selectedObjects.length === 1) {
      canvas.setActiveObject(selectedObjects[0]);
    } else if (selectedObjects.length > 1) {
      const selection = new (canvas as any).ActiveSelection(selectedObjects, { canvas });
      canvas.setActiveObject(selection);
    } else {
      canvas.discardActiveObject();
    }

    canvas.renderAll();
  }, [canvas, selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const deleteSelected = useCanvasStore.getState().deleteSelected;
        deleteSelected();
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          useCanvasStore.getState().undo();
        }
        if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          useCanvasStore.getState().redo();
        }
        if (e.key === 'c') {
          e.preventDefault();
          useCanvasStore.getState().copy();
        }
        if (e.key === 'v') {
          e.preventDefault();
          useCanvasStore.getState().paste();
        }
        if (e.key === 'd') {
          e.preventDefault();
          useCanvasStore.getState().duplicate();
        }
        if (e.key === 'a') {
          e.preventDefault();
          useCanvasStore.getState().selectAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0A0A0A]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Grid and MiniMap rendered on top */}
      <CanvasGrid width={width} height={height} showGrid={true} />
      <MiniMap width={200} height={150} />
    </div>
  );
}

// Helper to create Fabric object from CanvasObject
async function createFabricObject(obj: CanvasObject) {
  const commonProps = {
    left: obj.transform.x,
    top: obj.transform.y,
    scaleX: obj.transform.scaleX,
    scaleY: obj.transform.scaleY,
    angle: obj.transform.rotation,
    selectable: !obj.locked,
    visible: obj.visibility,
  };

  if (obj.type === 'image') {
    const imageData = obj.data as any;
    const img = await FabricImage.fromURL(imageData.url, { crossOrigin: 'anonymous' });
    Object.assign(img, commonProps);
    img.scaleToWidth(imageData.width);
    (img as any).canvasObjectId = obj.id;
    return img;
  }

  if (obj.type === 'shape') {
    const shapeData = obj.data as any;
    let shape: any;
    if (shapeData.shapeType === 'rectangle') {
      shape = new Rect({
        ...commonProps,
        width: shapeData.width || 100,
        height: shapeData.height || 100,
        fill: shapeData.fill,
        stroke: shapeData.stroke,
        strokeWidth: shapeData.strokeWidth,
      });
    } else if (shapeData.shapeType === 'circle') {
      shape = new Circle({
        ...commonProps,
        radius: shapeData.radius || 50,
        fill: shapeData.fill,
        stroke: shapeData.stroke,
        strokeWidth: shapeData.strokeWidth,
      });
    }
    if (shape) {
      shape.canvasObjectId = obj.id;
      return shape;
    }
  }

  if (obj.type === 'text') {
    const textData = obj.data as any;
    const text = new IText(textData.text, {
      ...commonProps,
      fontSize: textData.fontSize,
      fontFamily: textData.fontFamily,
      fill: textData.color,
      textAlign: textData.align,
    });
    (text as any).canvasObjectId = obj.id;
    return text;
  }

  return null;
}

// Helper to update Fabric object
function updateFabricObject(fabricObj: any, obj: CanvasObject) {
  fabricObj.set({
    left: obj.transform.x,
    top: obj.transform.y,
    scaleX: obj.transform.scaleX,
    scaleY: obj.transform.scaleY,
    angle: obj.transform.rotation,
    selectable: !obj.locked,
    visible: obj.visibility,
  });

  if (obj.type === 'text') {
    const textData = obj.data as any;
    fabricObj.set({
      text: textData.text,
      fontSize: textData.fontSize,
      fontFamily: textData.fontFamily,
      fill: textData.color,
      textAlign: textData.align,
    });
  } else if (obj.type === 'shape') {
    const shapeData = obj.data as any;
    fabricObj.set({
      fill: shapeData.fill,
      stroke: shapeData.stroke,
      strokeWidth: shapeData.strokeWidth,
    });
  }
}

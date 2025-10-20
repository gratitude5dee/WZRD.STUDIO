import { useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect, IText, Circle } from 'fabric';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import type { CanvasObject } from '@/types/canvas';

interface InfiniteCanvasProps {
  projectId: string;
  width: number;
  height: number;
  onObjectSelect?: (objectId: string) => void;
}

// Main InfiniteCanvas Component
export function InfiniteCanvas({ projectId, width, height, onObjectSelect }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const objectMapRef = useRef<Map<string, any>>(new Map());
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

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#0A0A0A',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e;
      evt.preventDefault();
      evt.stopPropagation();

      const delta = evt.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.1, Math.min(10, zoom));

      const point = canvas.getScenePoint(evt);
      canvas.zoomToPoint(point, zoom);

      // Update viewport in store
      const vpt = canvas.viewportTransform;
      if (vpt) {
        setViewport({
          x: vpt[4],
          y: vpt[5],
          scale: zoom,
        });
      }
    });

    // Pan with mouse drag (when no object is selected)
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey || evt.ctrlKey) {
        canvas.selection = false;
        dragStateRef.current.isDragging = true;
        dragStateRef.current.lastX = evt.clientX;
        dragStateRef.current.lastY = evt.clientY;
        canvas.defaultCursor = 'grabbing';
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (dragStateRef.current.isDragging) {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - dragStateRef.current.lastX;
          vpt[5] += evt.clientY - dragStateRef.current.lastY;
          dragStateRef.current.lastX = evt.clientX;
          dragStateRef.current.lastY = evt.clientY;
          canvas.requestRenderAll();

          setViewport({
            x: vpt[4],
            y: vpt[5],
            scale: canvas.getZoom(),
          });
        }
      }
    });

    canvas.on('mouse:up', () => {
      dragStateRef.current.isDragging = false;
      canvas.selection = true;
      canvas.defaultCursor = 'default';
    });

    // Selection events
    canvas.on('selection:created', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected
          .map((obj) => (obj as any).canvasObjectId)
          .filter(Boolean);
        if (ids.length > 0) {
          setSelectedIds(ids);
          onObjectSelect?.(ids[0]);
        }
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected
          .map((obj) => (obj as any).canvasObjectId)
          .filter(Boolean);
        if (ids.length > 0) {
          setSelectedIds(ids);
          onObjectSelect?.(ids[0]);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      clearSelection();
    });

    // Object modification events
    canvas.on('object:modified', (e) => {
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
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [width, height, setProjectId, setViewport, setSelectedIds, clearSelection, updateTransform, onObjectSelect]);

  // Sync canvas objects with store
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Remove objects that no longer exist
    const currentObjects = canvas.getObjects();
    currentObjects.forEach((fabricObj: any) => {
      const id = fabricObj.canvasObjectId;
      if (id && !objects.find((obj) => obj.id === id)) {
        canvas.remove(fabricObj);
        objectMapRef.current.delete(id);
      }
    });

    // Add or update objects
    objects.forEach((obj) => {
      let fabricObj = objectMapRef.current.get(obj.id);

      if (!fabricObj) {
        // Create new fabric object
        const result = createFabricObject(obj);
        if (result instanceof Promise) {
          result.then((newObj) => {
            if (newObj) {
              (newObj as any).canvasObjectId = obj.id;
              canvas.add(newObj);
              objectMapRef.current.set(obj.id, newObj);
              canvas.requestRenderAll();
            }
          });
        } else if (result) {
          (result as any).canvasObjectId = obj.id;
          canvas.add(result);
          objectMapRef.current.set(obj.id, result);
        }
      } else {
        // Update existing object
        updateFabricObject(fabricObj, obj);
      }
    });

    canvas.requestRenderAll();
  }, [objects]);

  // Update selection
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const selectedObjects = selectedIds
      .map((id) => objectMapRef.current.get(id))
      .filter(Boolean);

    if (selectedObjects.length === 1) {
      canvas.setActiveObject(selectedObjects[0]);
    } else if (selectedObjects.length > 1) {
      const selection = new (canvas as any).ActiveSelection(selectedObjects, {
        canvas,
      });
      canvas.setActiveObject(selection);
    } else {
      canvas.discardActiveObject();
    }

    canvas.requestRenderAll();
  }, [selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected objects
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const deleteSelected = useCanvasStore.getState().deleteSelected;
        deleteSelected();
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          const undo = useCanvasStore.getState().undo;
          undo();
        }
        if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          const redo = useCanvasStore.getState().redo;
          redo();
        }
        // Copy/Paste/Duplicate
        if (e.key === 'c') {
          e.preventDefault();
          const copy = useCanvasStore.getState().copy;
          copy();
        }
        if (e.key === 'v') {
          e.preventDefault();
          const paste = useCanvasStore.getState().paste;
          paste();
        }
        if (e.key === 'd') {
          e.preventDefault();
          const duplicate = useCanvasStore.getState().duplicate;
          duplicate();
        }
        // Select all
        if (e.key === 'a') {
          e.preventDefault();
          const selectAll = useCanvasStore.getState().selectAll;
          selectAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-zinc-900">
      <canvas ref={canvasRef} />

      {/* Viewport indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white/60 font-mono">
        Zoom: {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
}

// Helper function to create Fabric object from CanvasObject
function createFabricObject(obj: CanvasObject) {
  const commonProps = {
    left: obj.transform.x,
    top: obj.transform.y,
    scaleX: obj.transform.scaleX,
    scaleY: obj.transform.scaleY,
    angle: obj.transform.rotation,
    selectable: !obj.locked,
    visible: obj.visibility,
  };

  switch (obj.type) {
    case 'image': {
      const imageData = obj.data as any;
      return FabricImage.fromURL(imageData.url, {
        crossOrigin: 'anonymous',
      }).then((img) => {
        Object.assign(img, commonProps);
        img.scaleToWidth(imageData.width);
        return img;
      });
    }

    case 'shape': {
      const shapeData = obj.data as any;
      if (shapeData.shapeType === 'rectangle') {
        return new Rect({
          ...commonProps,
          width: shapeData.width || 100,
          height: shapeData.height || 100,
          fill: shapeData.fill,
          stroke: shapeData.stroke,
          strokeWidth: shapeData.strokeWidth,
        });
      } else if (shapeData.shapeType === 'circle') {
        return new Circle({
          ...commonProps,
          radius: shapeData.radius || 50,
          fill: shapeData.fill,
          stroke: shapeData.stroke,
          strokeWidth: shapeData.strokeWidth,
        });
      }
      return null;
    }

    case 'text': {
      const textData = obj.data as any;
      return new IText(textData.text, {
        ...commonProps,
        fontSize: textData.fontSize,
        fontFamily: textData.fontFamily,
        fill: textData.color,
        textAlign: textData.align,
      });
    }

    default:
      return null;
  }
}

// Helper function to update Fabric object
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

  // Update type-specific properties
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

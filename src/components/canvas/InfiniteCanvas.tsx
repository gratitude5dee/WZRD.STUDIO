import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image, Rect, Text as KonvaText, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import type { CanvasObject, ViewportState } from '@/types/canvas';

interface InfiniteCanvasProps {
  projectId: string;
  width: number;
  height: number;
  onObjectSelect?: (objectId: string) => void;
}

// Helper function to check if object is in viewport
const isInViewport = (obj: CanvasObject, viewport: any) => {
  const objBounds = {
    left: obj.transform.x,
    top: obj.transform.y,
    right: obj.transform.x + ((obj.data as any).width || 100),
    bottom: obj.transform.y + ((obj.data as any).height || 100),
  };

  return !(
    objBounds.right < viewport.x ||
    objBounds.left > viewport.x + viewport.width ||
    objBounds.bottom < viewport.y ||
    objBounds.top > viewport.y + viewport.height
  );
};

// Canvas Object Renderer Component
const CanvasObjectRenderer = ({
  object,
  isSelected,
  onSelect,
  onTransformEnd,
}: {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onTransformEnd: (transform: any) => void;
}) => {
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image if type is image
  useEffect(() => {
    if (object.type === 'image' && object.data && 'url' in object.data) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = object.data.url;
      img.onload = () => setImage(img);
    }
  }, [object]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && shapeRef.current && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    onTransformEnd({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and adjust width/height instead
    node.scaleX(1);
    node.scaleY(1);

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      scaleX,
      scaleY,
      rotation: node.rotation(),
    });
  };

  // Render based on object type
  const renderObject = () => {
    const commonProps = {
      ref: shapeRef,
      x: object.transform.x,
      y: object.transform.y,
      scaleX: object.transform.scaleX,
      scaleY: object.transform.scaleY,
      rotation: object.transform.rotation,
      draggable: !object.locked,
      onClick: onSelect,
      onTap: onSelect,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      visible: object.visibility,
    };

    switch (object.type) {
      case 'image':
        if (!image) return null;
        return (
          <Image
            {...commonProps}
            image={image}
            width={(object.data as any).width}
            height={(object.data as any).height}
          />
        );

      case 'shape':
        const shapeData = object.data as any;
        if (shapeData.shapeType === 'rectangle') {
          return (
            <Rect
              {...commonProps}
              width={shapeData.width || 100}
              height={shapeData.height || 100}
              fill={shapeData.fill}
              stroke={shapeData.stroke}
              strokeWidth={shapeData.strokeWidth}
            />
          );
        }
        return null;

      case 'text':
        const textData = object.data as any;
        return (
          <KonvaText
            {...commonProps}
            text={textData.text}
            fontSize={textData.fontSize}
            fontFamily={textData.fontFamily}
            fill={textData.color}
            align={textData.align}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderObject()}
      {isSelected && <Transformer ref={transformerRef} />}
    </>
  );
};

// Main InfiniteCanvas Component
export function InfiniteCanvas({ projectId, width, height, onObjectSelect }: InfiniteCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
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

  // Viewport culling for performance
  const getVisibleObjects = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return objects;

    const viewportBounds = {
      x: -viewport.x / viewport.scale,
      y: -viewport.y / viewport.scale,
      width: stage.width() / viewport.scale,
      height: stage.height() / viewport.scale,
    };

    return objects.filter((obj) => isInViewport(obj, viewportBounds));
  }, [objects, viewport]);

  // Wheel handler for zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = viewport.scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const clampedScale = Math.max(0.1, Math.min(10, newScale));

    setViewport({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  // Pan with drag
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setViewport({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Handle stage click for deselection
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Check if clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      clearSelection();
    }
  };

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

  const visibleObjects = getVisibleObjects();
  const sortedObjects = [...visibleObjects].sort((a, b) => a.layerIndex - b.layerIndex);

  return (
    <div className="relative w-full h-full bg-zinc-900">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
      >
        <Layer>
          {/* Grid background */}
          <Rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="#0A0A0A"
          />

          {/* Render canvas objects */}
          {sortedObjects.map((obj) => (
            <CanvasObjectRenderer
              key={obj.id}
              object={obj}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={() => {
                setSelectedIds([obj.id]);
                onObjectSelect?.(obj.id);
              }}
              onTransformEnd={(transform) => {
                updateTransform(obj.id, transform);
              }}
            />
          ))}
        </Layer>
      </Stage>

      {/* Viewport indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white/60 font-mono">
        Zoom: {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
}

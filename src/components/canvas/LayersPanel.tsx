import { Eye, EyeOff, Lock, Unlock, Trash2, Image, Square, Type, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import type { CanvasObject } from '@/types/canvas';

const getObjectIcon = (type: CanvasObject['type']) => {
  switch (type) {
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'text':
      return Type;
    case 'shape':
      return Square;
    default:
      return Square;
  }
};

const getObjectName = (obj: CanvasObject) => {
  if (obj.type === 'text' && 'text' in obj.data) {
    return obj.data.text.substring(0, 20) || 'Text Layer';
  }
  if (obj.type === 'shape' && 'shapeType' in obj.data) {
    return obj.data.shapeType.charAt(0).toUpperCase() + obj.data.shapeType.slice(1);
  }
  return `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} Layer`;
};

export function LayersPanel() {
  const {
    objects,
    selectedIds,
    setSelectedIds,
    updateObject,
    removeObject,
    bringToFront,
    sendToBack,
  } = useCanvasStore();

  const sortedObjects = [...objects].sort((a, b) => b.layerIndex - a.layerIndex);

  const handleToggleVisibility = (obj: CanvasObject) => {
    updateObject(obj.id, { visibility: !obj.visibility });
  };

  const handleToggleLock = (obj: CanvasObject) => {
    updateObject(obj.id, { locked: !obj.locked });
  };

  const handleDelete = (obj: CanvasObject) => {
    removeObject(obj.id);
  };

  const handleSelect = (obj: CanvasObject) => {
    setSelectedIds([obj.id]);
  };

  return (
    <div className="w-80 h-full bg-[#0A0A0A] border-l border-white/[0.08] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <h3 className="text-sm font-semibold text-white">Layers</h3>
        <p className="text-xs text-white/40 mt-0.5">{objects.length} layers</p>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedObjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Square className="w-8 h-8 text-white/20 mb-2" />
              <p className="text-sm text-white/40">No layers yet</p>
              <p className="text-xs text-white/30 mt-1">Add objects to the canvas</p>
            </div>
          ) : (
            sortedObjects.map((obj) => {
              const Icon = getObjectIcon(obj.type);
              const isSelected = selectedIds.includes(obj.id);
              const name = getObjectName(obj);

              return (
                <div
                  key={obj.id}
                  onClick={() => handleSelect(obj)}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white/[0.12] text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded ${
                      isSelected ? 'bg-purple-500/20' : 'bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-white/30">Layer {obj.layerIndex}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(obj);
                      }}
                      className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                    >
                      {obj.visibility ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(obj);
                      }}
                      className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/[0.08]"
                    >
                      {obj.locked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(obj);
                      }}
                      className="h-7 w-7 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/[0.08]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Layer Order Controls */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedIds.forEach((id) => bringToFront(id))}
              className="flex-1 h-8 text-xs border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.08]"
            >
              Bring to Front
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedIds.forEach((id) => sendToBack(id))}
              className="flex-1 h-8 text-xs border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.08]"
            >
              Send to Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

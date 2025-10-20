export interface NodePosition {
  x: number;
  y: number;
}

export interface PlacementOptions {
  sourcePosition: NodePosition;
  sourceType: 'text' | 'image' | 'video';
  targetType: 'text' | 'image' | 'video';
  existingNodes?: Array<{ position: NodePosition }>;
  canvasViewport?: { x: number; y: number; zoom: number };
}

const NODE_SPACING = 450;
const MIN_DISTANCE = 350;
const GRID_SNAP = 50;

/**
 * Calculate smart position for a new connected node
 */
export const calculateSmartPosition = ({
  sourcePosition,
  sourceType,
  targetType,
  existingNodes = [],
  canvasViewport = { x: 0, y: 0, zoom: 1 },
}: PlacementOptions): NodePosition => {
  // Determine preferred direction based on block types
  const preferredDirection = getPreferredDirection(sourceType, targetType);
  
  // Calculate base position
  let newPosition = calculatePositionInDirection(
    sourcePosition,
    preferredDirection,
    NODE_SPACING
  );
  
  // Check for collisions and adjust
  newPosition = avoidCollisions(newPosition, existingNodes, MIN_DISTANCE);
  
  // Snap to grid for clean alignment
  newPosition = snapToGrid(newPosition, GRID_SNAP);
  
  return newPosition;
};

/**
 * Determine the preferred direction for node placement
 */
function getPreferredDirection(
  sourceType: string,
  targetType: string
): 'right' | 'bottom' | 'bottom-right' {
  // Text -> Image/Video: typically flows right
  if (sourceType === 'text' && (targetType === 'image' || targetType === 'video')) {
    return 'right';
  }
  
  // Image -> Text/Video: can go right or bottom
  if (sourceType === 'image') {
    return targetType === 'text' ? 'right' : 'bottom';
  }
  
  // Video -> Text: typically for transcription, goes right
  if (sourceType === 'video' && targetType === 'text') {
    return 'right';
  }
  
  // Default: right placement
  return 'right';
}

/**
 * Calculate position in a given direction
 */
function calculatePositionInDirection(
  source: NodePosition,
  direction: 'right' | 'bottom' | 'bottom-right',
  spacing: number
): NodePosition {
  switch (direction) {
    case 'right':
      return { x: source.x + spacing, y: source.y };
    case 'bottom':
      return { x: source.x, y: source.y + spacing };
    case 'bottom-right':
      return { 
        x: source.x + spacing * 0.7, 
        y: source.y + spacing * 0.7 
      };
    default:
      return { x: source.x + spacing, y: source.y };
  }
}

/**
 * Avoid collisions with existing nodes
 */
function avoidCollisions(
  position: NodePosition,
  existingNodes: Array<{ position: NodePosition }>,
  minDistance: number
): NodePosition {
  let adjustedPosition = { ...position };
  let attempts = 0;
  const maxAttempts = 8;
  
  while (attempts < maxAttempts) {
    const hasCollision = existingNodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - adjustedPosition.x, 2) +
        Math.pow(node.position.y - adjustedPosition.y, 2)
      );
      return distance < minDistance;
    });
    
    if (!hasCollision) {
      break;
    }
    
    // Try different offset strategies
    const offset = (attempts + 1) * 100;
    const angle = (attempts * Math.PI) / 4;
    adjustedPosition = {
      x: position.x + Math.cos(angle) * offset,
      y: position.y + Math.sin(angle) * offset,
    };
    
    attempts++;
  }
  
  return adjustedPosition;
}

/**
 * Snap position to grid for alignment
 */
function snapToGrid(position: NodePosition, gridSize: number): NodePosition {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Calculate positions for multiple spawned nodes in a grid
 */
export const calculateGridPositions = (
  basePosition: NodePosition,
  count: number,
  spacing: number = NODE_SPACING,
  columns: number = 3
): NodePosition[] => {
  const positions: NodePosition[] = [];
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    positions.push({
      x: basePosition.x + (col * spacing),
      y: basePosition.y + ((row + 1) * spacing),
    });
  }
  
  return positions;
};

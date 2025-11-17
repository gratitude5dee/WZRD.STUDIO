/**
 * Connection Manager Utility
 * Handles connection validation, path calculations, and Bezier curve generation
 */

import { studioLayout, studioTheme } from './theme';
import type { Node, Edge } from '@xyflow/react';

export interface ConnectionPort {
  id: string;
  type: 'text' | 'image' | 'video' | 'data';
  position: 'left' | 'right' | 'top' | 'bottom';
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface CanvasTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface BezierPath {
  path: string;
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
}

/**
 * Validates if a connection between two ports is allowed
 */
export function validateConnection(
  sourceType: string,
  targetType: string
): boolean {
  // Any can connect to anything
  if (sourceType === 'any' || targetType === 'any') return true;
  
  // Same types can always connect
  if (sourceType === targetType) return true;
  
  // Text can flow into image/video generation
  if (sourceType === 'text' && (targetType === 'image' || targetType === 'video')) {
    return true;
  }
  
  // Image can flow into video generation
  if (sourceType === 'image' && targetType === 'video') {
    return true;
  }
  
  return false;
}

/**
 * Get the color for a connection based on data type
 */
export function getConnectionColor(dataType: string): string {
  switch (dataType) {
    case 'text':
      return studioTheme.connections.text;
    case 'image':
      return studioTheme.connections.image;
    case 'video':
      return studioTheme.connections.video;
    case 'data':
      return studioTheme.connections.data;
    default:
      return studioTheme.connections.default;
  }
}

/**
 * Calculate port position in canvas coordinates
 */
export function getPortPosition(
  node: Node,
  portId: string,
  portSide: 'input' | 'output',
  transform: CanvasTransform
): { x: number; y: number } {
  const nodeX = node.position.x * transform.zoom + transform.x;
  const nodeY = node.position.y * transform.zoom + transform.y;
  
  // Assuming node width is default from layout
  const nodeWidth = studioLayout.node.defaultWidth;
  const headerHeight = studioLayout.node.headerHeight;
  const portSize = studioLayout.node.portSize;
  const portGap = studioLayout.node.portGap;
  
  // Find port index (simplified - in real implementation, get from node data)
  const portIndex = 0; // This should be calculated from actual port position
  
  const portY = nodeY + 
    headerHeight * transform.zoom + 
    12 * transform.zoom + 
    portIndex * (portSize + portGap) * transform.zoom;
  
  const portX = portSide === 'input'
    ? nodeX
    : nodeX + nodeWidth * transform.zoom;
  
  return { x: portX, y: portY };
}

/**
 * Calculate Bezier curve path for connection
 * Uses cubic Bezier curves with horizontal control points
 */
export function calculateBezierPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): BezierPath {
  const dx = targetX - sourceX;
  const curveDistance = Math.abs(dx) * studioLayout.connection.curveStrength;
  
  const controlPoint1 = {
    x: sourceX + curveDistance,
    y: sourceY,
  };
  
  const controlPoint2 = {
    x: targetX - curveDistance,
    y: targetY,
  };
  
  const path = `
    M ${sourceX} ${sourceY}
    C ${controlPoint1.x} ${controlPoint1.y},
      ${controlPoint2.x} ${controlPoint2.y},
      ${targetX} ${targetY}
  `;
  
  return {
    path: path.trim(),
    controlPoint1,
    controlPoint2,
  };
}

/**
 * Calculate the midpoint of a Bezier curve for label positioning
 */
export function getBezierMidpoint(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const bezier = calculateBezierPath(sourceX, sourceY, targetX, targetY);
  
  // At t=0.5, calculate point on cubic Bezier curve
  const t = 0.5;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  
  const x = mt3 * sourceX +
    3 * mt2 * t * bezier.controlPoint1.x +
    3 * mt * t2 * bezier.controlPoint2.x +
    t3 * targetX;
  
  const y = mt3 * sourceY +
    3 * mt2 * t * bezier.controlPoint1.y +
    3 * mt * t2 * bezier.controlPoint2.y +
    t3 * targetY;
  
  return { x, y };
}

/**
 * Check if a point is near a Bezier curve (for click detection)
 */
export function isPointNearBezierCurve(
  pointX: number,
  pointY: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  threshold: number = 8
): boolean {
  const bezier = calculateBezierPath(sourceX, sourceY, targetX, targetY);
  
  // Sample points along the curve
  const samples = 20;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    const x = mt3 * sourceX +
      3 * mt2 * t * bezier.controlPoint1.x +
      3 * mt * t2 * bezier.controlPoint2.x +
      t3 * targetX;
    
    const y = mt3 * sourceY +
      3 * mt2 * t * bezier.controlPoint1.y +
      3 * mt * t2 * bezier.controlPoint2.y +
      t3 * targetY;
    
    const distance = Math.sqrt((pointX - x) ** 2 + (pointY - y) ** 2);
    if (distance <= threshold) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get stroke width based on connection state
 */
export function getConnectionStrokeWidth(
  isSelected: boolean,
  isHovered: boolean,
  status?: 'idle' | 'active' | 'success' | 'error'
): number {
  if (status === 'active') {
    return studioLayout.connection.strokeWidthSelected;
  }
  if (isSelected) {
    return studioLayout.connection.strokeWidthSelected;
  }
  if (isHovered) {
    return studioLayout.connection.strokeWidthHover;
  }
  return studioLayout.connection.strokeWidth;
}

/**
 * Create a new connection edge with proper data
 */
export function createConnectionEdge(
  sourceNodeId: string,
  sourceHandleId: string,
  targetNodeId: string,
  targetHandleId: string,
  dataType: 'text' | 'image' | 'video' | 'data'
): Edge {
  return {
    id: `${sourceNodeId}-${sourceHandleId}-${targetNodeId}-${targetHandleId}`,
    source: sourceNodeId,
    sourceHandle: sourceHandleId,
    target: targetNodeId,
    targetHandle: targetHandleId,
    type: 'bezier',
    data: {
      dataType,
      status: 'idle',
    },
  };
}

/**
 * Screen to canvas coordinate conversion
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  transform: CanvasTransform
): NodePosition {
  return {
    x: (screenX - transform.x) / transform.zoom,
    y: (screenY - transform.y) / transform.zoom,
  };
}

/**
 * Canvas to screen coordinate conversion
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  transform: CanvasTransform
): NodePosition {
  return {
    x: canvasX * transform.zoom + transform.x,
    y: canvasY * transform.zoom + transform.y,
  };
}

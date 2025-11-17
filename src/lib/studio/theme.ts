/**
 * Studio Theme System - Pixel-Perfect Design Specifications
 * Inspired by ComfyUI/Blender node editors
 */

export const studioTheme = {
  // Backgrounds
  bg: {
    canvas: '#000000',           // Pure black canvas
    primary: '#0A0A0A',          // Slightly lighter black
    secondary: '#1A1A1A',        // Panel backgrounds
    tertiary: '#242424',         // Node backgrounds
    elevated: '#2A2A2A',         // Hover states
    node: '#1F1F1F',             // Individual node background
    nodeHeader: '#2D2D2D',       // Node header background
  },
  
  // Borders & Dividers
  border: {
    canvas: '#1A1A1A',           // Canvas grid lines
    subtle: '#2A2A2A',           // Subtle dividers
    default: '#3A3A3A',          // Default borders
    node: '#404040',             // Node borders
    nodeHover: '#505050',        // Node hover border
    nodeSelected: '#8B5CF6',     // Selected node (purple)
    connection: '#4A4A4A',       // Connection lines default
  },
  
  // Text
  text: {
    primary: '#FFFFFF',          // Primary text
    secondary: '#A0A0A0',        // Secondary text
    tertiary: '#707070',         // Tertiary/muted text
    disabled: '#505050',         // Disabled text
    nodeName: '#FFFFFF',         // Node name text
    nodeModel: '#808080',        // Model name text
  },
  
  // Accents & Node Types
  accent: {
    primary: '#50EF12',          // Green (success, active)
    purple: '#8B5CF6',           // Purple (selection, focus)
    blue: '#3B82F6',             // Blue (info)
    orange: '#F59E0B',           // Orange (warning)
    red: '#EF4444',              // Red (error)
  },
  
  // Connection Colors (by type)
  connections: {
    text: '#60A5FA',             // Blue for text data
    image: '#A78BFA',            // Purple for images
    video: '#F472B6',            // Pink for video
    data: '#10B981',             // Green for generic data
    default: '#6B7280',          // Gray for unknown
  },
  
  // Node Type Colors (subtle background tints)
  nodeTypes: {
    text: 'rgba(59, 130, 246, 0.05)',      // Blue tint
    image: 'rgba(139, 92, 246, 0.05)',     // Purple tint
    video: 'rgba(244, 114, 182, 0.05)',    // Pink tint
    utility: 'rgba(107, 114, 128, 0.05)',  // Gray tint
  },
} as const;

export const studioTypography = {
  fontFamily: {
    sans: '"Inter", "SF Pro Display", -apple-system, sans-serif',
    mono: '"Fira Code", "SF Mono", "Consolas", monospace',
  },
  
  fontSize: {
    xs: '10px',       // Tiny labels, connection ports
    sm: '11px',       // Node model names, secondary info
    base: '12px',     // Node names, body text
    md: '13px',       // Panel headers
    lg: '14px',       // Section titles
    xl: '16px',       // Page title
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const studioLayout = {
  // Header
  header: {
    height: 56,
    padding: 16,
  },
  
  // Left Sidebar (Icon Bar)
  sidebar: {
    width: 56,
    iconSize: 24,
    iconPadding: 16,
    gap: 8,
  },
  
  // Panels (slide-out from left)
  panel: {
    width: 360,
    maxWidth: 480,
    padding: 20,
    headerHeight: 48,
  },
  
  // Nodes
  node: {
    minWidth: 200,
    maxWidth: 400,
    defaultWidth: 280,
    minHeight: 120,
    padding: 12,
    borderRadius: 8,
    headerHeight: 32,
    portSize: 12,
    portGap: 8,
  },
  
  // Connections
  connection: {
    strokeWidth: 2,
    strokeWidthHover: 3,
    strokeWidthSelected: 4,
    curveStrength: 0.5, // Bezier curve strength
  },
  
  // Canvas
  canvas: {
    gridSize: 20,         // Grid cell size in pixels
    gridOpacity: 0.1,     // Grid line opacity
    minZoom: 0.1,         // 10%
    maxZoom: 2.0,         // 200%
    defaultZoom: 1.0,     // 100%
  },
} as const;

// Animation keyframes
export const studioAnimations = {
  keyframes: {
    pulse: `
      @keyframes studio-pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);
        }
      }
    `,
    runningGlow: `
      @keyframes studio-running-glow {
        0%, 100% {
          border-color: #50EF12;
          box-shadow: 0 0 8px rgba(80, 239, 18, 0.3);
        }
        50% {
          border-color: #50EF12;
          box-shadow: 0 0 16px rgba(80, 239, 18, 0.6);
        }
      }
    `,
    flow: `
      @keyframes studio-flow {
        0% {
          stroke-dasharray: 8, 8;
          stroke-dashoffset: 0;
        }
        100% {
          stroke-dashoffset: 16;
        }
      }
    `,
    slideInLeft: `
      @keyframes studio-slide-in-left {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
    slideInRight: `
      @keyframes studio-slide-in-right {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
    fadeIn: `
      @keyframes studio-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  },
  
  timing: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Interaction states
export const interactionStates = {
  node: {
    idle: {
      cursor: 'move',
      borderWidth: 1,
      opacity: 1,
    },
    hover: {
      cursor: 'move',
      borderWidth: 1,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    selected: {
      borderWidth: 2,
      borderColor: studioTheme.accent.purple,
      boxShadow: `0 0 0 3px ${studioTheme.accent.purple}40`,
    },
    dragging: {
      cursor: 'grabbing',
      opacity: 0.8,
      zIndex: 1000,
    },
    running: {
      borderColor: studioTheme.accent.primary,
      animation: 'studio-running-glow 2s infinite',
    },
  },
  
  connection: {
    idle: {
      opacity: 0.6,
      strokeWidth: 2,
    },
    hover: {
      opacity: 0.9,
      strokeWidth: 3,
      cursor: 'pointer',
    },
    selected: {
      opacity: 1,
      strokeWidth: 4,
      filter: 'drop-shadow(0 0 4px currentColor)',
    },
  },
  
  port: {
    idle: {
      transform: 'scale(1)',
      cursor: 'crosshair',
    },
    hover: {
      transform: 'scale(1.3)',
      boxShadow: '0 0 8px currentColor',
    },
    connecting: {
      transform: 'scale(1.5)',
      boxShadow: '0 0 12px currentColor',
      animation: 'studio-pulse 1s infinite',
    },
  },
} as const;

// Exact measurements for pixel-perfect implementation
export const exactMeasurements = {
  // Node dimensions
  nodeWidth: 280,
  nodeMinHeight: 120,
  nodePadding: 12,
  nodeBorderRadius: 8,
  nodeHeaderHeight: 32,
  
  // Port dimensions
  portSize: 12,
  portBorderWidth: 2,
  portGap: 8,
  
  // Connection dimensions
  connectionStrokeWidth: 2,
  connectionStrokeWidthHover: 3,
  connectionStrokeWidthSelected: 4,
  connectionHitArea: 12, // Invisible wider path for easier clicking
  
  // Grid
  gridSize: 20,
  gridOpacity: 0.1,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
} as const;

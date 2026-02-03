// Editor Theme Configuration - Unified Design System
export const editorTheme = {
  // Backgrounds - Unified with Project Setup
  bg: {
    primary: '#0A0A0F',      // Main background (unified)
    secondary: '#0F0F14',    // Panel backgrounds
    tertiary: '#161620',     // Elevated elements
    hover: '#1A1A24',        // Hover states
    active: '#222230',       // Active/selected states
  },
  
  // Borders & Dividers
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.1)',
    focus: '#8B5CF6',        // Purple focus
  },
  
  // Text
  text: {
    primary: '#FFFFFF',      // Primary text
    secondary: '#A0A0A0',    // Secondary text
    tertiary: '#707070',     // Tertiary/muted text
    disabled: '#505050',     // Disabled text
  },
  
  // Accents - Purple brand system
  accent: {
    primary: '#8B5CF6',      // Primary purple
    secondary: '#A78BFA',    // Light purple
    tertiary: '#7C3AED',     // Dark purple
  },
  
  // Semantic
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Glass effects
  glass: {
    panel: 'rgba(15, 15, 20, 0.8)',
    blur: '12px',
  },
} as const;

export const layoutDimensions = {
  header: {
    height: 64,
  },
  
  leftSidebar: {
    iconBar: 48,      // Icon navigation bar
    mediaPanel: 320,  // Media library panel
    total: 368,       // 48 + 320
  },
  
  rightSidebar: {
    width: 320,       // Properties panel
  },
  
  timeline: {
    height: 240,      // Timeline panel height
    minHeight: 180,
    maxHeight: 400,
  },
} as const;

export const typography = {
  fontFamily: {
    sans: '"Inter", "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "Consolas", monospace',
  },
  
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const exactMeasurements = {
  header: {
    height: 64,
    paddingX: 20,
    logoSize: 32,
    buttonHeight: 36,
    buttonGap: 12,
    exportButtonPadding: '10px 20px',
  },
  
  iconBar: {
    width: 48,
    iconSize: 24,
    paddingY: 12,
    gap: 8,
    activeBorderWidth: 3,
  },
  
  mediaPanel: {
    width: 320,
    padding: 16,
    searchHeight: 40,
    gridGap: 8,
    imageAspectRatio: '1 / 1',
    imageBorderRadius: 6,
  },
  
  canvas: {
    controlBarHeight: 56,
    controlBarPadding: '12px 16px',
    buttonHeight: 32,
    buttonGap: 8,
    playButtonSize: 40,
    timeDisplayFont: '13px',
  },
  
  timeline: {
    height: 240,
    rulerHeight: 32,
    trackHeight: 64,
    trackHeaderWidth: 120,
    clipMinWidth: 40,
    clipPadding: '4px 8px',
    handleWidth: 8,
    playheadWidth: 2,
    playheadColor: '#FF4444',
  },
  
  propertiesPanel: {
    width: 320,
    padding: 16,
    sectionGap: 24,
    labelMarginBottom: 8,
    fieldHeight: 36,
    fieldGap: 12,
    colorSwatchSize: 36,
    colorSwatchBorder: 2,
  },
} as const;

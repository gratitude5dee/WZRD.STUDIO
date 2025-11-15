export const EDITOR_COLORS = {
  // Backgrounds
  bgPrimary: 'hsl(0, 0%, 4%)',       // #0a0a0a - gray-950
  bgSecondary: 'hsl(0, 0%, 10%)',    // #1a1a1a - gray-900
  bgTertiary: 'hsl(0, 0%, 16%)',     // #2a2a2a - gray-800
  
  // Borders
  border: 'hsl(0, 0%, 16%)',         // #2a2a2a
  borderLight: 'hsl(0, 0%, 23%)',    // #3a3a3a
  
  // Text
  textPrimary: 'hsl(0, 0%, 100%)',   // #ffffff
  textSecondary: 'hsl(220, 9%, 68%)', // #9ca3af
  textMuted: 'hsl(220, 9%, 46%)',    // #6b7280
  
  // Accents
  accentGreen: 'hsl(158, 64%, 52%)',   // #10b981 - Export button
  activeGreen: 'hsl(105, 100%, 53%)',  // #50FF12 - Active text color
  activePurple: 'hsl(269, 100%, 53%)', // #7E12FF - Active fill color
  playheadGreen: 'hsl(158, 64%, 52%)', // #10b981 - Timeline playhead
  
  // States
  hover: 'hsla(0, 0%, 100%, 0.05)',
  selected: 'hsl(105, 100%, 53%)',     // #50FF12
} as const;

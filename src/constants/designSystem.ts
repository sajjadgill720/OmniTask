/**
 * KNOVERA GLOBAL DESIGN SYSTEM TOKENS
 * Photorealistic Creative Studio Design Language
 * Based on HCI Usability Principles, WCAG 2.2 AA Contrast, and Gestalt Visual Hierarchy.
 */

export const DESIGN_TOKENS = {
  // 1. Color Palette Tokens
  colors: {
    // Studio Materials
    warmCream: '#F6EBDD',
    sand: '#D8C5A8',
    deepCharcoal: '#25231F',
    mutedBrown: '#695747',
    corkTexture: '#C49A6C',
    plasterWall: '#EFE7DA',

    // Authentic Sticky Note Palette
    stickyCanary: '#F8D979',
    stickyPeach: '#F1A6A6',
    stickyMint: '#C6DF9C',
    stickySky: '#A9C9E9',
    stickyLavender: '#D7B7EE',
    stickySage: '#A8C3B2',
    stickyWhite: '#FAF7F2',

    // Semantic Accents
    accentGold: '#E5A93C',
    accentAmber: '#F59E0B',
    accentRose: '#E11D48',
    accentEmerald: '#10B981',
    accentIndigo: '#6366F1',

    // Dark Glass Navigation
    darkGlassBg: 'rgba(28, 25, 23, 0.72)',
    darkGlassBorder: 'rgba(255, 255, 255, 0.12)',
    darkGlassGlow: 'rgba(245, 158, 11, 0.15)',
  },

  // 2. Elevation & Physical Depth Shadows
  shadows: {
    // Natural physical paper elevations
    paperFlat: '0 2px 4px rgba(45, 30, 15, 0.08), 0 1px 2px rgba(45, 30, 15, 0.05)',
    paperResting: '0 8px 18px -4px rgba(45, 30, 15, 0.16), 0 3px 6px -2px rgba(45, 30, 15, 0.08)',
    paperHover: '0 18px 30px -6px rgba(45, 30, 15, 0.24), 0 8px 12px -3px rgba(45, 30, 15, 0.12)',
    paperDragged: '0 25px 45px -8px rgba(45, 30, 15, 0.32), 0 12px 18px -4px rgba(45, 30, 15, 0.16)',
    
    // Polaroids
    polaroidShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.22), 0 4px 8px -2px rgba(0, 0, 0, 0.12)',
    
    // Glass Modals & Drawers
    floatingPanel: '0 24px 60px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
    sunlightBeam: 'radial-gradient(ellipse at 15% 10%, rgba(255, 248, 220, 0.35) 0%, rgba(255, 240, 200, 0.12) 45%, transparent 75%)',
  },

  // 3. Typography Scale & Fonts
  typography: {
    fontHandwriting: "'Caveat', 'Kalam', 'Patrick Hand', cursive",
    fontEditorial: "'Playfair Display', Georgia, serif",
    fontInterface: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // 4. Border Radii Tokens
  radii: {
    sm: '0.375rem',  // 6px
    md: '0.625rem',  // 10px
    lg: '0.875rem',  // 14px
    xl: '1.25rem',   // 20px
    '2xl': '1.75rem',// 28px
    full: '9999px',
  },

  // 5. Z-Index Layer Hierarchy (Error-Proof Stacking)
  zIndex: {
    wallBackground: 0,
    ambientLight: 1,
    canvasGrid: 5,
    canvasLines: 10,
    canvasElements: 20,
    canvasSelected: 30,
    canvasOverlayControls: 40,
    floatingToolbars: 45,
    sidebar: 50,
    rightPanel: 50,
    drawers: 60,
    modals: 70,
    confirmDialogs: 80,
    toasts: 90,
    tooltips: 100,
  },

  // 6. Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;


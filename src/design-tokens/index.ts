/**
 * Design Tokens Unificados - Sistema de Design Casa do Amor
 * 
 * Centraliza todas as decisões de design em um único lugar:
 * - Cores (light/dark)
 * - Tipografia
 * - Espaçamentos
 * - Sombras
 * - Border radius
 * - Transições
 * - Z-index
 * 
 * Garante consistência visual e facilita manutenção e escalabilidade.
 */

// ============================================================================
// CORES BASE - Paleta da marca Casa do Amor
// ============================================================================

export const brandColors = {
  // Azul escuro institucional (cor primária)
  primary: {
    50: '#E3E8F0',
    100: '#C5D1E1',
    200: '#9FB3CD',
    300: '#7A95B9',
    400: '#5477A5',
    500: '#09244B', // Main brand color (light)
    600: '#071C3C',
    700: '#05142D',
    800: '#040C1E',
    900: '#02040F',
  },
  
  // Azul claro (cor secundária/accent)
  secondary: {
    50: '#E8F4F9',
    100: '#D1E9F3',
    200: '#A3D3E7',
    300: '#75BDDB',
    400: '#47A7CF',
    500: '#65ACD6', // Main secondary
    600: '#4F8AAB',
    700: '#396880',
    800: '#244655',
    900: '#0E242A',
  },
  
  // Azul muito claro (backgrounds suaves)
  light: {
    50: '#F5FAFC',
    100: '#EBF5F9',
    200: '#D7EBF3',
    300: '#C3E1ED',
    400: '#AFD7E7',
    500: '#C5E4F2', // Main light
    600: '#9DB6C2',
    700: '#758892',
    800: '#4D5A62',
    900: '#252C32',
  },
  
  // Azul escuro para footer
  dark: {
    50: '#1A3A5A',
    100: '#173350',
    200: '#142C46',
    300: '#11253C',
    400: '#0E1E32',
    500: '#0D2E4D', // Main dark
    600: '#0A253D',
    700: '#081C2D',
    800: '#05131D',
    900: '#020A0D',
  },
} as const;

// ============================================================================
// CORES SEMÂNTICAS (funcionam em light e dark mode)
// ============================================================================

export const semanticColors = {
  success: {
    light: '#2e7d32',
    dark: '#4caf50',
  },
  error: {
    light: '#d32f2f',
    dark: '#ef5350',
  },
  warning: {
    light: '#ed6c02',
    dark: '#ff9800',
  },
  info: {
    light: '#0288d1',
    dark: '#03a9f4',
  },
} as const;

// ============================================================================
// NEUTROS (grays)
// ============================================================================

export const neutralColors = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
} as const;

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const typography = {
  fontFamily: {
    base: '"Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    md: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.75rem', // 28px
    '4xl': '2rem',    // 32px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// ESPAÇAMENTOS (base 8px)
// ============================================================================

export const spacing = {
  0: 0,
  1: 4,   // 0.25rem
  2: 8,   // 0.5rem
  3: 12,  // 0.75rem
  4: 16,  // 1rem
  5: 20,  // 1.25rem
  6: 24,  // 1.5rem
  8: 32,  // 2rem
  10: 40, // 2.5rem
  12: 48, // 3rem
  16: 64, // 4rem
  20: 80, // 5rem
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  xl: '0px 8px 24px rgba(0, 0, 0, 0.12)',
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  drawer: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const;

// ============================================================================
// TRANSIÇÕES
// ============================================================================

export const transitions = {
  duration: {
    fast: 120,
    standard: 200,
    slow: 300,
    modal: 240,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  },
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// ============================================================================
// TOUCH TARGETS (WCAG 2.2)
// ============================================================================

export const touchTargets = {
  minWidth: 44,
  minHeight: 44,
} as const;

// ============================================================================
// FOCUS (WCAG 2.2)
// ============================================================================

export const focus = {
  outlineWidth: 3,
  outlineOffset: 2,
} as const;

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeMode = 'light' | 'dark';
export type BrandColors = typeof brandColors;
export type SemanticColors = typeof semanticColors;
export type NeutralColors = typeof neutralColors;


/**
 * Design Tokens para o Sistema de Consentimento
 * Garante consistência visual e acessibilidade WCAG 2.2 AA
 */

/**
 * Paleta de cores acessível (contraste mínimo 4.5:1 para texto normal)
 */
export const ConsentColors = {
  // Primárias
  primary: {
    main: '#09244B',      // Azul escuro para botões e links do consentimento
    light: '#315985',
    dark: '#061a33',
    contrast: '#ffffff',
    focus: 'rgba(9, 36, 75, 0.28)', // Focus ring (escuro)
  },
  
  // Estados
  success: {
    main: '#2e7d32',      // Verde (finalidades aceitas)
    light: '#4caf50',
    dark: '#1b5e20',
    contrast: '#ffffff',
  },
  warning: {
    main: '#ed6c02',      // Laranja (avisos)
    light: '#ff9800',
    dark: '#e65100',
    contrast: '#ffffff',
  },
  error: {
    main: '#d32f2f',      // Vermelho (erros)
    light: '#ef5350',
    dark: '#c62828',
    contrast: '#ffffff',
  },
  info: {
    main: '#0288d1',      // Azul claro (informativo)
    light: '#03a9f4',
    dark: '#01579b',
    contrast: '#ffffff',
  },
  
  // Neutros
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },
  
  // Semânticos
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    elevated: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.60)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  
  // Estados de foco (WCAG 2.2 2.4.7 Focus Visible)
  focus: {
    outline: '#09244B',
    outlineWidth: '3px',
    outlineOffset: '2px',
  },
  
  // Borders
  border: {
    default: '#e0e0e0',
    hover: '#bdbdbd',
  },
  
  // Surfaces
  surface: {
    default: '#fafafa',
    hover: '#f5f5f5',
  },
} as const;

/**
 * Tipografia acessível
 */
export const ConsentTypography = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    small: '0.875rem', // 14px (alias)
    base: '1rem',     // 16px (mínimo recomendado WCAG)
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,      // Mínimo recomendado WCAG 1.4.8
    relaxed: 1.75,
  },
} as const;

/**
 * Espaçamentos (múltiplos de 4px para grid de 8px)
 */
export const ConsentSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  // Aliases semânticos
  item: '1rem',   // Espaçamento entre itens
  section: '2rem', // Espaçamento entre seções
} as const;

/**
 * Breakpoints responsivos
 */
export const ConsentBreakpoints = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
} as const;

/**
 * Sombras para elevação
 */
export const ConsentShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

/**
 * Border radius
 */
export const ConsentBorderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',
} as const;

/**
 * Transições suaves
 */
export const ConsentTransitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Z-index layers
 */
export const ConsentZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const;

/**
 * Tamanhos de toque mínimos (WCAG 2.2 2.5.8 Target Size)
 */
export const ConsentTouchTarget = {
  minWidth: '44px',
  minHeight: '44px',
} as const;

/**
 * Tokens específicos do Dialog
 */
export const ConsentDialogTokens = {
  maxWidth: '640px',
  maxHeight: '90vh',
  padding: ConsentSpacing[6],
  borderRadius: ConsentBorderRadius.lg,
  backgroundColor: ConsentColors.background.default,
  
  // Header
  headerPadding: ConsentSpacing[6],
  headerGap: ConsentSpacing[2],
  
  // Body
  bodyPadding: ConsentSpacing[6],
  bodyGap: ConsentSpacing[4],
  
  // Footer
  footerPadding: ConsentSpacing[6],
  footerGap: ConsentSpacing[3],
  
  // Backdrop
  backdropColor: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * Tokens do Toggle de Finalidade
 */
export const ConsentPurposeToggleTokens = {
  padding: ConsentSpacing[4],
  gap: ConsentSpacing[3],
  borderRadius: ConsentBorderRadius.base,
  borderWidth: '1px',
  borderColor: ConsentColors.divider,
  
  // Estados
  hover: {
    backgroundColor: ConsentColors.neutral.gray50,
  },
  focus: {
    outlineColor: ConsentColors.focus.outline,
    outlineWidth: ConsentColors.focus.outlineWidth,
    outlineOffset: ConsentColors.focus.outlineOffset,
  },
  disabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
} as const;

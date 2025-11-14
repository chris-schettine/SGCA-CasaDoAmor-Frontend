/**
 * Sistema de Temas - Light, Dark e Brand
 * 
 * Cria temas Material-UI baseados nos design tokens unificados
 */

import { createTheme, type ThemeOptions } from '@mui/material/styles';
import type { ThemeMode } from './index';
import {
  brandColors,
  semanticColors,
  neutralColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  touchTargets,
  focus,
} from './index';
import './types'; // Importa tipos para estender Theme

// ============================================================================
// FUNÇÃO AUXILIAR: Cria paleta baseada no modo
// ============================================================================

const createPalette = (mode: ThemeMode) => {
  const isDark = mode === 'dark';

  return {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: brandColors.primary[500],
      light: brandColors.primary[400],
      dark: brandColors.primary[600],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.secondary[500],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[600],
      contrastText: '#FFFFFF',
    },
    error: {
      // Em dark mode, usa versão mais clara para melhor contraste
      main: isDark ? semanticColors.error.dark : semanticColors.error.light,
      light: isDark ? '#ff6b6b' : semanticColors.error.dark,
      dark: isDark ? semanticColors.error.light : semanticColors.error.light,
      contrastText: '#FFFFFF',
    },
    warning: {
      // Em dark mode, usa versão mais clara para melhor contraste
      main: isDark ? semanticColors.warning.dark : semanticColors.warning.light,
      light: isDark ? '#ffb84d' : semanticColors.warning.dark,
      dark: isDark ? semanticColors.warning.light : semanticColors.warning.light,
      contrastText: '#FFFFFF',
    },
    info: {
      // Em dark mode, usa versão mais clara para melhor contraste
      main: isDark ? semanticColors.info.dark : semanticColors.info.light,
      light: isDark ? '#4fc3f7' : semanticColors.info.dark,
      dark: isDark ? semanticColors.info.light : semanticColors.info.light,
      contrastText: '#FFFFFF',
    },
    success: {
      // Em dark mode, usa versão mais clara para melhor contraste
      main: isDark ? semanticColors.success.dark : semanticColors.success.light,
      light: isDark ? '#66bb6a' : semanticColors.success.dark,
      dark: isDark ? semanticColors.success.light : semanticColors.success.light,
      contrastText: '#FFFFFF',
    },
    background: {
      // Dark mode: fundo mais escuro para melhor contraste
      default: isDark ? '#121212' : neutralColors[100],
      // Paper: um pouco mais claro que default em dark mode
      paper: isDark ? '#1E1E1E' : '#FFFFFF',
    },
    text: {
      // Dark mode: texto mais claro para contraste adequado (WCAG 2.2 AA)
      primary: isDark ? '#FFFFFF' : neutralColors[900],
      // Secondary: contraste mínimo 4.5:1 em dark mode
      secondary: isDark ? '#B0B0B0' : neutralColors[600],
      // Disabled: ainda visível mas claramente desabilitado
      disabled: isDark ? '#6B6B6B' : neutralColors[500],
    },
    divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  };
};

// ============================================================================
// OPÇÕES BASE DO TEMA
// ============================================================================

const baseThemeOptions: ThemeOptions = {
  breakpoints: {
    values: breakpoints,
  },
  typography: {
    fontFamily: typography.fontFamily.base,
    h1: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize['4xl'],
      },
    },
    h2: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize['3xl'],
      },
    },
    h3: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize['2xl'],
      },
    },
    h4: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.xl,
      },
    },
    h5: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.lg,
      },
    },
    h6: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.base,
      },
    },
    body1: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.base,
      },
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.md,
      },
    },
    button: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'none',
      '@media (min-width:600px)': {
        fontSize: typography.fontSize.md,
      },
    },
  },
  spacing: spacing[2], // Base de 8px
  shape: {
    borderRadius: borderRadius.base,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius.base,
          padding: `${spacing[2]}px ${spacing[4]}px`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          boxShadow: 'none',
          minWidth: 'auto',
          '@media (min-width:600px)': {
            padding: `${spacing[2] + 2}px ${spacing[6]}px`,
            fontSize: typography.fontSize.md,
          },
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: shadows.sm,
          },
        },
        sizeSmall: {
          padding: `${spacing[1] + 2}px ${spacing[3]}px`,
          fontSize: typography.fontSize.xs,
          '@media (min-width:600px)': {
            padding: `${spacing[2]}px ${spacing[4]}px`,
            fontSize: typography.fontSize.sm,
          },
        },
        sizeLarge: {
          padding: `${spacing[2] + 2}px ${spacing[5]}px`,
          fontSize: typography.fontSize.md,
          '@media (min-width:600px)': {
            padding: `${spacing[3]}px ${spacing[8]}px`,
            fontSize: typography.fontSize.lg,
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: neutralColors[300],
            },
            '&:hover fieldset': {
              borderColor: brandColors.primary[500],
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.primary[500],
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: brandColors.primary[500],
          color: '#FFFFFF',
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.xs,
          padding: `${spacing[3]}px ${spacing[2]}px`,
          '@media (min-width:600px)': {
            fontSize: typography.fontSize.md,
            padding: `${spacing[4]}px`,
          },
        },
        root: {
          padding: `${spacing[3]}px ${spacing[2]}px`,
          fontSize: typography.fontSize.sm,
          '@media (min-width:600px)': {
            padding: `${spacing[4]}px`,
            fontSize: typography.fontSize.md,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: neutralColors[50],
          },
          '&:hover': {
            backgroundColor: neutralColors[100],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: shadows.md,
        },
        elevation1: {
          boxShadow: shadows.sm,
        },
        elevation2: {
          boxShadow: shadows.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: shadows.md,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: shadows.sm,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          minHeight: `${touchTargets.minHeight}px`,
          minWidth: `${touchTargets.minWidth}px`,
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${brandColors.primary[500]}`,
            outlineOffset: `${focus.outlineOffset}px`,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: `${touchTargets.minWidth}px`,
          minHeight: `${touchTargets.minHeight}px`,
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${brandColors.primary[500]}`,
            outlineOffset: `${focus.outlineOffset}px`,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${brandColors.primary[500]}`,
            outlineOffset: `${focus.outlineOffset}px`,
            borderRadius: `${borderRadius.sm}px`,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
    },
  },
};

// ============================================================================
// CRIAÇÃO DOS TEMAS
// ============================================================================

export const createAppTheme = (mode: ThemeMode = 'light') => {
  const palette = createPalette(mode);
  
  return createTheme({
    ...baseThemeOptions,
    palette,
    // Adiciona tokens customizados ao tema para acesso via theme.custom
    custom: {
      brandColors,
      semanticColors,
      neutralColors,
      typography,
      spacing,
      borderRadius,
      shadows,
      transitions,
      breakpoints,
      touchTargets,
      focus,
    },
  });
};

// Exporta temas pré-criados
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Exporta tema padrão (light)
export const theme = lightTheme;


/**
 * Sistema de Temas - Light, Dark e Brand
 * 
 * Cria temas Material-UI baseados nos design tokens unificados
 */

import { alpha, createTheme, type ThemeOptions, type PaletteOptions } from '@mui/material/styles';
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

const createPalette = (mode: ThemeMode): PaletteOptions => {
  const isDark = mode === 'dark';

  const backgroundDefault = isDark ? '#0F172A' : neutralColors[100];
  const backgroundPaper = isDark ? '#1E2538' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : neutralColors[900];
  const textSecondary = isDark ? '#CBD5F5' : neutralColors[600];
  const textDisabled = isDark ? '#64748B' : neutralColors[500];

  return {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: isDark ? '#3B5FBF' : brandColors.primary[500],
      light: isDark ? '#5272c6' : brandColors.primary[400],
      dark: isDark ? '#2a4495' : brandColors.primary[600],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.secondary[500],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[600],
      contrastText: '#FFFFFF',
    },
    error: {
      main: isDark ? semanticColors.error.dark : semanticColors.error.light,
      light: isDark ? '#ff6b6b' : semanticColors.error.dark,
      dark: isDark ? semanticColors.error.light : semanticColors.error.light,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: isDark ? semanticColors.warning.dark : semanticColors.warning.light,
      light: isDark ? '#ffb84d' : semanticColors.warning.dark,
      dark: isDark ? semanticColors.warning.light : semanticColors.warning.light,
      contrastText: '#FFFFFF',
    },
    info: {
      main: isDark ? semanticColors.info.dark : semanticColors.info.light,
      light: isDark ? '#4fc3f7' : semanticColors.info.dark,
      dark: isDark ? semanticColors.info.light : semanticColors.info.light,
      contrastText: '#FFFFFF',
    },
    success: {
      main: isDark ? semanticColors.success.dark : semanticColors.success.light,
      light: isDark ? '#66bb6a' : semanticColors.success.dark,
      dark: isDark ? semanticColors.success.light : semanticColors.success.light,
      contrastText: '#FFFFFF',
    },
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textDisabled,
    },
    divider: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(0, 0, 0, 0.12)',
    action: {
      hover: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      selected: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(0, 0, 0, 0.08)',
      focus: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(0, 0, 0, 0.12)',
      active: isDark ? textPrimary : neutralColors[800],
      disabled: isDark ? 'rgba(148, 163, 184, 0.38)' : 'rgba(0, 0, 0, 0.26)',
      disabledBackground: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
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
        root: ({ theme }) => ({
          textTransform: 'none',
          borderRadius: borderRadius.base,
          padding: `${spacing[2]}px ${spacing[4]}px`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          boxShadow: 'none',
          minWidth: 'auto',
          color: theme.palette.mode === 'dark' ? theme.palette.getContrastText(theme.palette.primary.main) : undefined,
          '@media (min-width:600px)': {
            padding: `${spacing[2] + 2}px ${spacing[6]}px`,
            fontSize: typography.fontSize.md,
          },
          '&:hover': {
            boxShadow: 'none',
          },
        }),
        contained: ({ theme }) => ({
          color: theme.palette.getContrastText(theme.palette.primary.main),
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows.sm,
          },
        }),
        outlined: ({ theme }) => ({
          color: theme.palette.text.primary,
          borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.4) : undefined,
          '&:hover': {
            borderColor: theme.palette.text.primary,
            backgroundColor: theme.palette.action.hover,
          },
        }),
        text: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
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
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.3)
                  : neutralColors[300],
            },
            '&:hover fieldset': {
              borderColor: brandColors.primary[500],
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.primary[500],
            },
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : undefined,
          },
          '& .MuiInputLabel-root': {
            color: theme.palette.text.secondary,
          },
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : brandColors.primary[500],
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.text.primary
              : '#FFFFFF',
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.xs,
          padding: `${spacing[3]}px ${spacing[2]}px`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          '@media (min-width:600px)': {
            fontSize: typography.fontSize.md,
            padding: `${spacing[4]}px`,
          },
        }),
        root: ({ theme }) => ({
          padding: `${spacing[3]}px ${spacing[2]}px`,
          fontSize: typography.fontSize.sm,
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          '@media (min-width:600px)': {
            padding: `${spacing[4]}px`,
            fontSize: typography.fontSize.md,
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:nth-of-type(odd)': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha('#94A3B8', 0.08)
                : neutralColors[50],
          },
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha('#94A3B8', 0.16)
                : neutralColors[100],
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows.md,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        }),
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
        root: ({ theme }) => ({
          borderRadius: borderRadius.md,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows.md,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: borderRadius.md,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: shadows.sm,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.85)
              : brandColors.secondary[500],
          color: theme.palette.getContrastText(brandColors.secondary[500]),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: borderRadius.xl,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.15)
              : undefined,
          color: theme.palette.text.primary,
          border: theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : undefined,
        }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: `${touchTargets.minHeight}px`,
          minWidth: `${touchTargets.minWidth}px`,
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${theme.palette.primary.main}`,
            outlineOffset: `${focus.outlineOffset}px`,
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          minWidth: `${touchTargets.minWidth}px`,
          minHeight: `${touchTargets.minHeight}px`,
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${theme.palette.primary.main}`,
            outlineOffset: `${focus.outlineOffset}px`,
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:focus-visible': {
            outline: `${focus.outlineWidth}px solid ${theme.palette.primary.main}`,
            outlineOffset: `${focus.outlineOffset}px`,
            borderRadius: `${borderRadius.sm}px`,
          },
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '@global': {
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      }),
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


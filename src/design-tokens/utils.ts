/**
 * Utilitários para trabalhar com Design Tokens
 * 
 * Funções helper para facilitar o uso de tokens nos componentes
 */

import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para acessar tokens customizados do tema
 */
export const useDesignTokens = () => {
  const theme = useTheme<Theme>();
  return theme.custom;
};

/**
 * Hook para acessar cores da marca
 */
export const useBrandColors = () => {
  const tokens = useDesignTokens();
  return tokens.brandColors;
};

/**
 * Hook para acessar cores semânticas
 */
export const useSemanticColors = () => {
  const tokens = useDesignTokens();
  return tokens.semanticColors;
};

// ============================================================================
// FUNÇÕES HELPER
// ============================================================================

/**
 * Converte valor de spacing (número) para string com px
 */
export const spacingToPx = (value: number): string => `${value}px`;

/**
 * Converte valor de spacing (número) para string com rem
 */
export const spacingToRem = (value: number, base = 16): string => `${value / base}rem`;

/**
 * Obtém cor do tema baseada no modo (light/dark)
 */
export const getThemeColor = (
  theme: Theme,
  lightColor: string,
  darkColor: string
): string => {
  return theme.palette.mode === 'dark' ? darkColor : lightColor;
};

/**
 * Obtém cor de texto baseada no modo do tema
 */
export const getTextColor = (theme: Theme, variant: 'primary' | 'secondary' | 'disabled' = 'primary'): string => {
  return theme.palette.text[variant];
};

/**
 * Obtém cor de background baseada no modo do tema
 */
export const getBackgroundColor = (theme: Theme, variant: 'default' | 'paper' = 'default'): string => {
  return theme.palette.background[variant];
};


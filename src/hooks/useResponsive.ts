/**
 * Hook para responsividade e breakpoints
 * 
 * Fornece utilitários consistentes para trabalhar com breakpoints
 * e melhorar a responsividade em toda a aplicação
 */

import { useTheme, useMediaQuery } from '@mui/material';

export interface ResponsiveBreakpoints {
  isXs: boolean;      // 0px - mobile portrait
  isSm: boolean;      // 600px - mobile landscape / tablet portrait
  isMd: boolean;      // 900px - tablet landscape
  isLg: boolean;      // 1200px - desktop
  isXl: boolean;      // 1536px - large desktop
  isMobile: boolean;  // < 600px
  isTablet: boolean;  // 600px - 900px
  isDesktop: boolean; // >= 900px
}

/**
 * Hook para acessar breakpoints responsivos de forma consistente
 * 
 * @returns Objeto com flags de breakpoints e helpers
 * 
 * @example
 * ```tsx
 * const { isMobile, isDesktop } = useResponsive();
 * 
 * return (
 *   <Box sx={{ 
 *     flexDirection: isMobile ? 'column' : 'row',
 *     padding: isDesktop ? 4 : 2
 *   }}>
 *     ...
 *   </Box>
 * );
 * ```
 */
export const useResponsive = (): ResponsiveBreakpoints => {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Hook para obter valores responsivos baseados em breakpoints
 * 
 * @param values - Objeto com valores para cada breakpoint
 * @returns Valor apropriado para o breakpoint atual
 * 
 * @example
 * ```tsx
 * const padding = useResponsiveValue({
 *   xs: 2,
 *   sm: 3,
 *   md: 4,
 *   lg: 5
 * });
 * 
 * <Box sx={{ p: padding }}>...</Box>
 * ```
 */
export const useResponsiveValue = <T,>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default?: T;
}): T | undefined => {
  const { isXs, isSm, isMd, isLg, isXl } = useResponsive();
  
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  if (isXs && values.xs !== undefined) return values.xs;
  
  return values.default;
};

/**
 * Utilitário para criar objetos sx responsivos de forma mais limpa
 * 
 * @param styles - Objeto com estilos por breakpoint
 * @returns Objeto sx compatível com Material-UI
 * 
 * @example
 * ```tsx
 * const sx = responsiveSx({
 *   xs: { flexDirection: 'column', gap: 2 },
 *   md: { flexDirection: 'row', gap: 3 }
 * });
 * 
 * <Box sx={sx}>...</Box>
 * ```
 */
export const responsiveSx = (styles: {
  xs?: Record<string, unknown>;
  sm?: Record<string, unknown>;
  md?: Record<string, unknown>;
  lg?: Record<string, unknown>;
  xl?: Record<string, unknown>;
  base?: Record<string, unknown>;
}): Record<string, unknown> => {
  const result: Record<string, unknown> = {
    ...styles.base,
  };

  if (styles.xs) {
    result['@media (min-width:0px)'] = styles.xs;
  }
  if (styles.sm) {
    result['@media (min-width:600px)'] = styles.sm;
  }
  if (styles.md) {
    result['@media (min-width:900px)'] = styles.md;
  }
  if (styles.lg) {
    result['@media (min-width:1200px)'] = styles.lg;
  }
  if (styles.xl) {
    result['@media (min-width:1536px)'] = styles.xl;
  }

  return result;
};


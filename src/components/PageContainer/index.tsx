/**
 * Container responsivo padronizado para páginas
 * 
 * Garante consistência de layout e responsividade em todas as páginas
 * Mobile-first com breakpoints otimizados
 */

import React from 'react';
import { Box, type BoxProps } from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

export interface PageContainerProps extends Omit<BoxProps, 'sx'> {
  /**
   * Se true, remove padding horizontal em mobile
   */
  fullWidthOnMobile?: boolean;
  /**
   * Padding customizado (sobrescreve padrão)
   */
  customPadding?: {
    xs?: number;
    sm?: number;
    md?: number;
  };
}

/**
 * Container responsivo para páginas
 * 
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="Pacientes" />
 *   <TablePatients />
 * </PageContainer>
 * ```
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  fullWidthOnMobile = false,
  customPadding,
  ...boxProps
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const padding = customPadding || {
    xs: fullWidthOnMobile ? 0 : 2,
    sm: 2,
    md: 3,
  };

  return (
    <Box
      {...boxProps}
      sx={{
        width: '100%',
        maxWidth: {
          xs: '100%',
          sm: '95%',
          md: '90%',
          lg: '1200px',
        },
        margin: '0 auto',
        py: {
          xs: padding.xs || 2,
          sm: padding.sm || 2,
          md: padding.md || 3,
        },
        px: {
          xs: padding.xs || 2,
          sm: padding.sm || 2,
          md: padding.md || 3,
        },
        ...boxProps.sx,
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;


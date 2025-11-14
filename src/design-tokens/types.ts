/**
 * TypeScript types para o sistema de design tokens
 */

import type { Theme } from '@mui/material/styles';
import type {
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

// Estende o tipo Theme do Material-UI para incluir nossos tokens customizados
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      brandColors: typeof brandColors;
      semanticColors: typeof semanticColors;
      neutralColors: typeof neutralColors;
      typography: typeof typography;
      spacing: typeof spacing;
      borderRadius: typeof borderRadius;
      shadows: typeof shadows;
      transitions: typeof transitions;
      breakpoints: typeof breakpoints;
      touchTargets: typeof touchTargets;
      focus: typeof focus;
    };
  }
}

export type { Theme };


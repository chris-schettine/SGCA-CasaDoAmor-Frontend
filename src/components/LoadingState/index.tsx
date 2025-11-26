import { Box, CircularProgress, Typography } from '@mui/material';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export interface LoadingStateProps {
  /**
   * Tipo de loading:
   * - 'page': Loading de página inteira com texto
   * - 'inline': Loading pequeno inline
   * - 'section': Loading de seção com fundo
   */
  type?: 'page' | 'inline' | 'section';
  /**
   * Mensagem customizada (padrão: "Carregando...")
   */
  message?: string;
  /**
   * Tamanho do CircularProgress
   */
  size?: number;
}

/**
 * Componente padronizado para estados de carregamento
 * 
 * Uso:
 * ```tsx
 * <LoadingState /> // Loading de página padrão
 * <LoadingState type="inline" /> // Loading pequeno
 * <LoadingState type="page" message="Buscando dados..." />
 * ```
 */
export const LoadingState = ({ 
  type = 'page', 
  message = 'Carregando...',
  size 
}: LoadingStateProps) => {
  const prefersReducedMotion = useReducedMotion();

  const fadeProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  };
  
  if (type === 'inline') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <Box
          component={motion.div}
          role="status"
          aria-live="polite"
          aria-label={message}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
          {...fadeProps}
        >
          <CircularProgress size={size || 24} aria-hidden />
          <Box
            component="span"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              border: 0,
            }}
          >
            {message}
          </Box>
        </Box>
      </AnimatePresence>
    );
  }

  if (type === 'section') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <Box 
          component={motion.div}
          role="status"
          aria-live="polite"
          aria-busy="true"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2, 
            py: 6,
            px: 3,
            backgroundColor: 'background.default',
            borderRadius: 2,
          }}
          {...fadeProps}
        >
          <CircularProgress size={size || 40} aria-hidden />
          <Typography variant="body1" color="text.primary" id="loading-section-message">
            {message}
          </Typography>
        </Box>
      </AnimatePresence>
    );
  }

  // type === 'page'
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Box 
        component={motion.div}
        role="status"
        aria-live="polite"
        aria-busy="true"
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2, 
          minHeight: '60vh',
        }}
        {...fadeProps}
      >
        <CircularProgress size={size || 48} aria-hidden />
        <Typography variant="h6" color="text.primary" id="loading-page-message">
          {message}
        </Typography>
      </Box>
    </AnimatePresence>
  );
};

export default LoadingState;

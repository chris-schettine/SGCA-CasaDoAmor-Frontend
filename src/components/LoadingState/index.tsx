import { Box, CircularProgress, Typography } from '@mui/material';

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
  
  if (type === 'inline') {
    return (
      <Box
        role="status"
        aria-live="polite"
        aria-label={message}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
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
    );
  }

  if (type === 'section') {
    return (
      <Box 
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
      >
        <CircularProgress size={size || 40} aria-hidden />
        <Typography variant="body1" color="text.primary" id="loading-section-message">
          {message}
        </Typography>
      </Box>
    );
  }

  // type === 'page'
  return (
    <Box 
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
    >
      <CircularProgress size={size || 48} aria-hidden />
      <Typography variant="h6" color="text.primary" id="loading-page-message">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;

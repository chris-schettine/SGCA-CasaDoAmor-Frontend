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
    return <CircularProgress size={size || 24} />;
  }

  if (type === 'section') {
    return (
      <Box 
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
        <CircularProgress size={size || 40} />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  // type === 'page'
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 2, 
        minHeight: '60vh',
      }}
    >
      <CircularProgress size={size || 48} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;

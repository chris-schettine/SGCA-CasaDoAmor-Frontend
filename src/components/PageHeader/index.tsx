import { Box, Typography } from '@mui/material';
import { type ReactNode } from 'react';

export interface PageHeaderProps {
  /**
   * Título da página
   */
  title: string;
  /**
   * Subtítulo opcional
   */
  subtitle?: string;
  /**
   * Botão de ação (ex: "Adicionar", "Exportar")
   */
  action?: ReactNode;
  /**
   * Componente de busca/filtros
   */
  searchComponent?: ReactNode;
}

/**
 * Componente padronizado para cabeçalhos de páginas
 * 
 * Uso:
 * ```tsx
 * <PageHeader 
 *   title="Pacientes"
 *   action={<Button>Adicionar</Button>}
 *   searchComponent={<TextField ... />}
 * />
 * ```
 */
export const PageHeader = ({ 
  title, 
  subtitle,
  action,
  searchComponent 
}: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 3, width: '100%' }}>
      {/* Título e subtítulo */}
      <Box sx={{ mb: searchComponent || action ? 3 : 0 }}>
        <Typography 
          variant="h1" 
          gutterBottom={!!subtitle}
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: subtitle ? 1 : 0,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Busca e ação */}
      {(searchComponent || action) && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {searchComponent && (
            <Box sx={{ flex: '1 1 auto', minWidth: '250px', maxWidth: '500px' }}>
              {searchComponent}
            </Box>
          )}
          {action && (
            <Box sx={{ flex: '0 0 auto' }}>
              {action}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;

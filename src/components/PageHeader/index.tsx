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
 * Design responsivo mobile-first
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
    <Box sx={{ mb: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Título e subtítulo */}
      <Box sx={{ mb: searchComponent || action ? { xs: 2, sm: 3 } : 0 }}>
        <Typography 
          variant="h1" 
          gutterBottom={!!subtitle}
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: subtitle ? 1 : 0,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Busca e ação */}
      {(searchComponent || action) && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2 },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          {searchComponent && (
            <Box sx={{ 
              flex: { xs: '1 1 auto', sm: '1 1 auto' }, 
              minWidth: { xs: '100%', sm: '250px' }, 
              maxWidth: { xs: '100%', sm: '500px' } 
            }}>
              {searchComponent}
            </Box>
          )}
          {action && (
            <Box sx={{ 
              flex: '0 0 auto',
              width: { xs: '100%', sm: 'auto' }
            }}>
              {action}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;

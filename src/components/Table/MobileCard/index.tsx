import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DataField {
  label: string;
  value: ReactNode;
  hidden?: boolean;
}

interface MobileCardProps {
  title?: string;
  subtitle?: string;
  fields: DataField[];
  actions?: ReactNode;
  onClick?: () => void;
}

const MobileCard = ({ title, subtitle, fields, actions, onClick }: MobileCardProps) => {
  const visibleFields = fields.filter(field => !field.hidden);

  return (
    <Card 
      sx={{ 
        mb: 2,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
          cursor: onClick ? 'pointer' : 'default'
        },
        transition: 'box-shadow 0.3s ease'
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header com título e subtítulo */}
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'primary.main',
                  mb: 0.5
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body2"
                component="div"
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Campos de dados */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {visibleFields.map((field, index) => (
            <Box key={index}>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  mb: 0.25,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {field.label}
              </Typography>
              <Box
                component="div"
                sx={{ 
                  fontSize: '0.938rem',
                  color: 'text.primary',
                  lineHeight: 1.5
                }}
              >
                {field.value}
              </Box>
              
              {/* Divider entre campos, exceto no último */}
              {index < visibleFields.length - 1 && (
                <Divider sx={{ mt: 1.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Ações */}
        {actions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              {actions}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileCard;

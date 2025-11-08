import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

interface FormSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  elevation?: number;
  noPaper?: boolean;
}

/**
 * Componente para criar seções padronizadas em formulários
 * 
 * @example
 * <FormSection title="Dados Pessoais" subtitle="Informações básicas do usuário">
 *   <Grid container spacing={3}>
 *     <Grid item xs={12} md={6}>
 *       <TextField label="Nome" fullWidth />
 *     </Grid>
 *   </Grid>
 * </FormSection>
 */
export default function FormSection({
  title,
  subtitle,
  children,
  elevation = 1,
  noPaper = false,
}: FormSectionProps) {
  const content = (
    <>
      {(title || subtitle) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h2" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}
      {children}
    </>
  );

  if (noPaper) {
    return <Box>{content}</Box>;
  }

  return (
    <Paper elevation={elevation} sx={{ p: 3, mb: 3 }}>
      {content}
    </Paper>
  );
}

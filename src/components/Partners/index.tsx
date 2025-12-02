import React from 'react';
import { Box, Container, Grid, Typography, useTheme, Stack, alpha, Paper } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';

const partners = [
  { name: 'UESB', src: '/partners/uesb.png' },
  { name: 'CCCOMP', src: '/partners/cccomp.png' },
  { name: 'UFBA', src: '/partners/ufba.png' },
];

const Partners: React.FC = () => {
  const theme = useTheme();

  return (
    <Box 
      component="section" 
      sx={{ 
        py: { xs: 3, md: 4 }, 
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.4)
          : alpha(theme.palette.primary.main, 0.02),
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }} 
      aria-labelledby="partners-title"
    >
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={3}>
          <HandshakeIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          <Typography 
            id="partners-title" 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center',
              color: theme.palette.text.primary,
              letterSpacing: -0.5
            }}
          >
            Parceiros Institucionais
          </Typography>
        </Stack>

        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {partners.map((p) => (
            <Grid key={p.name} size={{ xs: 6, sm: 4, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }
                }}
              >
                <Stack alignItems="center" spacing={1.5}>
                  <Box 
                    component="img" 
                    src={p.src} 
                    alt={p.name} 
                    sx={{ 
                      width: 72, 
                      height: 72, 
                      objectFit: 'contain',
                      filter: theme.palette.mode === 'dark' ? 'brightness(0.95)' : 'none'
                    }} 
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    {p.name}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Partners;

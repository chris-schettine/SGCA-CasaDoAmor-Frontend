import React from 'react';
import { Box, Container, Grid, Typography, useTheme, Stack } from '@mui/material';

const partners = [
  { name: 'UESB', src: '/partners/uesb.png' },
  { name: 'CCCOMP', src: '/partners/cccomp.png' },
  { name: 'UFBA', src: '/partners/ufba.png' },
];

const Partners: React.FC = () => {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: theme.palette.background.paper }} aria-labelledby="partners-title">
      <Container maxWidth="lg">
        <Typography id="partners-title" variant="h5" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
          Parceiros que apoiam esta ideia
        </Typography>

        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {partners.map((p) => (
            <Grid key={p.name} size={{ xs: 6, sm: 4, md: 2 }}>
              <Stack alignItems="center" spacing={1} sx={{ px: 1 }}>
                <Box component="img" src={p.src} alt={p.name} sx={{ width: 72, height: 72, objectFit: 'contain' }} />
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 120,
                    lineHeight: 1.1,
                  }}
                >
                  {p.name}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Partners;

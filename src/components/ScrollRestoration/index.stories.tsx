import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ScrollRestoration from './index';

const meta = {
  title: 'Components/Utilities/ScrollRestoration',
  component: ScrollRestoration,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ScrollRestoration>;

export default meta;
type Story = StoryObj<typeof ScrollRestoration>;

const Page = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, height: '160vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button variant="contained" onClick={() => navigate('/')}>
          Ir para Página A
        </Button>
        <Button variant="outlined" onClick={() => navigate('/b')}>
          Ir para Página B
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Role a página, depois navegue para outra rota e volte para ver a posição restaurada.
      </Typography>
      <Box sx={{ flex: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }} />
    </Box>
  );
};

export const Basic: Story = {
  parameters: { router: { initialEntries: ['/'] } },
  render: () => (
    <>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<Page title="Página A" />} />
        <Route path="/b" element={<Page title="Página B" />} />
      </Routes>
    </>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { TransitionProvider } from '../../motion/TransitionProvider';
import NavigationInstrumentation from './index';

const meta = {
  title: 'Components/Instrumentation/NavigationInstrumentation',
  component: NavigationInstrumentation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <TransitionProvider>
        <Story />
      </TransitionProvider>
    ),
  ],
} satisfies Meta<typeof NavigationInstrumentation>;

export default meta;
type Story = StoryObj<typeof NavigationInstrumentation>;

const Dashboard = () => <Typography variant="h5">Dashboard</Typography>;
const Patients = () => <Typography variant="h5">Pacientes</Typography>;
const Audit = () => <Typography variant="h5">Auditoria</Typography>;

const NavigationDemo = () => {
  const Controls = () => {
    const navigate = useNavigate();
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button variant="contained" onClick={() => navigate('/')}>
          Ir para Dashboard
        </Button>
        <Button variant="outlined" onClick={() => navigate('/patients')}>
          Ir para Pacientes
        </Button>
        <Button variant="outlined" onClick={() => navigate('/audit')}>
          Ir para Auditoria
        </Button>
      </Stack>
    );
  };

  return (
    <>
      <NavigationInstrumentation />
      <Box sx={{ p: 4, display: 'grid', gap: 3 }}>
        <Controls />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle1">Eventos emitidos</Typography>
          <Typography variant="body2" color="text.secondary">
            Navegue entre rotas e abra o console para ver os eventos emitidos.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export const Basic: Story = {
  parameters: { router: { initialEntries: ['/'] } },
  render: () => <NavigationDemo />,
};

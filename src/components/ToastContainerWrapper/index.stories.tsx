import type { Meta, StoryObj } from '@storybook/react';
import { Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ToastContainerWrapper } from './index';

const meta = {
  title: 'Components/Feedback/ToastContainerWrapper',
  component: ToastContainerWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ToastContainerWrapper>;

export default meta;
type Story = StoryObj<typeof ToastContainerWrapper>;

const ToastPlayground = () => (
  <ThemeProvider>
    <ToastContainerWrapper />
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => toast.success('Operação concluída!')}>
        Sucesso
      </Button>
      <Button variant="outlined" color="warning" onClick={() => toast.warning('Verifique os dados informados')}>
        Alerta
      </Button>
      <Button variant="outlined" color="error" onClick={() => toast.error('Falha ao salvar')}>
        Erro
      </Button>
      <Button variant="text" onClick={() => toast.info('Mensagem informativa')}>
        Info
      </Button>
    </Stack>
  </ThemeProvider>
);

export const Playground: Story = {
  render: () => <ToastPlayground />,
};

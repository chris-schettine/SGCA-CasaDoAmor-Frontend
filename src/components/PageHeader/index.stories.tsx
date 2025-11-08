import type { Meta, StoryObj } from '@storybook/react';
import { Button, TextField } from '@mui/material';
import PageHeader from './index';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout/PageHeader',
  component: PageHeader,
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const WithActionAndSearch: Story = {
  args: {
    title: 'Pacientes',
    subtitle: 'Gerencie registros, relatórios e agendamentos',
    action: <Button variant="contained">Adicionar paciente</Button>,
    searchComponent: <TextField label="Buscar" variant="outlined" fullWidth size="small" />,
  },
};

export const WithSubtitleOnly: Story = {
  args: {
    title: 'Meu Perfil',
    subtitle: 'Atualize suas informações e preferências',
  },
};

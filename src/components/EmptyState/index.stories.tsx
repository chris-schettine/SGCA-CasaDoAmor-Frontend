import AssignmentIcon from '@mui/icons-material/Assignment';
import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './index';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
  args: {
    title: 'Nenhum registro encontrado',
    description: 'Cadastre um novo item para começar a usar o sistema.',
  },
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actionLabel: 'Cadastrar registro',
    onAction: () => alert('Callback acionado'),
  },
};

export const CustomIcon: Story = {
  args: {
    icon: <AssignmentIcon sx={{ fontSize: 64 }} />,
    title: 'Sem relatórios gerados',
    description: 'Gere um relatório para visualizar informações detalhadas do paciente.',
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import LoadingState from './index';

const meta = {
  title: 'Components/Feedback/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'page',
    message: 'Carregando...',
  },
  argTypes: {
    type: {
      control: 'radio',
      options: ['page', 'inline', 'section'],
      description: 'Tipo de loading exibido',
    },
    message: {
      control: 'text',
      description: 'Mensagem opcional para estados de página ou seção',
    },
    size: {
      control: { type: 'number', min: 8, max: 80, step: 2 },
      description: 'Tamanho do indicador (inline/section)',
    },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Page: Story = {};

export const PageWithMessage: Story = {
  args: {
    message: 'Carregando dados do paciente...',
  },
};

export const Section: Story = {
  args: {
    type: 'section',
  },
};

export const SectionWithMessage: Story = {
  args: {
    type: 'section',
    message: 'Preparando relatórios...',
  },
};

export const Inline: Story = {
  args: {
    type: 'inline',
    size: 16,
  },
};

export const InContainer: Story = {
  render: (args) => (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 3, borderRadius: 2, minWidth: 320 }}>
      <LoadingState {...args} />
    </Box>
  ),
  args: {
    type: 'section',
    message: 'Sincronizando dados...',
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import LoadingBackdrop from './index';

const meta: Meta<typeof LoadingBackdrop> = {
  title: 'Components/Feedback/LoadingBackdrop',
  component: LoadingBackdrop,
  args: {
    message: 'Carregando dados do paciente...'
  },
};

export default meta;

type Story = StoryObj<typeof LoadingBackdrop>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'Sincronizando registros médicos...'
  },
};

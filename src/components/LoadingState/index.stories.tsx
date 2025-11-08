import type { Meta, StoryObj } from '@storybook/react';
import LoadingState from './index';

const meta: Meta<typeof LoadingState> = {
  title: 'Components/Feedback/LoadingState',
  component: LoadingState,
  args: {
    message: 'Carregando dados...',
  },
};

export default meta;

type Story = StoryObj<typeof LoadingState>;

export const Page: Story = {};

export const Section: Story = {
  args: {
    type: 'section',
  },
};

export const Inline: Story = {
  args: {
    type: 'inline',
    size: 16,
  },
};

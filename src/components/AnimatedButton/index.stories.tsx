import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@mui/material';
import { AnimatedButton, PulsingButton, ShimmerButton } from './index';

const meta: Meta<typeof AnimatedButton> = {
  title: 'Components/Inputs/AnimatedButton',
  component: AnimatedButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    variant: {
      control: {
        type: 'select',
        options: ['text', 'outlined', 'contained'],
      },
    },
    color: {
      control: {
        type: 'select',
        options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'large'],
      },
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    children: 'Click me',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof AnimatedButton>;

export const Default: Story = {
  render: (args) => <AnimatedButton {...args} />,
};

export const Pulsing: Story = {
  render: (args) => <PulsingButton {...args} />,
};

export const Shimmer: Story = {
  render: (args) => <ShimmerButton {...args} />,
};

export const AllButtons: Story = {
    render: (args) => (
        <Stack spacing={2} direction="row">
            <AnimatedButton {...args}>Animated</AnimatedButton>
            <PulsingButton {...args}>Pulsing</PulsingButton>
            <ShimmerButton {...args}>Shimmer</ShimmerButton>
        </Stack>
    ),
    name: 'All Variants'
};

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, TextField } from '@mui/material';
import PasswordStrengthIndicator from './index';

const meta: Meta<typeof PasswordStrengthIndicator> = {
  title: 'Components/Feedback/PasswordStrengthIndicator',
  component: PasswordStrengthIndicator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    password: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof PasswordStrengthIndicator>;

const InteractiveWrapper = () => {
  const [password, setPassword] = useState('');

  return (
    <Box sx={{ width: 300 }}>
      <TextField
        type="password"
        label="Digite sua senha"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthIndicator password={password} />
    </Box>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
};

export const Weak: Story = {
  args: {
    password: '123',
  },
};

export const Medium: Story = {
  args: {
    password: 'Password123',
  },
};

export const Strong: Story = {
  args: {
    password: 'Password123!',
  },
};
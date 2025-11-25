import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography } from '@mui/material';
import { ThemeProvider, useThemeMode } from '../../contexts/ThemeContext';
import ThemeToggle from './index';

const meta = {
  title: 'Components/Inputs/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

const TogglePreview = () => {
  const { mode } = useThemeMode();

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 320,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="body1">Tema atual: {mode}</Typography>
        <ThemeToggle />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Abra o seletor para alternar entre claro e escuro.
      </Typography>
    </Box>
  );
};

export const Default: Story = {
  render: () => (
    <ThemeProvider defaultMode="light">
      <TogglePreview />
    </ThemeProvider>
  ),
};

export const StartsDark: Story = {
  render: () => (
    <ThemeProvider defaultMode="dark">
      <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, display: 'inline-block', color: 'text.primary' }}>
        <TogglePreview />
      </Box>
    </ThemeProvider>
  ),
};

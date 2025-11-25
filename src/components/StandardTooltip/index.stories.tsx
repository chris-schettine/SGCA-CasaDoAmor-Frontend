import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import TransitionProvider from '../../motion/TransitionProvider';
import StandardTooltip from './index';

const meta = {
  title: 'Components/Feedback/StandardTooltip',
  component: StandardTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: { control: false },
  },
  args: {
    title: 'Informação adicional',
    placement: 'top',
  },
  decorators: [
    (Story) => (
      <TransitionProvider>
        <Story />
      </TransitionProvider>
    ),
  ],
} satisfies Meta<typeof StandardTooltip>;

export default meta;
type Story = StoryObj<typeof StandardTooltip>;

export const Default: Story = {
  render: (args) => (
    <StandardTooltip {...args}>
      <IconButton color="primary">
        <InfoOutlinedIcon />
      </IconButton>
    </StandardTooltip>
  ),
};

export const Placements: Story = {
  render: (args) => (
    <Stack direction="row" spacing={3} alignItems="center">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Box key={placement} sx={{ textAlign: 'center' }}>
          <StandardTooltip {...args} placement={placement} title={`Tooltip ${placement}`}>
            <IconButton color="primary">
              <InfoOutlinedIcon />
            </IconButton>
          </StandardTooltip>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {placement}
          </Typography>
        </Box>
      ))}
    </Stack>
  ),
};

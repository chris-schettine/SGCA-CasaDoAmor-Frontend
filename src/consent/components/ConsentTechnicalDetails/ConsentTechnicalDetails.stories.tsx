import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { ConsentTechnicalDetails } from './ConsentTechnicalDetails';

const meta = {
  title: 'Consent/ConsentTechnicalDetails',
  component: ConsentTechnicalDetails,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ConsentTechnicalDetails>;

export default meta;
type Story = StoryObj<typeof ConsentTechnicalDetails>;

export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 520 }}>
      <ConsentTechnicalDetails />
    </Box>
  ),
};

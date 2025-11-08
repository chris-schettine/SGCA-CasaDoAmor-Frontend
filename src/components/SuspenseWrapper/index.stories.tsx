import type { Meta, StoryObj } from '@storybook/react';
import {
  SuspenseWrapper,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  PatientListSkeleton,
  ProfileSkeleton,
} from '.';
import { Box, Typography } from '@mui/material';

const meta: Meta<typeof SuspenseWrapper> = {
  title: 'Components/SuspenseWrapper',
  component: SuspenseWrapper,
};

export default meta;
type Story = StoryObj<typeof SuspenseWrapper>;

const LazyComponent = () => {
  // Simulate a component that takes time to load
  // This will not work in storybook as it does not support suspense well
  return <Typography>Component Carregado</Typography>;
};

export const Default: Story = {
  args: {
    children: <LazyComponent />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <LazyComponent />,
    fallback: (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando componente customizado...</Typography>
      </Box>
    ),
  },
};

export const Table: StoryObj<typeof TableSkeleton> = {
  render: () => <TableSkeleton />,
};

export const Card: StoryObj<typeof CardSkeleton> = {
  render: () => <CardSkeleton />,
};

export const Form: StoryObj<typeof FormSkeleton> = {
  render: () => <FormSkeleton />,
};

export const PatientList: StoryObj<typeof PatientListSkeleton> = {
  render: () => <PatientListSkeleton />,
};

export const Profile: StoryObj<typeof ProfileSkeleton> = {
  render: () => <ProfileSkeleton />,
};

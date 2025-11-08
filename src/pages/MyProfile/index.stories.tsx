import type { Meta, StoryObj } from '@storybook/react';
import MyProfilePage from '.';
import { AuthProvider } from '../../contexts/AuthContext';

const meta: Meta<typeof MyProfilePage> = {
  title: 'Pages/MyProfilePage',
  component: MyProfilePage,
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MyProfilePage>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['activeSession'],
          status: 'loading',
        },
      ],
    },
  },
};

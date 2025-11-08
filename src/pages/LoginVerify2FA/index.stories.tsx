import type { Meta, StoryObj } from '@storybook/react';
import LoginVerify2FAPage from '.';
import { AuthProvider } from '../../contexts/AuthContext';

const meta: Meta<typeof LoginVerify2FAPage> = {
  title: 'Pages/LoginVerify2FAPage',
  component: LoginVerify2FAPage,
  decorators: [
    (Story) => {
      // Mock sessionStorage for the story
      sessionStorage.setItem('cpfFor2FA', '12345678900');
      return (
        <AuthProvider>
          <Story />
        </AuthProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/login/verify-2fa'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginVerify2FAPage>;

export const Default: Story = {};

export const Loading: Story = {
  // You can use a loader to set the loading state
  // loaders: [
  //   async () => {
  //     // Mock the API call to be in a loading state
  //   },
  // ],
};

export const ResendLoading: Story = {
  // You can use a loader to set the resend loading state
  // loaders: [
  //   async () => {
  //     // Mock the API call to be in a loading state
  //   },
  // ],
};

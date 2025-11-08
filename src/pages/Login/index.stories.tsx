import type { Meta, StoryObj } from '@storybook/react';
import Login from '.';
import { AuthProvider } from '../../contexts/AuthContext';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/login'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {};

export const Authenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simula o comportamento quando o usuário já está autenticado.',
      },
    },
  },
  // You can use a loader to set the authenticated state
  // loaders: [
  //   async () => {
  //     // Mock the useAuth hook to return isAuthenticated: true
  //   },
  // ],
};

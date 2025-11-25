import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Login from '.';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  tags: ['a11y-fix'],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider defaultMode="light" storageKey="__storybook_theme_mode__">
          <AuthProvider>
            <Story />
          </AuthProvider>
        </ThemeProvider>
      );
    },
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

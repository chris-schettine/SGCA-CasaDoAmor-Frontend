import type { Meta, StoryObj } from '@storybook/react';
import { Routes, Route } from 'react-router-dom';
import AdminRoute from '.';
import { AuthProvider } from '../../contexts/AuthContext';

const meta: Meta<typeof AdminRoute> = {
  title: 'Components/AdminRoute',
  component: AdminRoute,
  decorators: [
    (Story, { args }) => (
      <AuthProvider>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute {...args}>
                <div>Admin Content</div>
              </AdminRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </AuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/admin'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdminRoute>;

export const Default: Story = {
  args: {
    children: <div>Admin Content</div>,
  },
};

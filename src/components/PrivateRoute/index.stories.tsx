import type { Meta, StoryObj } from '@storybook/react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '.';
import { AuthProvider } from '../../contexts/AuthContext';

const meta: Meta<typeof PrivateRoute> = {
  title: 'Components/PrivateRoute',
  component: PrivateRoute,
  decorators: [
    (Story, { args }) => (
      <AuthProvider>
        <Routes>
          <Route
            path="/private"
            element={
              <PrivateRoute {...args}>
                <div>Private Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/private'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PrivateRoute>;

export const Default: Story = {
  args: {
    children: <div>Private Content</div>,
  },
};

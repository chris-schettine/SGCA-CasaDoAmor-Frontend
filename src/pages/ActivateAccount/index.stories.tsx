import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import ActivateAccountPage from '.';

const meta: Meta<typeof ActivateAccountPage> = {
  title: 'Pages/ActivateAccountPage',
  component: ActivateAccountPage,
  decorators: [
    (Story, { args }) => (
      <Routes>
        <Route path="/activate-account" element={<Story {...args} />} />
      </Routes>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/activate-account?token=some-token'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivateAccountPage>;

export const Default: Story = {};

export const WithoutToken: Story = {
  decorators: [
    (Story, { args }) => (
      <Routes>
        <Route path="/activate-account" element={<Story {...args} />} />
      </Routes>
    ),
  ],
  parameters: {
    router: {
      initialEntries: ['/activate-account'],
    },
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import ForgotPassword from '.';

const meta: Meta<typeof ForgotPassword> = {
  title: 'Pages/ForgotPassword',
  component: ForgotPassword,
  decorators: [
    (Story) => <Story />,
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/forgot-password'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ForgotPassword>;

export const Default: Story = {};

export const Loading: Story = {
  // You can use a loader to set the loading state
  // loaders: [
  //   async () => {
  //     // Mock the API call to be in a loading state
  //   },
  // ],
};

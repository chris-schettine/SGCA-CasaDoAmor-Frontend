import type { Meta, StoryObj } from '@storybook/react';
import CompanionRegisterPage from '.';

const meta: Meta<typeof CompanionRegisterPage> = {
  title: 'Pages/CompanionRegisterPage',
  component: CompanionRegisterPage,
  decorators: [
    (Story) => <Story />,
  ],
  parameters: {
    router: {
      initialEntries: ['/companion/register'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CompanionRegisterPage>;

export const Default: Story = {};

export const ExistingCompanion: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simula o preenchimento do formulário quando um acompanhante existente é encontrado.',
      },
    },
  },
  // You can use a loader to set the form state
  // loaders: [
  //   async () => {
  //     // Mock the API call to find an existing companion
  //   },
  // ],
};

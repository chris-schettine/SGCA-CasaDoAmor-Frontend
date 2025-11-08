import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import RelatoryPage from '.';

const meta: Meta<typeof RelatoryPage> = {
  title: 'Components/RelatoryPage',
  component: RelatoryPage,
  decorators: [
    (Story, { args }) => (
      <Routes>
        <Route path="/relatory/:id" element={<Story {...args} />} />
      </Routes>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/relatory/1'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RelatoryPage>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Este é o estado de carregamento do componente.',
      },
    },
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Este é o estado quando não há histórico para o paciente.',
      },
    },
  },
  // loaders: [
  //   async () => {
  //     // Mock da resposta da API sem histórico
  //     // jest.spyOn(global, 'fetch').mockResolvedValue({
  //     //   json: async () => [],
  //     // } as Response);
  //   },
  // ],
};

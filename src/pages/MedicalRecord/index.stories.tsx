import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import MedicalRecordPage from '.';

const meta: Meta<typeof MedicalRecordPage> = {
  title: 'Pages/MedicalRecordPage',
  component: MedicalRecordPage,
  decorators: [
    (Story, { args }) => (
      <Routes>
        <Route path="/medical-record" element={<Story {...args} />} />
      </Routes>
    ),
  ],
  parameters: {
    router: {
      initialEntries: [
        {
          pathname: '/medical-record',
          state: { patientId: '123', patientName: 'Fulano de Tal' },
        },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof MedicalRecordPage>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simula o estado de carregamento da página.',
      },
    },
  },
  // You can use a loader to set the loading state
  // loaders: [
  //   async () => {
  //     // Mock the API call to be in a loading state
  //   },
  // ],
};

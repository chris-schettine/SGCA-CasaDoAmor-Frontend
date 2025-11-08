import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import Breadcrumbs, { type BreadcrumbItem } from './index';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
    router: {
      initialEntries: ['/'],
    },
  },
  decorators: [
    (Story) => (
      <Routes>
        <Route path="*" element={<Story />} />
      </Routes>
    ),
  ],
  argTypes: {
    items: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

const sampleItems: BreadcrumbItem[] = [
  { label: 'Pacientes', path: '/patients' },
  { label: 'Novo Paciente' },
];

const longSampleItems: BreadcrumbItem[] = [
    { label: 'Pacientes', path: '/patients' },
    { label: 'Fulano de Tal', path: '/patients/123' },
    { label: 'Prontuário', path: '/patients/123/records' },
    { label: 'Nova Sessão' },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const SingleLevel: Story = {
    args: {
      items: [{ label: 'Usuários' }],
    },
};

export const LongPath: Story = {
    args: {
      items: longSampleItems,
    },
};

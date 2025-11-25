import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import SearchBar from './index';

const meta = {
  title: 'Components/Inputs/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    value: '',
    onChange: (value: string) => console.log('Busca:', value),
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchBar {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('searchbox');
    await userEvent.type(input, 'João');
    await expect(input).toHaveValue('João');
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Buscar paciente por nome ou CPF...',
    ariaLabel: 'Buscar paciente por nome ou CPF',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Buscar usuário',
    value: 'João Silva',
    ariaLabel: 'Buscar usuário',
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [searchValue, setSearchValue] = useState('');

    return (
      <Box sx={{ maxWidth: 520 }}>
        <SearchBar {...args} value={searchValue} onChange={setSearchValue} />
        <Box sx={{ mt: 2, color: 'text.secondary' }}>
          Valor atual: <strong>{searchValue || '(vazio)'}</strong>
        </Box>
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('searchbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Paciente 01');
    await expect(input).toHaveValue('Paciente 01');
    await expect(canvas.getByText(/Paciente 01/)).toBeVisible();
  },
};

export const MultipleSearchBars: Story = {
  render: (args) => {
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [search3, setSearch3] = useState('');

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 640 }}>
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Pacientes</Box>
          <SearchBar {...args} placeholder="Nome, CPF ou prontuário..." value={search1} onChange={setSearch1} />
        </Box>
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Usuários</Box>
          <SearchBar {...args} placeholder="Nome ou email..." value={search2} onChange={setSearch2} />
        </Box>
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Sessões</Box>
          <SearchBar {...args} placeholder="ID da sessão..." value={search3} onChange={setSearch3} />
        </Box>
      </Box>
    );
  },
};

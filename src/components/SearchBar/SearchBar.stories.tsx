import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from './index';
import { useState } from 'react';
import { Box } from '@mui/material';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * SearchBar básica com placeholder padrão
 */
export const Default: Story = {
  args: {
    value: '',
    onChange: (value: string) => console.log('Busca:', value),
  },
};

/**
 * SearchBar com placeholder customizado
 */
export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Buscar paciente por nome ou CPF...',
    value: '',
    onChange: (value: string) => console.log('Busca:', value),
  },
};

/**
 * SearchBar com valor preenchido
 */
export const WithValue: Story = {
  args: {
    placeholder: 'Buscar usuário',
    value: 'João Silva',
    onChange: (value: string) => console.log('Busca:', value),
  },
};

/**
 * SearchBar interativo - controle de estado
 */
export const Interactive: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    
    return (
      <Box>
        <SearchBar 
          placeholder="Digite para buscar..."
          value={searchValue}
          onChange={setSearchValue}
        />
        <Box sx={{ mt: 2, color: 'text.secondary' }}>
          Valor atual: <strong>{searchValue || '(vazio)'}</strong>
        </Box>
      </Box>
    );
  },
};

/**
 * SearchBar com largura personalizada
 */
export const CustomWidth: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <SearchBar 
        placeholder="Buscar..."
        value=""
        onChange={(value: string) => console.log('Busca:', value)}
      />
    </Box>
  ),
};

/**
 * Múltiplas SearchBars com propósitos diferentes
 */
export const MultipleSearchBars: Story = {
  render: () => {
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [search3, setSearch3] = useState('');
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Pacientes</Box>
          <SearchBar 
            placeholder="Nome, CPF ou prontuário..."
            value={search1}
            onChange={setSearch1}
          />
        </Box>
        
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Usuários</Box>
          <SearchBar 
            placeholder="Nome ou email..."
            value={search2}
            onChange={setSearch2}
          />
        </Box>
        
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Buscar Sessões</Box>
          <SearchBar 
            placeholder="ID da sessão..."
            value={search3}
            onChange={setSearch3}
          />
        </Box>
      </Box>
    );
  },
};

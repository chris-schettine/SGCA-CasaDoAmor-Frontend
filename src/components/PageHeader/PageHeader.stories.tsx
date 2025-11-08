import type { Meta, StoryObj } from '@storybook/react';
import PageHeader from './index';
import { Box, Button } from '@mui/material';
import SearchBar from '../SearchBar';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullwidth',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ padding: 3 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Header básico - apenas título
 */
export const Basic: Story = {
  args: {
    title: 'Lista de Pacientes',
  },
};

/**
 * Header com subtítulo descritivo
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Gestão de Usuários',
    subtitle: 'Administre os usuários do sistema',
  },
};

/**
 * Header com botão de ação
 */
export const WithAction: Story = {
  args: {
    title: 'Pacientes',
    subtitle: 'Gerencie os pacientes cadastrados',
    action: (
      <Button variant="contained" color="primary">
        Novo Paciente
      </Button>
    ),
  },
};

/**
 * Header completo - título, subtítulo, busca e ação
 */
export const Complete: Story = {
  args: {
    title: 'Auditoria',
    subtitle: 'Histórico de ações no sistema',
    searchComponent: (
      <SearchBar 
        placeholder="Buscar por usuário ou ação"
        value=""
        onChange={(value: string) => console.log('Busca:', value)}
      />
    ),
    action: (
      <Button variant="contained" color="primary">
        Exportar CSV
      </Button>
    ),
  },
};

/**
 * Header apenas com busca
 */
export const WithSearch: Story = {
  args: {
    title: 'Sessões',
    searchComponent: (
      <SearchBar 
        placeholder="Buscar sessão..."
        value=""
        onChange={(value: string) => console.log('Busca:', value)}
      />
    ),
  },
};

/**
 * Header com múltiplas ações
 */
export const WithMultipleActions: Story = {
  args: {
    title: 'Relatórios',
    subtitle: 'Gere e exporte relatórios',
    action: (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" color="primary">
          Limpar Filtros
        </Button>
        <Button variant="contained" color="primary">
          Gerar Relatório
        </Button>
      </Box>
    ),
  },
};

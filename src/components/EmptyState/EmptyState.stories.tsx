import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './index';
import { Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado vazio básico - apenas título
 */
export const Basic: Story = {
  args: {
    title: 'Nenhum registro encontrado',
  },
};

/**
 * Estado vazio com descrição
 */
export const WithDescription: Story = {
  args: {
    title: 'Nenhum paciente cadastrado',
    description: 'Comece adicionando o primeiro paciente ao sistema',
  },
};

/**
 * Estado vazio com ícone customizado
 */
export const WithCustomIcon: Story = {
  args: {
    icon: <FolderOpenIcon sx={{ fontSize: 80, color: 'text.secondary' }} />,
    title: 'Lista vazia',
    description: 'Não há itens para exibir no momento',
  },
};

/**
 * Estado vazio com ação (botão)
 */
export const WithAction: Story = {
  args: {
    icon: <PersonAddIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Nenhum usuário encontrado',
    description: 'Adicione usuários para começar',
    actionLabel: 'Adicionar Usuário',
    onAction: () => alert('Adicionar usuário'),
  },
};

/**
 * Estado vazio após busca sem resultados
 */
export const NoSearchResults: Story = {
  args: {
    icon: <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca',
    actionLabel: 'Limpar busca',
    onAction: () => console.log('Limpar busca'),
  },
};

/**
 * Estado vazio de lista de auditoria
 */
export const AuditLog: Story = {
  args: {
    title: 'Nenhum registro de auditoria',
    description: 'O histórico de ações aparecerá aqui',
  },
};

/**
 * Estado vazio de sessões
 */
export const Sessions: Story = {
  args: {
    title: 'Nenhuma sessão agendada',
    description: 'Crie uma nova sessão para começar',
    actionLabel: 'Agendar Sessão',
    onAction: () => alert('Agendar sessão'),
  },
};

/**
 * Múltiplos estados vazios - demonstração de uso
 */
export const MultipleStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 800 }}>
      <Box sx={{ border: '1px dashed #ccc', padding: 3, borderRadius: 1 }}>
        <EmptyState title="Tabela vazia" />
      </Box>
      
      <Box sx={{ border: '1px dashed #ccc', padding: 3, borderRadius: 1 }}>
        <EmptyState 
          icon={<SearchOffIcon sx={{ fontSize: 80 }} />}
          title="Busca sem resultados"
          description="Não encontramos o que você procura"
        />
      </Box>
      
      <Box sx={{ border: '1px dashed #ccc', padding: 3, borderRadius: 1 }}>
        <EmptyState 
          title="Lista vazia"
          description="Adicione novos itens"
          actionLabel="Adicionar Item"
          onAction={() => console.log('Adicionar')}
        />
      </Box>
    </Box>
  ),
};


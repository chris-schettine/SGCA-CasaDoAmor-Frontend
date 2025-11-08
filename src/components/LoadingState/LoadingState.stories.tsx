import type { Meta, StoryObj } from '@storybook/react';
import LoadingState from './index';

const meta: Meta<typeof LoadingState> = {
  title: 'Components/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['page', 'inline', 'section'],
      description: 'Tipo de loading a ser exibido',
    },
    message: {
      control: 'text',
      description: 'Mensagem opcional a ser exibida',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Loading de página inteira - exibe um CircularProgress centralizado
 */
export const Page: Story = {
  args: {
    type: 'page',
  },
};

/**
 * Loading de página com mensagem customizada
 */
export const PageWithMessage: Story = {
  args: {
    type: 'page',
    message: 'Carregando dados...',
  },
};

/**
 * Loading inline - usado para botões e pequenos componentes
 */
export const Inline: Story = {
  args: {
    type: 'inline',
  },
};

/**
 * Loading de seção - exibe Skeleton loaders para preview de conteúdo
 */
export const Section: Story = {
  args: {
    type: 'section',
  },
};

/**
 * Loading de seção com mensagem
 */
export const SectionWithMessage: Story = {
  args: {
    type: 'section',
    message: 'Processando informações...',
  },
};

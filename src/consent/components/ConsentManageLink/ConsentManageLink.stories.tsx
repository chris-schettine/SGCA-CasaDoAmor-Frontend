import type { Meta, StoryObj } from '@storybook/react';
import { ConsentManageLink } from './ConsentManageLink';
import { ConsentProvider } from '../../provider/ConsentProvider';

const meta: Meta<typeof ConsentManageLink> = {
  title: 'Consent/ConsentManageLink',
  component: ConsentManageLink,
  decorators: [
    (Story) => (
      <ConsentProvider>
        <Story />
      </ConsentProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentManageLink>;

/**
 * Link padrão
 */
export const Default: Story = {
  args: {},
};

/**
 * Texto customizado
 */
export const CustomText: Story = {
  args: {
    children: 'Configurar Cookies',
  },
};

/**
 * Com estilo customizado
 */
export const Styled: Story = {
  args: {
    children: 'Privacidade',
    sx: {
      color: 'primary.main',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  },
};

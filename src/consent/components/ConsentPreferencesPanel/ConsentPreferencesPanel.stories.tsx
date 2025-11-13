import type { Meta, StoryObj } from '@storybook/react';
import { ConsentPreferencesPanel } from './ConsentPreferencesPanel';

const meta: Meta<typeof ConsentPreferencesPanel> = {
  title: 'Consent/ConsentPreferencesPanel',
  component: ConsentPreferencesPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Painel de gerenciamento de preferências de consentimento. Mostra finalidades essenciais (não editáveis) e opcionais (toggleáveis).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentPreferencesPanel>;

/**
 * Estado inicial (defaults)
 */
export const Default: Story = {
  args: {
    currentChoices: {
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: false,
      functional_notifications: false,
      analytics_usage: false,
      marketing_emails: false,
    },
    onSave: (choices) => console.log('onSave', choices),
    isLoading: false,
  },
};

/**
 * Usuário aceitou todos
 */
export const AllAccepted: Story = {
  args: {
    currentChoices: {
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: true,
      functional_notifications: true,
      analytics_usage: true,
      marketing_emails: true,
    },
    onSave: (choices) => console.log('onSave', choices),
    isLoading: false,
  },
};

/**
 * Apenas essenciais
 */
export const EssentialOnly: Story = {
  args: {
    currentChoices: {
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: false,
      functional_notifications: false,
      analytics_usage: false,
      marketing_emails: false,
    },
    onSave: (choices) => console.log('onSave', choices),
    isLoading: false,
  },
};

/**
 * Estado de loading (salvando)
 */
export const Loading: Story = {
  args: {
    currentChoices: {
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: true,
      functional_notifications: false,
      analytics_usage: true,
      marketing_emails: false,
    },
    onSave: (choices) => console.log('onSave', choices),
    isLoading: true,
  },
};

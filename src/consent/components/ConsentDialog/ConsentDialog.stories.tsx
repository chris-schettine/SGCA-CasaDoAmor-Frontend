import type { Meta, StoryObj } from '@storybook/react';
import { ConsentDialog } from './ConsentDialog';
import { CONSENT_PURPOSES } from '../../config/consentConfig';
import type { ConsentChoice } from '../../types/consent.types';

const meta: Meta<typeof ConsentDialog> = {
  title: 'Consent/ConsentDialog',
  component: ConsentDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dialog principal de consentimento LGPD com acessibilidade WCAG 2.2 AA completa. Inclui focus trap, ARIA semântica e escolhas granulares.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controla visibilidade do dialog',
    },
    required: {
      control: 'boolean',
      description: 'Se true, não permite fechar sem escolher (primeira visita)',
    },
    isLoading: {
      control: 'boolean',
      description: 'Estado de loading durante salvamento',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConsentDialog>;

// Choices padrão
const defaultChoices: ConsentChoice = CONSENT_PURPOSES.reduce((acc, purpose) => {
  acc[purpose.id] = purpose.defaultEnabled;
  return acc;
}, {} as ConsentChoice);

/**
 * Dialog aberto na primeira visita (obrigatório)
 */
export const FirstVisit: Story = {
  args: {
    open: true,
    required: true,
    isLoading: false,
    currentChoices: defaultChoices,
    onClose: () => console.log('onClose'),
    onAcceptAll: () => console.log('onAcceptAll'),
    onRejectNonEssential: () => console.log('onRejectNonEssential'),
    onSavePreferences: (choices) => console.log('onSavePreferences', choices),
  },
};

/**
 * Dialog aberto manualmente (pode fechar com ESC/X)
 */
export const ManualOpen: Story = {
  args: {
    open: true,
    required: false,
    isLoading: false,
    currentChoices: defaultChoices,
    onClose: () => console.log('onClose'),
    onAcceptAll: () => console.log('onAcceptAll'),
    onRejectNonEssential: () => console.log('onRejectNonEssential'),
    onSavePreferences: (choices) => console.log('onSavePreferences', choices),
  },
};

/**
 * Estado de loading (salvando)
 */
export const Loading: Story = {
  args: {
    open: true,
    required: false,
    isLoading: true,
    currentChoices: defaultChoices,
    onClose: () => console.log('onClose'),
    onAcceptAll: () => console.log('onAcceptAll'),
    onRejectNonEssential: () => console.log('onRejectNonEssential'),
    onSavePreferences: (choices) => console.log('onSavePreferences', choices),
  },
};

/**
 * Com escolhas customizadas (usuário já consentiu anteriormente)
 */
export const WithCustomChoices: Story = {
  args: {
    open: true,
    required: false,
    isLoading: false,
    currentChoices: {
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: true,
      functional_notifications: false,
      analytics_usage: true,
      marketing_emails: false,
    },
    onClose: () => console.log('onClose'),
    onAcceptAll: () => console.log('onAcceptAll'),
    onRejectNonEssential: () => console.log('onRejectNonEssential'),
    onSavePreferences: (choices) => console.log('onSavePreferences', choices),
  },
};

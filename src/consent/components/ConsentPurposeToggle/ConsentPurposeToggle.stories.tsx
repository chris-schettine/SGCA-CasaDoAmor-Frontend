import type { Meta, StoryObj } from '@storybook/react';
import { ConsentPurposeToggle } from './ConsentPurposeToggle';
import { CONSENT_PURPOSES } from '../../config/consentConfig';

const meta: Meta<typeof ConsentPurposeToggle> = {
  title: 'Consent/ConsentPurposeToggle',
  component: ConsentPurposeToggle,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Toggle individual para uma finalidade de consentimento. Finalidades essenciais são desabilitadas.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentPurposeToggle>;

/**
 * Finalidade essencial (não pode desabilitar)
 */
export const Essential: Story = {
  args: {
    purpose: CONSENT_PURPOSES.find((p) => p.id === 'essential_auth')!,
    checked: true,
    onChange: (id, checked) => console.log('onChange', id, checked),
    disabled: false,
  },
};

/**
 * Finalidade opcional - ativada
 */
export const OptionalEnabled: Story = {
  args: {
    purpose: CONSENT_PURPOSES.find((p) => p.id === 'analytics_usage')!,
    checked: true,
    onChange: (id, checked) => console.log('onChange', id, checked),
    disabled: false,
  },
};

/**
 * Finalidade opcional - desativada
 */
export const OptionalDisabled: Story = {
  args: {
    purpose: CONSENT_PURPOSES.find((p) => p.id === 'marketing_emails')!,
    checked: false,
    onChange: (id, checked) => console.log('onChange', id, checked),
    disabled: false,
  },
};

/**
 * Estado de loading (disabled)
 */
export const Loading: Story = {
  args: {
    purpose: CONSENT_PURPOSES.find((p) => p.id === 'functional_preferences')!,
    checked: true,
    onChange: (id, checked) => console.log('onChange', id, checked),
    disabled: true,
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Alert } from '@mui/material';
import { ConsentGuard } from './ConsentGuard';
import { ConsentProvider } from '../../provider/ConsentProvider';

const meta: Meta<typeof ConsentGuard> = {
  title: 'Consent/ConsentGuard',
  component: ConsentGuard,
  decorators: [
    (Story) => (
      <ConsentProvider>
        <Box sx={{ p: 4 }}>
          <Story />
        </Box>
      </ConsentProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConsentGuard>;

/**
 * Guard para analytics (usuário precisa consentir primeiro)
 */
export const AnalyticsGuard: Story = {
  args: {
    purposeId: 'analytics_usage',
    children: (
      <Alert severity="success">
        Analytics ativo! Rastreando pageviews...
      </Alert>
    ),
    fallback: (
      <Alert severity="info">
        Analytics desativado. Ative nas preferências para nos ajudar a melhorar.
      </Alert>
    ),
  },
};

/**
 * Guard para marketing (sem fallback)
 */
export const MarketingGuard: Story = {
  args: {
    purposeId: 'marketing_emails',
    children: (
      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'primary.main' }}>
        <Typography variant="h6" gutterBottom>
          📧 Inscreva-se na Newsletter
        </Typography>
        <Typography variant="body2">
          Receba novidades e atualizações diretamente no seu email.
        </Typography>
      </Box>
    ),
  },
};

/**
 * Guard para notificações
 */
export const NotificationsGuard: Story = {
  args: {
    purposeId: 'functional_notifications',
    children: (
      <Alert severity="success" icon="🔔">
        Notificações ativadas! Você será avisado sobre novos eventos.
      </Alert>
    ),
    fallback: (
      <Alert severity="warning">
        Notificações desativadas. Você pode perdeu atualizações importantes.
      </Alert>
    ),
  },
};

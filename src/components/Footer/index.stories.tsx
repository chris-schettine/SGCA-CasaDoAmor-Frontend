import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ConsentContext } from '../../consent/provider/ConsentProvider';
import type { ConsentContextValue } from '../../consent/types/consent.types';
import Footer from './index';

const mockConsentValue: ConsentContextValue = {
  state: { type: 'consented', choices: {}, timestamp: new Date().toISOString() },
  hasConsent: () => true,
  openDialog: () => alert('Abrir gerenciador de consentimento'),
  withdrawConsent: async () => undefined,
  isLoading: false,
  choices: {},
  dialogOpen: false,
  dialogRequired: false,
};

const MockConsentProvider = ({ children }: PropsWithChildren) => (
  <ConsentContext.Provider value={mockConsentValue}>{children}</ConsentContext.Provider>
);

const meta = {
  title: 'Components/Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MockConsentProvider>
          <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
            <Box sx={{ flex: 1 }} />
            <Story />
          </Box>
        </MockConsentProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

import type { Meta, StoryObj } from '@storybook/react';
import { ConsentManageLink } from './ConsentManageLink';
import { ConsentProvider } from '../../provider/ConsentProvider';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../../api/api.gateway';
import { useEffect } from 'react';

const meta: Meta<typeof ConsentManageLink> = {
  title: 'Consent/ConsentManageLink',
  component: ConsentManageLink,
  decorators: [
    (Story) => {
      useEffect(() => {
        const mock = new MockAdapter(api, { delayResponse: 50 });
        mock.onGet(/\/api\/profissionais\/.*\/consentimentos/).reply(200, {
          content: [],
          page: 0,
          totalPages: 1,
          totalElements: 0,
          size: 10,
        });
        mock.onPost(/\/api\/profissionais\/.*\/consentimentos/).reply(200, { ok: true });
        mock.onGet(/\/api\/usuarios\/.*\/consentimentos-lgpd/).reply(200, []);
        mock.onPost(/\/api\/usuarios\/.*\/consentimentos-lgpd/).reply(200, { ok: true });

        const originalFetch = globalThis.fetch;
        globalThis.fetch = async () =>
          ({
            ok: true,
            json: async () => ({ ip: '127.0.0.1' }),
          } as Response);

        return () => {
          mock.restore();
          globalThis.fetch = originalFetch;
        };
      }, []);

      return (
        <ConsentProvider>
          <Story />
        </ConsentProvider>
      );
    },
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

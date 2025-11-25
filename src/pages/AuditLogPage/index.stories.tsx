import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { AuditLogPage } from '.';
import type { AuditPerfisResponseDTO } from '../../api/admin.dto';
import { adminService } from '../../api/admin.service';

const meta: Meta<typeof AuditLogPage> = {
  title: 'Pages/AuditLogPage',
  component: AuditLogPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AuditLogPage>;

const mockData: AuditPerfisResponseDTO = {
  relatorioLogins: {
    tentativas: [
      {
        id: 1,
        cpf: '12345678900',
        dataTentativa: new Date().toISOString(),
        sucesso: true,
        motivoFalha: null,
        ipOrigem: '192.168.0.10',
        userAgent: 'Chrome',
        usuario: { nome: 'Admin', email: 'admin@example.com', cpf: '12345678900' },
      },
      {
        id: 2,
        cpf: '98765432100',
        dataTentativa: new Date().toISOString(),
        sucesso: false,
        motivoFalha: 'Senha incorreta',
        ipOrigem: '192.168.0.11',
        userAgent: 'Firefox',
        usuario: { nome: 'Colaborador', email: 'colab@example.com', cpf: '98765432100' },
      },
    ],
  },
};

const emptyData: AuditPerfisResponseDTO = {
  relatorioLogins: {
    tentativas: [],
  },
};

const originalGetAuditPerfis = adminService.getAuditPerfis.bind(adminService);

// Default mock to avoid real backend calls.
adminService.getAuditPerfis = async () => mockData;

const resetService = () => {
  adminService.getAuditPerfis = originalGetAuditPerfis;
};

export const Default: Story = {
  render: () => {
    return <AuditLogPage />;
  },
};

export const Loading: Story = {
  render: () => {
    useEffect(() => {
      adminService.getAuditPerfis = async () =>
        new Promise((resolve) => setTimeout(() => resolve(mockData), 3000));
      return () => {
        adminService.getAuditPerfis = async () => mockData;
      };
    }, []);
    return <AuditLogPage />;
  },
};

export const Empty: Story = {
  render: () => {
    useEffect(() => {
      adminService.getAuditPerfis = async () => emptyData;
      return () => {
        adminService.getAuditPerfis = async () => mockData;
      };
    }, []);
    return <AuditLogPage />;
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import FormSection from './index';
import { TextField, Box, Stack, MenuItem } from '@mui/material';

const meta: Meta<typeof FormSection> = {
  title: 'Components/FormSection',
  component: FormSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Seção básica de formulário
 */
export const Basic: Story = {
  args: {
    title: 'Dados Pessoais',
    children: (
      <Stack spacing={2}>
        <TextField fullWidth label="Nome Completo" />
        <TextField fullWidth label="CPF" />
        <TextField fullWidth label="Email" type="email" />
        <TextField fullWidth label="Telefone" />
      </Stack>
    ),
  },
};

/**
 * Seção com subtítulo
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Endereço',
    subtitle: 'Preencha os dados do endereço do paciente',
    children: (
      <Stack spacing={2}>
        <TextField fullWidth label="CEP" />
        <TextField fullWidth label="Logradouro" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth label="Número" />
          <TextField fullWidth label="Complemento" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth label="Bairro" />
          <TextField fullWidth label="Cidade" />
        </Box>
      </Stack>
    ),
  },
};

/**
 * Seção com campos de seleção
 */
export const WithSelects: Story = {
  args: {
    title: 'Dados Profissionais',
    subtitle: 'Informações sobre a atuação profissional',
    children: (
      <Stack spacing={2}>
        <TextField fullWidth label="Cargo" select defaultValue="">
          <MenuItem value="admin">Administrador</MenuItem>
          <MenuItem value="medico">Médico</MenuItem>
          <MenuItem value="enfermeiro">Enfermeiro</MenuItem>
          <MenuItem value="psicologo">Psicólogo</MenuItem>
        </TextField>
        <TextField fullWidth label="Departamento" select defaultValue="">
          <MenuItem value="clinica">Clínica Geral</MenuItem>
          <MenuItem value="psicologia">Psicologia</MenuItem>
          <MenuItem value="admin">Administrativo</MenuItem>
        </TextField>
        <TextField 
          fullWidth 
          label="Observações" 
          multiline 
          rows={4}
          placeholder="Adicione observações relevantes..."
        />
      </Stack>
    ),
  },
};

/**
 * Seção sem Paper (noPaper)
 */
export const NoPaper: Story = {
  args: {
    title: 'Configurações',
    noPaper: true,
    children: (
      <Stack spacing={2}>
        <TextField fullWidth label="Nome do Sistema" />
        <TextField fullWidth label="Email de Contato" />
      </Stack>
    ),
  },
};

/**
 * Múltiplas seções em sequência
 */
export const MultipleSections: Story = {
  render: () => (
    <Stack spacing={3}>
      <FormSection 
        title="Identificação" 
        subtitle="Dados básicos de identificação"
      >
        <Stack spacing={2}>
          <TextField fullWidth label="Nome" />
          <TextField fullWidth label="CPF" />
        </Stack>
      </FormSection>

      <FormSection 
        title="Contato" 
        subtitle="Informações de contato"
      >
        <Stack spacing={2}>
          <TextField fullWidth label="Email" type="email" />
          <TextField fullWidth label="Telefone" />
        </Stack>
      </FormSection>

      <FormSection title="Observações">
        <TextField 
          fullWidth 
          multiline 
          rows={4}
          placeholder="Adicione observações..."
        />
      </FormSection>
    </Stack>
  ),
};

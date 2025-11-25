import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormInputs } from '../../schemas/userSchema';
import UserForm from '.';
import { Grid } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../api/api.gateway';

const queryClient = new QueryClient();

// Prepare roles mock once so network calls never hit a real backend.
const rolesMock = new MockAdapter(api, { delayResponse: 25 });
rolesMock.onGet('/admin/roles').reply(200, [
  { id: 1, nome: 'Administrador', descricao: 'Acesso total', permissoes: [], totalPermissoes: 0 },
  { id: 2, nome: 'Médico', descricao: 'Permissões médicas', permissoes: [], totalPermissoes: 0 },
]);
rolesMock.onAny().passThrough();

const meta: Meta<typeof UserForm> = {
  title: 'Components/UserForm',
  component: UserForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Grid container spacing={2}>
          <Story />
        </Grid>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserForm>;

const UserFormStory: React.FC<{ defaultValues?: Partial<UserFormInputs> }> = ({ defaultValues }) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  return (
    <UserForm
      register={register}
      errors={errors}
      control={control}
      watch={watch}
      setValue={setValue}
      setError={setError}
      clearErrors={clearErrors}
    />
  );
};

export const Default: Story = {
  render: () => <UserFormStory />,
};

export const WithData: Story = {
  render: () => (
    <UserFormStory
      defaultValues={{
        tipo: 'MEDICO',
        nomeUsuario: 'Dr. Fulano de Tal',
        cpfUsuario: '123.456.789-00',
        sexo: 'MASCULINO',
        dataNascimento: '01/01/1980',
        naturalidade: 'Brasileiro',
        estadoCivil: 'Casado',
        registro: 'CRM/SP 12345',
        rqe: '1234',
        email: 'fulano@example.com',
        telefone: '11 99999 9999',
        cep: '12345-678',
        endereco: 'Rua dos Bobos',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        numero: '0',
        complemento: 'Apto 123',
        perfisIds: [1],
      }}
    />
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormInputs } from '../../schemas/userSchema';
import UserForm from '.';
import { Grid } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const meta: Meta<typeof UserForm> = {
  title: 'Components/UserForm',
  component: UserForm,
  decorators: [
    (Story) => {
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
      });

      return (
        <QueryClientProvider client={queryClient}>
          <Grid container spacing={2}>
            <Story
              args={{
                register,
                errors,
                control,
                watch,
                setValue,
                setError,
                clearErrors,
              }}
            />
          </Grid>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof UserForm>;

export const Default: Story = {};

export const WithData: Story = {
  decorators: [
    (Story) => {
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
        defaultValues: {
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
          telefone: '11 99999-9999',
          cep: '12345-678',
          endereco: 'Rua dos Bobos',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          numero: '0',
          complemento: 'Apto 123',
          perfisIds: [1],
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <Grid container spacing={2}>
            <Story
              args={{
                register,
                errors,
                control,
                watch,
                setValue,
                setError,
                clearErrors,
              }}
            />
          </Grid>
        </QueryClientProvider>
      );
    },
  ],
};

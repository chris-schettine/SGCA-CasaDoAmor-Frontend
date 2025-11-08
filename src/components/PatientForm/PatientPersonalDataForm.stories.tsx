import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import PatientPersonalDataForm from './PatientPersonalDataForm';
import { Grid } from '@mui/material';

const meta: Meta<typeof PatientPersonalDataForm> = {
  title: 'Components/PatientForm/PatientPersonalDataForm',
  component: PatientPersonalDataForm,
  decorators: [
    (Story) => {
      const {
        register,
        formState: { errors },
        watch,
        setValue,
        control,
      } = useForm<PatientFormInputs>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
          nomeCompletoPaciente: '',
          cpfPaciente: '',
          dataNascimento: '',
          idade: '',
          naturalidade: '',
          rg: '',
          nomeMae: '',
          profissao: '',
          telefone: '',
          cep: '',
          endereco: '',
          bairro: '',
          cidade: '',
          estado: '',
          numero: '',
          complemento: '',
        },
      });

      const handleCepSearch = async (cep: string) => {
        console.log('Searching for CEP:', cep);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      };

      return (
        <Grid container spacing={2}>
          <Story
            args={{
              register,
              errors,
              watch,
              setValue,
              control,
              handleCepSearch,
              isCepLoading: false,
            }}
          />
        </Grid>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof PatientPersonalDataForm>;

export const Default: Story = {};

export const WithData: Story = {
  decorators: [
    (Story) => {
      const {
        register,
        formState: { errors },
        watch,
        setValue,
        control,
      } = useForm<PatientFormInputs>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
          nomeCompletoPaciente: 'Fulano de Tal',
          cpfPaciente: '123.456.789-00',
          dataNascimento: '01/01/1990',
          idade: '34',
          naturalidade: 'Brasileiro',
          rg: '12.345.678-9',
          nomeMae: 'Ciclana de Tal',
          profissao: 'Engenheiro',
          telefone: '11 99999-9999',
          cep: '12345-678',
          endereco: 'Rua dos Bobos',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          numero: '0',
          complemento: 'Apto 123',
        },
      });

      const handleCepSearch = async (cep: string) => {
        console.log('Searching for CEP:', cep);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      };

      return (
        <Grid container spacing={2}>
          <Story
            args={{
              register,
              errors,
              watch,
              setValue,
              control,
              handleCepSearch,
              isCepLoading: false,
            }}
          />
        </Grid>
      );
    },
  ],
};

import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import PatientDetailsForm from './PatientDetailsForm';
import { Grid } from '@mui/material';

const meta: Meta<typeof PatientDetailsForm> = {
  title: 'Components/PatientForm/PatientDetailsForm',
  component: PatientDetailsForm,
  decorators: [
    (Story) => {
      const {
        register,
        formState: { errors },
        control,
        watch,
      } = useForm<PatientFormInputs>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
          condicaoChegada: 'nenhum',
          usoSonda: 'nao',
          seForOutra: '',
          usoCurativo: 'nao',
          usoOxigenoterapia: 'nao',
          tratamento: '',
          diagnostico: '',
        },
      });

      return (
        <Grid container spacing={2}>
          <Story
            args={{
              register,
              errors,
              control,
              watch,
            }}
          />
        </Grid>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof PatientDetailsForm>;

export const Default: Story = {};

export const WithData: Story = {
  decorators: [
    (Story) => {
      const {
        register,
        formState: { errors },
        control,
        watch,
      } = useForm<PatientFormInputs>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
          condicaoChegada: 'cadeira_rodas',
          usoSonda: 'outra',
          seForOutra: 'Sonda nasogástrica',
          usoCurativo: 'sim',
          usoOxigenoterapia: 'sim',
          tratamento: 'Fisioterapia respiratória',
          diagnostico: 'Insuficiência respiratória',
        },
      });

      return (
        <Grid container spacing={2}>
          <Story
            args={{
              register,
              errors,
              control,
              watch,
            }}
          />
        </Grid>
      );
    },
  ],
};
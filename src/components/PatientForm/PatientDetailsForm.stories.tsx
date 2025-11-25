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
    (Story) => (
      <Grid container spacing={2}>
        <Story />
      </Grid>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatientDetailsForm>;

const BaseDetailsForm = ({ defaultValues }: { defaultValues?: Partial<PatientFormInputs> }) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  return (
    <Grid container spacing={2}>
      <PatientDetailsForm register={register} errors={errors} control={control} watch={watch} />
    </Grid>
  );
};

export const Default: Story = {
  render: () => <BaseDetailsForm />,
};

export const WithData: Story = {
  render: () => {
    return (
      <BaseDetailsForm
        defaultValues={{
          condicaoChegada: 'cadeira_rodas',
          usoSonda: 'outra',
          seForOutra: 'Sonda nasogástrica',
          usoCurativo: 'sim',
          usoOxigenoterapia: 'sim',
          tratamento: 'OUTRO',
          diagnostico: 'Insuficiência respiratória',
        }}
      />
    );
  },
};

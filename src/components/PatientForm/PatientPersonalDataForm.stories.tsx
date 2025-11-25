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
    (Story) => (
      <Grid container spacing={2}>
        <Story />
      </Grid>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatientPersonalDataForm>;

const BaseForm = ({ defaultValues }: { defaultValues?: Partial<PatientFormInputs> }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  const handleCepSearch = async (cep: string) => {
    console.log('Searching for CEP:', cep);
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  return (
    <Grid container spacing={2}>
      <PatientPersonalDataForm
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        control={control}
        handleCepSearch={handleCepSearch}
        isCepLoading={false}
      />
    </Grid>
  );
};

export const Default: Story = {
  render: () => <BaseForm />,
};

export const WithData: Story = {
  render: () => {
    return (
      <BaseForm
        defaultValues={{
          nomeCompletoPaciente: 'Fulano de Tal',
          cpfPaciente: '123.456.789-00',
          dataNascimento: '01/01/1990',
          idade: '34',
          naturalidade: 'Brasileiro',
          rg: '12.345.678-9',
          nomeMae: 'Ciclana de Tal',
          profissao: 'Engenheiro',
          telefone: '11 99999 9999',
          cep: '12345-678',
          endereco: 'Rua dos Bobos',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          numero: '0',
          complemento: 'Apto 123',
        }}
      />
    );
  },
};

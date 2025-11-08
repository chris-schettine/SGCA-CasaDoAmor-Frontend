import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button } from '@mui/material';
import CompanionForm from './index';
import { companionSchema, type CompanionFormInputs } from '../../schemas/companionSchema';

const meta: Meta<typeof CompanionForm> = {
  title: 'Components/Forms/CompanionForm',
  component: CompanionForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isExistingCompanion: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CompanionForm>;

const CompanionFormWrapper = (props: { isExistingCompanion: boolean }) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanionFormInputs>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
        acompanhanteNome: props.isExistingCompanion ? 'Fulano de Tal' : '',
        cpfAcompanhante: props.isExistingCompanion ? '123.456.789-00' : '',
        telefoneAcompanhante: props.isExistingCompanion ? '11 98765-4321' : '',
        cepAcompanhante: props.isExistingCompanion ? '12345-678' : '',
        enderecoAcompanhante: props.isExistingCompanion ? 'Rua dos Bobos' : '',
        bairroAcompanhante: props.isExistingCompanion ? 'Centro' : '',
        numeroAcompanhante: props.isExistingCompanion ? '0' : '',
        podeAjudarCozinha: 'nao',
    },
  });

  const onSubmit = (data: CompanionFormInputs) => {
    console.log('CompanionForm submit', data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3, border: '1px dashed grey', borderRadius: 1, width: '100%', maxWidth: '900px' }}>
      <CompanionForm
        register={register}
        errors={errors}
        watch={watch}
        control={control}
        handleCepSearch={async (cep) => {
          console.log('CompanionForm handleCepSearch', cep);
        }}
        isExistingCompanion={props.isExistingCompanion}
      />
      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Salvar
      </Button>
    </Box>
  );
};

export const NewCompanion: Story = {
  render: () => <CompanionFormWrapper isExistingCompanion={false} />,
  name: 'New Companion',
};

export const ExistingCompanion: Story = {
  render: () => <CompanionFormWrapper isExistingCompanion={true} />,
  name: 'Existing Companion (Disabled Fields)',
};

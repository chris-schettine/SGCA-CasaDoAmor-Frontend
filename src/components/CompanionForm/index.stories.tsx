import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type {
  Control,
  FieldErrors,
  Resolver,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import CompanionForm from './index';
import {
  companionSchema,
  type CompanionFormInputs,
  type EditCompanionFormInputs,
} from '../../schemas/companionSchema';

type CompanionFormStoryProps = {
  isExistingCompanion: boolean;
};

const buildDefaultValues = (isExistingCompanion: boolean): CompanionFormInputs => ({
  dadoPessoal: {
    nome: isExistingCompanion ? 'Fulano de Tal' : '',
    nomeMae: isExistingCompanion ? 'Maria de Tal' : '',
    dataNascimento: isExistingCompanion ? '15/05/1980' : '',
    cpf: isExistingCompanion ? '123.456.789-00' : '',
    rg: isExistingCompanion ? '12.345.678-9' : undefined,
    naturalidade: isExistingCompanion ? 'Sao Paulo' : '',
    profissao: isExistingCompanion ? 'Administrador' : '',
    telefone: isExistingCompanion ? '11 98765-4321' : '',
    estadoCivil: isExistingCompanion ? 'CASADO' : undefined,
  },
  endereco: {
    logradouro: isExistingCompanion ? 'Rua dos Bobos' : '',
    numero: isExistingCompanion ? 123 : undefined,
    complemento: isExistingCompanion ? 'Apto 12' : '',
    bairro: isExistingCompanion ? 'Centro' : '',
    cidade: isExistingCompanion ? 'Sao Paulo' : '',
    estado: isExistingCompanion ? 'SP' : undefined,
    cep: isExistingCompanion ? '12345-678' : undefined,
  },
  parentesco: isExistingCompanion ? 'CONJUGE' : 'PAI',
  pacienteId: isExistingCompanion ? 'existing-patient-id' : 'new-patient-id',
  podeAjudarNaCozinha: isExistingCompanion,
});

const CompanionFormStoryWrapper = ({ isExistingCompanion }: CompanionFormStoryProps) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    setError,
  } = useForm<CompanionFormInputs>({
    resolver: zodResolver(companionSchema) as Resolver<CompanionFormInputs>,
    defaultValues: buildDefaultValues(isExistingCompanion),
  });

  const onSubmit = handleSubmit((data) => {
    console.log('CompanionForm submit', data);
  });

  const registerProp = register as UseFormRegister<CompanionFormInputs | EditCompanionFormInputs>;
  const controlProp = control as unknown as Control<CompanionFormInputs | EditCompanionFormInputs>;
  const watchProp = watch as UseFormWatch<CompanionFormInputs | EditCompanionFormInputs>;
  const errorsProp = errors as FieldErrors<CompanionFormInputs | EditCompanionFormInputs>;
  const setValueProp = setValue as UseFormSetValue<CompanionFormInputs | EditCompanionFormInputs>;
  const clearErrorsProp = clearErrors as UseFormClearErrors<CompanionFormInputs | EditCompanionFormInputs>;
  const setErrorProp = setError as UseFormSetError<CompanionFormInputs | EditCompanionFormInputs>;

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ p: 3, border: '1px dashed grey', borderRadius: 1, width: '100%', maxWidth: '900px' }}
    >
      <CompanionForm
        register={registerProp}
        errors={errorsProp}
        watch={watchProp}
        control={controlProp}
        setValue={setValueProp}
        clearErrors={clearErrorsProp}
        setError={setErrorProp}
        isEditMode={isExistingCompanion}
      />
      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Salvar
      </Button>
    </Box>
  );
};

const meta = {
  title: 'Components/Forms/CompanionForm',
  component: CompanionFormStoryWrapper,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isExistingCompanion: {
      control: 'boolean',
    },
  },
} satisfies Meta<CompanionFormStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewCompanion: Story = {
  args: {
    isExistingCompanion: false,
  },
};

export const ExistingCompanion: Story = {
  args: {
    isExistingCompanion: true,
  },
};

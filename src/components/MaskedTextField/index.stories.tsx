import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import MaskedTextField from './index';

const meta: Meta<typeof MaskedTextField> = {
  title: 'Components/Inputs/MaskedTextField',
  component: MaskedTextField,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    mask: { control: 'text' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof MaskedTextField>;

const InteractiveWrapper = (props: any) => {
  const [value, setValue] = useState('');
  return (
    <MaskedTextField
      {...props}
      name="masked-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export const CPF: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    label: 'CPF',
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
  },
};

export const CEP: Story = {
    render: (args) => <InteractiveWrapper {...args} />,
    args: {
      label: 'CEP',
      mask: '00000-000',
      placeholder: '00000-000',
    },
  };

export const Phone: Story = {
    render: (args) => <InteractiveWrapper {...args} />,
    args: {
      label: 'Telefone',
      mask: '(00) 00000-0000',
      placeholder: '(00) 00000-0000',
    },
};

export const Date: Story = {
    render: (args) => <InteractiveWrapper {...args} />,
    args: {
      label: 'Data',
      mask: '00/00/0000',
      placeholder: 'DD/MM/AAAA',
    },
};

export const WithError: Story = {
    render: (args) => <InteractiveWrapper {...args} />,
    args: {
      label: 'CPF com Erro',
      mask: '000.000.000-00',
      placeholder: '000.000.000-00',
      error: true,
      helperText: 'CPF inválido.',
    },
};

export const AllMasks: Story = {
    render: (args) => (
        <Stack spacing={3} sx={{width: 300, padding: 2}}>
            <InteractiveWrapper {...CPF.args} />
            <InteractiveWrapper {...CEP.args} />
            <InteractiveWrapper {...Phone.args} />
            <InteractiveWrapper {...Date.args} />
            <InteractiveWrapper {...WithError.args} />
        </Stack>
    ),
    name: 'All Masks Showcase'
}
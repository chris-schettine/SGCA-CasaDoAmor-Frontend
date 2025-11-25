import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '@mui/material';
import { expect, userEvent, within } from 'storybook/test';
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
type MaskedTextFieldProps = React.ComponentProps<typeof MaskedTextField>;

const InteractiveWrapper = (props: MaskedTextFieldProps) => {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText('CPF');
    await userEvent.clear(input);
    await userEvent.type(input, '12345678901');
    await expect(input).toHaveValue('123.456.789-01');
  },
};

export const CEP: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    label: 'CEP',
    mask: '00000-000',
    placeholder: '00000-000',
    ariaLabel: 'CEP',
  },
};

export const Phone: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    label: 'Telefone',
    mask: '(00) 00000-0000',
    placeholder: '(00) 00000-0000',
    ariaLabel: 'Telefone',
  },
};

export const Date: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    label: 'Data',
    mask: '00/00/0000',
    placeholder: 'DD/MM/AAAA',
    ariaLabel: 'Data',
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
  render: () => (
    <Stack spacing={3} sx={{ width: 300, padding: 2 }}>
      <InteractiveWrapper {...(CPF.args as MaskedTextFieldProps)} />
      <InteractiveWrapper {...(CEP.args as MaskedTextFieldProps)} />
      <InteractiveWrapper {...(Phone.args as MaskedTextFieldProps)} />
      <InteractiveWrapper {...(Date.args as MaskedTextFieldProps)} />
      <InteractiveWrapper {...(WithError.args as MaskedTextFieldProps)} />
    </Stack>
  ),
  name: 'All Masks Showcase',
};

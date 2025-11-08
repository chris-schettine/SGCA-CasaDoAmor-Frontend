import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import CustomCheckbox from './index';

const meta: Meta<typeof CustomCheckbox> = {
  title: 'Components/Inputs/CustomCheckbox',
  component: CustomCheckbox,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  args: {
    label: 'Eu aceito os termos e condições',
  },
};

export default meta;

type Story = StoryObj<typeof CustomCheckbox>;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
    args: {
      checked: true,
      disabled: true,
    },
  };

export const Interactive: Story = {
  render: (args) => {
    const [isChecked, setIsChecked] = useState(false);
    return (
      <CustomCheckbox
        {...args}
        checked={isChecked}
        onChange={(e) => {
          setIsChecked(e.target.checked);
          args.onChange?.(e);
        }}
      />
    );
  },
};
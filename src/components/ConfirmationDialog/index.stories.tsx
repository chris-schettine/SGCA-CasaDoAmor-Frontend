import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import ConfirmationDialog from './index';

const meta: Meta<typeof ConfirmationDialog> = {
  title: 'Components/Feedback/ConfirmationDialog',
  component: ConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'close' },
    onConfirm: { action: 'confirm' },
  },
  args: {
    title: 'Excluir paciente',
    message: 'Tem certeza que deseja remover este paciente? Esta ação não pode ser desfeita.',
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmationDialog>;

export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Stack spacing={2} alignItems="center">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Abrir diálogo
        </Button>
        <ConfirmationDialog
          {...args}
          open={open}
          onClose={() => {
            setOpen(false);
            args.onClose?.();
          }}
          onConfirm={() => {
            setOpen(false);
            args.onConfirm?.();
          }}
        />
      </Stack>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentProps } from 'react';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import TransitionProvider from '../../motion/TransitionProvider';
import StandardDialog from './index';

const meta = {
  title: 'Components/Feedback/StandardDialog',
  component: StandardDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    open: { control: false },
    onClose: { action: 'onClose' },
  },
  args: {
    fullWidth: true,
    maxWidth: 'sm',
  },
  decorators: [
    (Story) => (
      <TransitionProvider>
        <Story />
      </TransitionProvider>
    ),
  ],
} satisfies Meta<typeof StandardDialog>;

export default meta;
type Story = StoryObj<typeof StandardDialog>;

type DialogExampleProps = ComponentProps<typeof StandardDialog>;

const DialogExample = (args: DialogExampleProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Abrir diálogo
      </Button>

      <StandardDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="standard-dialog-title"
      >
        <DialogTitle id="standard-dialog-title">Confirmar ação</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            Use este wrapper para manter as transições consistentes com o restante da aplicação. Aplique suas
            props do MUI normalmente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Confirmar
          </Button>
        </DialogActions>
      </StandardDialog>
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <DialogExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: /abrir diálogo/i }));
    await waitFor(async () => expect(await screen.findByRole('dialog')).toBeVisible());
    const confirmBtn = await screen.findByRole('button', { name: /confirmar/i });
    await userEvent.click(confirmBtn);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const WithoutTransition: Story = {
  args: {
    TransitionProps: { timeout: 0 },
  },
  render: (args) => <DialogExample {...args} />,
};

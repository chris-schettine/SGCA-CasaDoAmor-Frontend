import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@mui/material';
import KeyboardShortcutsHelp from './index';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

const sampleShortcuts: KeyboardShortcut[] = [
  {
    key: 's',
    ctrl: true,
    handler: () => {},
    description: 'Salvar formulário',
  },
  {
    key: 'n',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Criar novo paciente',
  },
  {
    key: 'f',
    ctrl: true,
    handler: () => {},
    description: 'Focar na busca',
  },
  {
    key: 'Escape',
    handler: () => {},
    description: 'Fechar diálogo ou menu',
  },
  {
    key: '?',
    handler: () => {},
    description: 'Abrir ajuda de atalhos',
  },
];

const meta: Meta<typeof KeyboardShortcutsHelp> = {
  title: 'Components/Feedback/KeyboardShortcutsHelp',
  component: KeyboardShortcutsHelp,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    open: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
  args: {
    shortcuts: sampleShortcuts,
  },
};

export default meta;

type Story = StoryObj<typeof KeyboardShortcutsHelp>;

export const Default: Story = {
  args: {
    open: true,
  },
  name: 'Dialog Open',
};

export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Abrir Atalhos
        </Button>
        <KeyboardShortcutsHelp
          {...args}
          open={open}
          onClose={() => {
            setOpen(false);
            args.onClose();
          }}
        />
      </>
    );
  },
  name: 'Interactive Dialog',
};

export const EmptyState: Story = {
    args: {
      open: true,
      shortcuts: [],
    },
    name: 'Empty State',
  };
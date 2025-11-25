import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Tab, Typography } from '@mui/material';
import TransitionProvider from '../../motion/TransitionProvider';
import StandardTabs from './index';

const meta = {
  title: 'Components/Navigation/StandardTabs',
  component: StandardTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: { control: false },
    onChange: { action: 'onChange' },
  },
  args: {
    textColor: 'primary',
    indicatorColor: 'primary',
  },
  decorators: [
    (Story) => (
      <TransitionProvider>
        <Story />
      </TransitionProvider>
    ),
  ],
} satisfies Meta<typeof StandardTabs>;

export default meta;
type Story = StoryObj<typeof StandardTabs>;

const TabsExample = (args: Story['args']) => {
  const [value, setValue] = useState(0);

  return (
    <Box>
      <StandardTabs {...args} value={value} onChange={(_, newValue) => setValue(newValue)}>
        <Tab label="Perfil" value={0} />
        <Tab label="Contato" value={1} />
        <Tab label="Histórico" value={2} />
      </StandardTabs>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Aba ativa: {['Perfil', 'Contato', 'Histórico'][value]}
        </Typography>
      </Box>
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <TabsExample {...args} />,
};

export const Scrollable: Story = {
  render: (args) => {
    const [value, setValue] = useState(0);

    return (
      <Box>
        <StandardTabs
          {...args}
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {['Geral', 'Documentos', 'Prontuário', 'Evoluções', 'Financeiro', 'Preferências'].map((label, index) => (
            <Tab key={label} label={label} value={index} />
          ))}
        </StandardTabs>
      </Box>
    );
  },
};

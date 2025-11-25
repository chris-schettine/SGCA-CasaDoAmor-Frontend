import type { Meta, StoryObj } from '@storybook/react';
import { Paper, Typography } from '@mui/material';
import PageContainer from './index';

const meta = {
  title: 'Components/Layout/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof PageContainer>;

const Placeholder = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>
      Conteúdo da página
    </Typography>
    <Typography variant="body2" color="text.secondary">
      O PageContainer centraliza e aplica paddings consistentes entre páginas. Use-o como wrapper padrão para
      tabelas, formulários ou listagens.
    </Typography>
  </Paper>
);

export const Default: Story = {
  render: (args) => (
    <PageContainer {...args}>
      <Placeholder />
    </PageContainer>
  ),
};

export const FullWidthOnMobile: Story = {
  render: (args) => (
    <PageContainer {...args} fullWidthOnMobile>
      <Placeholder />
    </PageContainer>
  ),
};

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Meta, StoryObj } from '@storybook/react';
import { AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import TransitionProvider from '../../motion/TransitionProvider';
import StandardAccordion from './index';

const meta = {
  title: 'Components/Surfaces/StandardAccordion',
  component: StandardAccordion,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TransitionProvider>
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          <Story />
        </Box>
      </TransitionProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StandardAccordion>;

export default meta;
type Story = StoryObj<typeof StandardAccordion>;

const AccordionContent = () => (
  <Typography variant="body2" color="text.secondary">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
    sit amet blandit leo lobortis eget.
  </Typography>
);

export const Default: Story = {
  render: (args) => (
    <StandardAccordion {...args} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" component="h3">Informações gerais</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <AccordionContent />
      </AccordionDetails>
    </StandardAccordion>
  ),
};

export const MultipleAccordions: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <StandardAccordion {...args} defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" component="h3">Paciente</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AccordionContent />
        </AccordionDetails>
      </StandardAccordion>
      <StandardAccordion {...args}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" component="h3">Contatos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AccordionContent />
        </AccordionDetails>
      </StandardAccordion>
      <StandardAccordion {...args}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" component="h3">Observações</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AccordionContent />
        </AccordionDetails>
      </StandardAccordion>
    </Box>
  ),
};

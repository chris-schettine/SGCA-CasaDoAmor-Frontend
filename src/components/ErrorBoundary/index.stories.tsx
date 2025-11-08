import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ErrorBoundary } from './index';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/Utils/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

const ProblematicComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated error!');
  }
  return (
    <Typography variant="h6" sx={{ p: 4, border: '2px dashed lightgreen' }}>
      This component is working correctly.
    </Typography>
  );
};

const InteractiveWrapper = () => {
  const [key, setKey] = useState(0);
  const [shouldThrow, setShouldThrow] = useState(false);

  const handleReset = () => {
    setShouldThrow(false);
    setKey((prev) => prev + 1); // Remounts the ErrorBoundary
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography gutterBottom>
        Use the button below to trigger an error inside the ErrorBoundary.
      </Typography>
      <Button
        variant="contained"
        color="error"
        onClick={() => setShouldThrow(true)}
        disabled={shouldThrow}
        sx={{ mb: 3 }}
      >
        Trigger Error
      </Button>
      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{ mb: 3, ml: 2 }}
      >
        Reset
      </Button>
      <ErrorBoundary key={key}>
        <ProblematicComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </Box>
  );
};

export const Default: Story = {
  render: () => (
    <Box sx={{ p: 4 }}>
      <Typography gutterBottom>
        The ErrorBoundary is wrapping the component below.
      </Typography>
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>
    </Box>
  ),
  name: 'Without Error',
};

export const WithError: Story = {
  render: () => <InteractiveWrapper />,
  name: 'Interactive Error Simulation',
};

const CustomFallback = (
    <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'lightblue' }}>
        <Typography variant="h4">A custom fallback UI</Typography>
        <Typography>Something went wrong, but we rendered this instead.</Typography>
    </Box>
);

export const WithCustomFallback: Story = {
    render: () => {
        const [key, setKey] = useState(0);
        const [shouldThrow, setShouldThrow] = useState(false);

        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Button variant="contained" color="error" onClick={() => setShouldThrow(true)} disabled={shouldThrow} sx={{ mb: 3 }}>
                    Trigger Error
                </Button>
                <Button variant="outlined" onClick={() => { setShouldThrow(false); setKey(k => k + 1); }} sx={{ mb: 3, ml: 2 }}>
                    Reset
                </Button>
                <ErrorBoundary key={key} fallback={CustomFallback}>
                    <ProblematicComponent shouldThrow={shouldThrow} />
                </ErrorBoundary>
            </Box>
        );
    },
    name: 'With Custom Fallback'
}

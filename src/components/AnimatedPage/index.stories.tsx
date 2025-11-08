import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatedPage, AnimatedPageScale, AnimatedPageSlide } from './index';

const meta: Meta<typeof AnimatedPage> = {
  title: 'Components/Utils/AnimatedPage',
  component: AnimatedPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AnimatedPage>;

const SamplePage = ({
  title,
  color,
}: {
  title: string;
  color: string;
}) => (
  <Box
    sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      position: 'absolute',
      top: 0,
      left: 0,
    }}
  >
    <Typography variant="h2" sx={{ color: 'white' }}>
      {title}
    </Typography>
  </Box>
);

export const FadeIn: Story = {
  render: () => (
    <AnimatedPage>
      <SamplePage title="Fade In Page" color="#2196f3" />
    </AnimatedPage>
  ),
};

export const SlideIn: StoryObj<typeof AnimatedPageSlide> = {
  render: () => (
    <AnimatedPageSlide>
      <SamplePage title="Slide In Page" color="#4caf50" />
    </AnimatedPageSlide>
  ),
};

export const ScaleIn: StoryObj<typeof AnimatedPageScale> = {
  render: () => (
    <AnimatedPageScale>
      <SamplePage title="Scale In Page" color="#f44336" />
    </AnimatedPageScale>
  ),
};

export const InteractiveTransition: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const pages = [
      {
        component: AnimatedPage,
        title: 'Page 1 (Fade)',
        color: '#2196f3',
      },
      {
        component: AnimatedPageSlide,
        title: 'Page 2 (Slide)',
        color: '#4caf50',
      },
      {
        component: AnimatedPageScale,
        title: 'Page 3 (Scale)',
        color: '#f44336',
      },
    ];

    const CurrentPage = pages[page].component;

    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <CurrentPage>
              <SamplePage title={pages[page].title} color={pages[page].color} />
            </CurrentPage>
          </motion.div>
        </AnimatePresence>
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            display: 'flex',
            gap: 2,
            background: 'rgba(255,255,255,0.8)',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          <button onClick={() => setPage(0)}>Page 1</button>
          <button onClick={() => setPage(1)}>Page 2</button>
          <button onClick={() => setPage(2)}>Page 3</button>
        </Box>
      </>
    );
  },
  name: 'Interactive Transition',
};

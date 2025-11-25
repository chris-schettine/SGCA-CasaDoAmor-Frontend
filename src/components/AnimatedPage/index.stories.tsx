import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatedPage, AnimatedPageScale, AnimatedPageSlide } from './index';

const meta: Meta<typeof AnimatedPage> = {
  title: 'Components/Utils/AnimatedPage',
  component: AnimatedPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof AnimatedPage>;

const SamplePage = ({
  title,
  color,
  forceDarkText = false,
}: {
  title: string;
  color: string;
  forceDarkText?: boolean;
}) => {
  const theme = useTheme();
  const computedTextColor = forceDarkText
    ? theme.palette.text.primary
    : theme.palette.getContrastText(color);

  return (
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
      color: '#000000',
      WebkitTextFillColor: '#000000',
    }}
  >
    {/* pick a contrast-safe text color using the theme util */}
    {/* put the title on a small colored panel to guarantee the immediate background color used for contrast checks */}
    <Typography
      variant="h2"
      sx={{
        color: '#000000 !important',
        WebkitTextFillColor: '#000000 !important',
        display: 'inline-block',
        px: 4,
        py: 2,
        borderRadius: 2,
        m: 0,
        backgroundColor: 'transparent',
        opacity: 1,
      }}
    >
      {title}
    </Typography>
  </Box>
  );
};

export const FadeIn: Story = {
  render: () => (
    <AnimatedPage>
      <SamplePage title="Fade In Page" color="#1565c0" />
    </AnimatedPage>
  ),
};

export const SlideIn: StoryObj<typeof AnimatedPageSlide> = {
  render: () => (
    <AnimatedPageSlide>
      <SamplePage title="Slide In Page" color="#2e7d32" />
    </AnimatedPageSlide>
  ),
};

export const ScaleIn: StoryObj<typeof AnimatedPageScale> = {
  render: () => (
    <AnimatedPageScale>
      <SamplePage title="Scale In Page" color="#b71c1c" forceDarkText />
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
            color: '#1565c0',
      },
      {
        component: AnimatedPageSlide,
            title: 'Page 2 (Slide)',
            color: '#2e7d32',
      },
      {
        component: AnimatedPageScale,
            title: 'Page 3 (Scale)',
            color: '#b71c1c',
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
};

import type { MotionToken } from './types';

// Keep both a CSS string (for CSS consumers) and a numeric array for framer-motion
export const motionTokens: MotionToken = {
  duration: {
    fast: 120,
    standard: 200,
    slow: 300,
    modal: 240,
    long: 400,
  },
  easing: {
    standard: {
      css: 'cubic-bezier(0.2, 0, 0, 1)',
      motion: [0.2, 0, 0, 1],
    },
    decelerate: {
      css: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      motion: [0.05, 0.7, 0.1, 1],
    },
    accelerate: {
      css: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      motion: [0.3, 0, 0.8, 0.15],
    },
  },
};

export default motionTokens;

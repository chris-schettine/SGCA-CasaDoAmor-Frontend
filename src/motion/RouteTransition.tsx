import React from 'react';
import { motion } from 'framer-motion';
import { useTransition } from './TransitionProvider';
import { useLocation } from 'react-router-dom';

interface RouteTransitionProps {
  children: React.ReactNode;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const { tokens, reducedMotion } = useTransition();
  const location = useLocation();

  const duration = tokens.duration.standard / 1000; // seconds for framer
  const easing = tokens.easing.standard.motion;

  const variants = {
    initial: { opacity: 0, x: 16 },
    enter: { opacity: 1, x: 0, transition: { duration, ease: easing } },
    exit: { opacity: 0, x: -8, transition: { duration: duration * 0.8, ease: easing } },
  };

  if (reducedMotion) {
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export default RouteTransition;

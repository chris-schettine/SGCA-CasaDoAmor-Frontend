import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import motionTokens from './motionTokens';
import type { TransitionContextValue, NavEvent } from './types';

const TransitionContext = createContext<TransitionContextValue | null>(null);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used within TransitionProvider');
  return ctx;
};

export const TransitionProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  // Allow Storybook test-runner to opt-in to reduced-motion (disable
  // animations) by setting window.__test.disableAnimations = true.
  const initialReduced = typeof window !== 'undefined' && (window as any).__test?.disableAnimations === true;
  const [reducedMotion, setReducedMotion] = useState(initialReduced);
  const [featureFlags] = useState({ enhancedTransitions: true });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches || initialReduced);
    handler();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
    } else if (typeof mq.addListener === 'function') {
      // deprecated API fallback
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - older browsers use addListener
      mq.addListener(handler);
    }
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler);
      } else if (typeof mq.removeListener === 'function') {
        // deprecated API fallback
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - older browsers use removeListener
        mq.removeListener(handler);
      }
    };
  }, []);

  const emitNavEvent = (event: NavEvent) => {
    if (import.meta.env.DEV) console.debug('[nav_event]', event);
  };

  const value = useMemo<TransitionContextValue>(() => ({
    tokens: motionTokens,
    reducedMotion,
    featureFlags,
    emitNavEvent,
  }), [reducedMotion, featureFlags]);

  return (
    <TransitionContext.Provider value={value}>
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </TransitionContext.Provider>
  );
};

export default TransitionProvider;

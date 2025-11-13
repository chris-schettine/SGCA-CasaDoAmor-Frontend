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
  const [reducedMotion, setReducedMotion] = useState(false);
  const [featureFlags] = useState({ enhancedTransitions: true });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    handler();
    try {
      mq.addEventListener('change', handler);
    } catch (e) {
      // fallback
      // @ts-ignore
      mq.addListener?.(handler);
    }
    return () => {
      try {
        mq.removeEventListener('change', handler);
      } catch (e) {
        // @ts-ignore
        mq.removeListener?.(handler);
      }
    };
  }, []);

  const emitNavEvent = (e: NavEvent) => {
    // Lightweight instrumentation hook — console for now
    if (import.meta.env.DEV) console.debug('[nav_event]', e);
    // TODO: plug into analytics
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

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from '../../motion/TransitionProvider';
import type { NavEvent } from '../../motion/types';

export default function NavigationInstrumentation(): null {
  const location = useLocation();
  const { emitNavEvent, tokens, reducedMotion } = useTransition();
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    const event: NavEvent = {
      routeFrom: previousPath.current,
      routeTo: location.pathname,
      durationMs: tokens.duration.standard,
      reducedMotion,
      token: { duration: 'standard', easing: 'standard' },
      timestamp: new Date().toISOString(),
    };
    emitNavEvent(event);
    previousPath.current = location.pathname;
  }, [location.pathname, emitNavEvent, tokens.duration.standard, reducedMotion]);

  return null;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from '../../motion/TransitionProvider';

export default function NavigationInstrumentation(): null {
  const location = useLocation();
  const { emitNavEvent, tokens, reducedMotion } = useTransition();

  useEffect(() => {
    const evt = {
      routeFrom: undefined,
      routeTo: location.pathname,
      durationMs: tokens.duration.standard,
      reducedMotion,
      token: { duration: 'standard' as const, easing: 'standard' as const },
      timestamp: new Date().toISOString(),
    };
    emitNavEvent(evt as any);
  }, [location.pathname, emitNavEvent, tokens, reducedMotion]);

  return null;
}

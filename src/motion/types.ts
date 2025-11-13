export type Easing = 'standard' | 'decelerate' | 'accelerate';
export type Duration = 'fast' | 'standard' | 'slow' | 'modal' | 'long';

export interface EasingToken {
  css: string; // css representation, e.g. 'cubic-bezier(...)'
  motion: [number, number, number, number]; // framer-motion numeric bezier
}

export interface MotionToken {
  duration: Record<Duration, number>; // ms
  easing: Record<Easing, EasingToken>;
}

export interface NavEvent {
  routeFrom?: string;
  routeTo: string;
  durationMs: number;
  reducedMotion: boolean;
  token: { duration: Duration; easing: Easing };
  timestamp: string; // ISO
}

export interface TransitionContextValue {
  tokens: MotionToken;
  reducedMotion: boolean;
  featureFlags: { enhancedTransitions: boolean };
  emitNavEvent: (e: NavEvent) => void;
}

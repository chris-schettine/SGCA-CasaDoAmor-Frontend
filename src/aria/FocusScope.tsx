import React, { useEffect, useRef } from 'react';

interface FocusScopeProps {
  children: React.ReactNode;
  autoFocus?: boolean;
}

/**
 * Lightweight FocusScope: moves focus to the wrapper on mount and restores on unmount.
 * Not a full focus-trap — intended as minimal, accessible helper for drawers/modals.
 */
export default function FocusScope({ children, autoFocus = true }: FocusScopeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const previousActive = useRef<Element | null>(null);

  useEffect(() => {
    previousActive.current = document.activeElement;
    if (autoFocus && rootRef.current) {
      const el = rootRef.current.querySelector('button, [href], input, select, textarea, [tabindex]');
      (el as HTMLElement | null)?.focus?.();
    }
    return () => {
      try {
        (previousActive.current as HTMLElement | null)?.focus?.();
      } catch (e) {
        // ignore
      }
    };
  }, [autoFocus]);

  return (
    <div ref={rootRef} tabIndex={-1} aria-hidden={false}>
      {children}
    </div>
  );
}

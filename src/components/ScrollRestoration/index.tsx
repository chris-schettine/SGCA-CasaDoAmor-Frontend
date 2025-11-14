import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Very small scroll restoration: saves scroll Y per pathname and restores on navigation.
 */
export default function ScrollRestoration(): null {
  const location = useLocation();

  useEffect(() => {
    const key = `scroll-pos:${location.pathname}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        window.scrollTo(0, Number(saved));
      } catch {
        // ignore
      }
    } else {
      window.scrollTo(0, 0);
    }

    const onBeforeUnload = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [location.pathname]);

  return null;
}

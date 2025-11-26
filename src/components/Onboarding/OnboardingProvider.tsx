import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { driver, type DriveStep, type Side } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTheme } from '@mui/material/styles';
import { useConsent } from '../../consent/hooks/useConsent';

type OnboardingContextValue = {
  startTour: () => void;
  hasSeenTour: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const STORAGE_KEY = 'onboard:v1';

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { hasConsent } = useConsent();
  const location = useLocation();
  const keepRootVisibleRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) === 'done';
  });
  const theme = useTheme();
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clearAriaHidden = useCallback(() => {
    document.getElementById('root')?.removeAttribute('aria-hidden');
    document.body?.removeAttribute?.('aria-hidden');
    document.documentElement?.removeAttribute?.('aria-hidden');
  }, []);

  // lightweight theming for the popover to match app palette
  useEffect(() => {
    const id = 'sgca-driver-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .sgca-tour .driver-popover-title {
        color: ${theme.palette.primary.main};
        font-weight: 700;
      }
      .sgca-tour .driver-popover-description {
        color: ${theme.palette.text.primary};
      }
      .sgca-tour .driver-popover-footer button {
        border-radius: 8px;
        font-weight: 600;
      }
      .sgca-tour .driver-popover-close-btn {
        color: ${theme.palette.text.secondary};
        background: transparent;
        box-shadow: none;
        border: none;
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin-right: 6px;
      }
      .sgca-tour .driver-popover-close-btn:hover,
      .sgca-tour .driver-popover-close-btn:focus-visible {
        background: transparent;
        outline: none;
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [theme.palette.primary.main, theme.palette.text.primary, theme.palette.text.secondary, theme.palette.action.hover]);

  const canShowTour = useMemo(
    () => hasConsent('product_tour') || hasConsent('functional_help') || hasConsent('analytics_usage'),
    [hasConsent]
  );

  const steps: DriveStep[] = useMemo(
    () => [
      {
        element: '[data-tour-id="nav-patients"]',
        popover: {
          title: 'Navegue pelos pacientes',
          description: 'Use o menu lateral para acessar a lista principal de pacientes e seus dados.',
          side: 'right' as Side,
        },
      },
      {
        element: '[data-tour-id="page-search"]',
        popover: {
          title: 'Busque rapidamente',
          description: 'Filtre pacientes por nome, CPF ou RG para localizar registros em segundos.',
          side: 'bottom' as Side,
        },
      },
      {
        element: '[data-tour-id="add-patient-button"]',
        popover: {
          title: 'Cadastre um novo paciente',
          description: 'Abra o formulário de cadastro com este botão “Adicionar” para registrar um novo paciente.',
          side: 'left' as Side,
        },
        padding: 8,
      },
      {
        element: '[data-tour-id="shortcut-help"]',
        popover: {
          title: 'Atalhos úteis',
          description: 'Abra a ajuda (?) para ver atalhos de teclado e dicas rápidas sempre que precisar.',
          side: 'left' as Side,
        },
      },
    ],
    []
  );

  const startTour = useCallback(async () => {
    if (!canShowTour) return;

    const waitForTargets = async (retries = 12, interval = 200) => {
      for (let i = 0; i < retries; i += 1) {
        const hasTarget = steps.some(step => typeof step.element === 'string' && !!document.querySelector(step.element as string));
        if (hasTarget) return true;
        await new Promise((res) => setTimeout(res, interval));
      }
      return false;
    };

    const found = await waitForTargets();
    if (!found) return;

    // Move focus away from main content so it isn't hidden while focused
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === 'function') {
      active.blur();
    }
    clearAriaHidden();

    const drv = driver({
      showProgress: true,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      animate: !prefersReducedMotion,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Concluir',
      popoverClass: 'sgca-tour',
      steps,
      onDestroyed: () => {
        clearAriaHidden();
        if (keepRootVisibleRef.current) {
          clearInterval(keepRootVisibleRef.current);
          keepRootVisibleRef.current = null;
        }
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      }
    });
    // Keep #root visible while tour runs to avoid aria-hidden on focused elements
    if (!keepRootVisibleRef.current) {
      keepRootVisibleRef.current = window.setInterval(() => {
        clearAriaHidden();
      }, 200);
    }
    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => clearAriaHidden());
      observerRef.current.observe(document.documentElement, { attributes: true, attributeFilter: ['aria-hidden'] });
      observerRef.current.observe(document.body, { attributes: true, attributeFilter: ['aria-hidden'] });
      const root = document.getElementById('root');
      if (root) {
        observerRef.current.observe(root, { attributes: true, attributeFilter: ['aria-hidden'] });
      }
    }
    drv.drive();
    localStorage.setItem(STORAGE_KEY, 'done');
    setHasSeenTour(true);
  }, [canShowTour, prefersReducedMotion, steps, clearAriaHidden]);

  useEffect(() => {
    if (hasSeenTour) return;
    if (!canShowTour) return;
    if (!location.pathname.startsWith('/patients')) return;
    // small delay to allow UI to paint before overlay
    const t = setTimeout(() => startTour(), 500);
    return () => {
      clearTimeout(t);
      if (keepRootVisibleRef.current) {
        clearInterval(keepRootVisibleRef.current);
        keepRootVisibleRef.current = null;
      }
      clearAriaHidden();
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasSeenTour, canShowTour, location.pathname, startTour, clearAriaHidden]);

  // Guard against any third-party component toggling aria-hidden on the root tree
  useEffect(() => {
    clearAriaHidden();
    const guardObserver = new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.attributeName === 'aria-hidden')) {
        clearAriaHidden();
      }
    });
    guardObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['aria-hidden'] });
    guardObserver.observe(document.body, { attributes: true, attributeFilter: ['aria-hidden'] });
    const root = document.getElementById('root');
    if (root) {
      guardObserver.observe(root, { attributes: true, attributeFilter: ['aria-hidden'] });
    }
    return () => guardObserver.disconnect();
  }, [clearAriaHidden]);

  const value = useMemo(() => ({ startTour, hasSeenTour }), [startTour, hasSeenTour]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOnboarding = (): OnboardingContextValue => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
};

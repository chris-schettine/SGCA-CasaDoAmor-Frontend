/**
 * Context e Hook para gerenciamento de temas (Light/Dark)
 * 
 * Permite alternar entre temas e persiste a preferência do usuário
 * Tema padrão é sempre 'light'
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ThemeMode } from '../design-tokens';
import { createAppTheme } from '../design-tokens/themes';

// ============================================================================
// TYPES
// ============================================================================

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  theme: ReturnType<typeof createAppTheme>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

export const useThemeMode = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light',
  storageKey = 'sgca-theme-mode',
}) => {
  // Lê preferência salva ou usa padrão
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    
    try {
      const raw = localStorage.getItem(storageKey);
      // Remove 'brand' se existir no localStorage (migração)
      if (raw === 'brand') {
        localStorage.removeItem(storageKey);
        return defaultMode;
      }
      if (raw === 'light' || raw === 'dark') {
        return raw as ThemeMode;
      }
    } catch {
      // Ignora erros de localStorage
    }
    
    // Sem preferência salva, usa sempre o modo padrão fornecido (light por padrão)
    return defaultMode;
  });

  // Guarda se o usuário já salvou uma preferência em localStorage
  const [hasUserPreference, setHasUserPreference] = useState<boolean>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      return raw === 'light' || raw === 'dark';
    } catch {
      return false;
    }
  });

  // Cria tema baseado no modo
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Salva preferência
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(storageKey, newMode);
      setHasUserPreference(true);
    } catch {
      // Ignora erros de localStorage
    }
  }, [storageKey]);

  // Alterna entre light e dark
  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  // Escuta mudanças na preferência do sistema (apenas se o usuário não tiver salvo preferência)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (!hasUserPreference) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };
    try {
      // `addEventListener` is preferred but not supported in older browsers
      if (mq.addEventListener) mq.addEventListener('change', listener as any);
      else mq.addListener(listener as any);
    } catch {
      // ignore
    }

    return () => {
      try {
        if (mq.removeEventListener) mq.removeEventListener('change', listener as any);
        else mq.removeListener(listener as any);
      } catch {
        // ignore
      }
    };
  }, [hasUserPreference]);

  // Não escuta preferência do sistema - sempre usa light como padrão
  // Usuário pode escolher dark manualmente se desejar

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
      theme,
    }),
    [mode, setMode, toggleMode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

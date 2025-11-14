/**
 * Context e Hook para gerenciamento de temas (Light/Dark)
 * 
 * Permite alternar entre temas e persiste a preferência do usuário
 * Tema padrão é sempre 'light'
 */

import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
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
    
    // Sempre retorna light como padrão (não verifica preferência do sistema)
    return defaultMode;
  });

  // Cria tema baseado no modo
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Salva preferência
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(storageKey, newMode);
    } catch {
      // Ignora erros de localStorage
    }
  };

  // Alterna entre light e dark
  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Não escuta preferência do sistema - sempre usa light como padrão
  // Usuário pode escolher dark manualmente se desejar

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
      theme,
    }),
    [mode, theme]
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


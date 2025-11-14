import { ToastContainer, type ToastPosition } from 'react-toastify';
import { useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';

/**
 * Wrapper responsivo para ToastContainer
 * 
 * Configurações:
 * - Posicionamento responsivo para mobile
 * - Ajustes para scroll no mobile
 * - Suporte a safe-area-inset para dispositivos com notch
 */
export function ToastContainerWrapper() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Configuração responsiva do ToastContainer
  const toastPosition = useMemo<ToastPosition>(() => 'top-center', []);

  return (
    <ToastContainer
      limit={3}
      newestOnTop
      position={toastPosition}
      // Do not force `autoClose` here — let per-toast options (from `src/utils/toast.ts`)
      // control duration. Setting a container-level `autoClose` can unintentionally
      // override per-toast durations in some setups.
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss
      draggable={!isMobile} // Desabilitar drag no mobile para melhor UX
      rtl={false}
      style={{
        // Ajustes para mobile com scroll
        position: 'fixed',
        top: isMobile ? 'max(env(safe-area-inset-top, 0px), 16px)' : '0px',
        zIndex: 9999,
        width: isMobile ? 'calc(100% - 32px)' : 'auto',
        maxWidth: isMobile ? 'calc(100vw - 32px)' : '420px',
        margin: isMobile ? '0 auto' : '0 auto',
        left: isMobile ? '16px' : '50%',
        right: isMobile ? '16px' : 'auto',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        // Garantir que o toast fique visível mesmo com scroll
        pointerEvents: 'auto',
      }}
      toastStyle={{
        // Estilos responsivos para o toast individual
        fontSize: isMobile ? '14px' : '16px',
        padding: isMobile ? '12px 16px' : '16px',
        marginBottom: isMobile ? '8px' : '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        wordBreak: 'break-word',
        maxWidth: '100%',
        minHeight: isMobile ? '48px' : '56px',
        display: 'flex',
        alignItems: 'center',
      }}
      
    />
  );
}


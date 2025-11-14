import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useMediaQuery, useTheme, Button, Box } from '@mui/material';
import { useEffect } from 'react';

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

  // Log quando o componente monta/desmonta
  useEffect(() => {
    console.log('[ToastContainerWrapper] Component mounted', { 
      isMobile,
      timestamp: Date.now(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
    
    // Verificar se o container está no DOM
    const checkContainer = () => {
      const container = document.querySelector('.Toastify__toast-container');
      console.log('[ToastContainerWrapper] Container no DOM:', !!container, container);
      
      // Verificar computed styles
      if (container) {
        const styles = window.getComputedStyle(container);
        console.log('[ToastContainerWrapper] Container styles:', {
          position: styles.position,
          zIndex: styles.zIndex,
          visibility: styles.visibility,
          display: styles.display,
          opacity: styles.opacity
        });
      }
    };
    
    // Verificar após renderização
    setTimeout(checkContainer, 100);
    
    return () => {
      console.log('[ToastContainerWrapper] Component unmounted');
    };
  }, [isMobile]);

  // Botão de teste em desenvolvimento
  const TestButton = () => {
    if (!import.meta.env.DEV) return null;
    
    return (
      <Box sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 10000,
        display: 'flex',
        gap: 1,
        flexDirection: 'column'
      }}>
        <Button 
          variant="contained" 
          size="small"
          onClick={() => {
            const options = {
              position: 'top-center' as const,
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              transition: Bounce,
            };
            console.log('[TEST] Disparando toast.success direto com opções:', options);
            toast.success('Toast de teste direto com 5 segundos!', options);
          }}
        >
          Test Toast Direct (5s)
        </Button>
        <Button 
          variant="contained" 
          size="small"
          color="error"
          onClick={() => {
            console.log('[TEST] Disparando toast.error via utils');
            import('../../utils/toast').then(({ toastError }) => {
              toastError('Erro de teste via utils!');
            });
          }}
        >
          Test Toast Utils
        </Button>
        <Button 
          variant="contained" 
          size="small"
          color="warning"
          onClick={() => {
            console.log('[TEST] Toast sem nenhuma opção');
            toast('Toast básico sem opções!');
          }}
        >
          Test Toast Basic
        </Button>
      </Box>
    );
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={!isMobile}
        pauseOnHover
        limit={3}
        theme={theme.palette.mode}
        transition={Bounce}
        toastStyle={{
          fontSize: isMobile ? '14px' : '16px',
          minHeight: isMobile ? '48px' : '56px',
        }}
      />
      <TestButton />
    </>
  );
}


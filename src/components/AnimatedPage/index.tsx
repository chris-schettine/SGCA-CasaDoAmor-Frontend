import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface AnimatedPageProps {
  children: ReactNode;
}

/**
 * Componente para adicionar animações de transição entre páginas
 * 🎨 Framer Motion - Transições suaves e profissionais
 */
export const AnimatedPage = ({ children }: AnimatedPageProps) => {
  const theme = useTheme();
  const disableAnimations = typeof window !== 'undefined' && (window as any).__test?.disableAnimations === true;

  return (
    <motion.div
      initial={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={disableAnimations ? { opacity: 1, y: 0 } : { opacity: 1, y: -20 }}
      transition={disableAnimations ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
        WebkitTextFillColor: theme.palette.text.primary,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Variantes para transições de página mais elaboradas
 */
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

/**
 * Componente com transição lateral (melhor para navegação sequencial)
 */
export const AnimatedPageSlide = ({ children }: AnimatedPageProps) => {
  const theme = useTheme();
  return (
    <motion.div
      initial="in"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
        WebkitTextFillColor: theme.palette.text.primary,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Transição com escala (bom para modais e detalhes)
 */
export const AnimatedPageScale = ({ children }: AnimatedPageProps) => {
  const disableAnimations = typeof window !== 'undefined' && (window as any).__test?.disableAnimations === true;
  const theme = useTheme();

  return (
    <motion.div
      initial={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={disableAnimations ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 0.95 }}
      transition={disableAnimations ? { duration: 0 } : { duration: 0.2 }}
      style={{
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
        WebkitTextFillColor: theme.palette.text.primary,
      }}
    >
      {children}
    </motion.div>
  );
};

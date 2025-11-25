import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import type { TableProps } from '@mui/material/Table';
import type { ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode;
}

/**
 * Componente para animar listas com stagger effect
 * 🎨 Cada item aparece com um pequeno delay
 */
export const AnimatedList = ({ children }: AnimatedListProps) => {
  const theme = useTheme();
  return (
    <div className="animated-list-root" style={{ color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}>
      <style>{`
        .animated-list-root * {
          color: ${theme.palette.text.primary} !important;
          opacity: 1 !important;
          filter: none !important;
          mix-blend-mode: normal !important;
          text-shadow: none !important;
        }

        .animated-list-root table thead th {
          background: ${theme.palette.primary.main} !important;
          color: ${theme.palette.getContrastText(theme.palette.primary.main)} !important;
          -webkit-text-fill-color: ${theme.palette.getContrastText(theme.palette.primary.main)} !important;
          opacity: 1 !important;
        }
      `}</style>
      <motion.ul
      initial="hidden"
      animate="visible"
      role="list"
      style={{
        padding: 0,
        margin: 0,
        listStyle: 'none',
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,
      }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05, // Delay entre cada item
          },
        },
      }}
    >
      {children}
      </motion.ul>
    </div>
  );
};

/**
 * Tabela animada com cabeçalho de alto contraste.
 * Usa o tema para colorir o header (fundo primário, texto de contraste).
 */
export const AnimatedTable = ({ children, sx, ...rest }: TableProps) => {
  const theme = useTheme();
  const headerBg = theme.palette.primary.main;
  const headerFg = theme.palette.getContrastText(headerBg);
  return (
    <Table
      {...rest}
      sx={{
        '& thead th': {
          backgroundColor: headerBg,
          color: headerFg,
          WebkitTextFillColor: headerFg,
          opacity: 1,
        },
        '& tbody td': {
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          opacity: 1,
        },
        '& tbody td *': {
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          opacity: 1,
          filter: 'none',
          mixBlendMode: 'normal',
          textShadow: 'none',
        },
        ...sx,
      }}
    >
      {children}
    </Table>
  );
};

/**
 * Item individual da lista animada
 */
export const AnimatedListItem = ({ children }: AnimatedListProps) => {
  const disableAnimations = typeof window !== 'undefined' && (window as any).__test?.disableAnimations === true;
  const theme = useTheme();
  const variants = disableAnimations
    ? undefined
    : {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            // Use cubic-bezier easing array (tuple) to match the framer-motion/motion-utils typings
            ease: [[0.4, 0, 0.2, 1] as const],
          },
        },
      };

  return (
    <motion.li role="listitem" style={{ listStyle: 'none' }} variants={variants}>
      {/*
        Wrap children in a small reset element so any animation clones or
        browser compositing doesn't leave lower-contrast visual artifacts
        (mix-blend-mode, filters, shadows, opacity). This keeps rendered
        text colors stable and helps axe compute the correct contrast.
      */}
      <div style={{ color: theme.palette.text.primary, opacity: 1, filter: 'none', mixBlendMode: 'normal', textShadow: 'none' }}>
        {children}
      </div>
    </motion.li>
  );
};

/**
 * Animação para tabelas (mais sutil)
 */
export const AnimatedTableRow = ({ children }: AnimatedListProps) => {
  const disableAnimations = typeof window !== 'undefined' && (window as any).__test?.disableAnimations === true;
  const theme = useTheme();

  const initial = disableAnimations ? { opacity: 1 } : { opacity: 0 };
  const exit = disableAnimations ? { opacity: 1 } : { opacity: 0 };
  const transition = disableAnimations ? { duration: 0 } : { duration: 0.2 };

  return (
    <motion.tr
      initial={initial}
      animate={{ opacity: 1 }}
      exit={exit}
      transition={transition}
      // Ensure row-level rendering doesn't introduce blending/opacity artifacts
      style={{ color: theme.palette.text.primary, filter: 'none', mixBlendMode: 'normal', textShadow: 'none' }}
    >
      {children}
    </motion.tr>
  );
};

/**
 * Animação para cards
 */
export const AnimatedCard = ({ children }: AnimatedListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{
        scale: 1.02,
      }}
      transition={{
        duration: 0.2,
        // cubic-bezier array wrapped as array-of-easing to match framer-motion typings
        ease: [[0.4, 0, 0.2, 1] as const],
      }}
    >
      {children}
    </motion.div>
  );
};

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode;
}

/**
 * Componente para animar listas com stagger effect
 * 🎨 Cada item aparece com um pequeno delay
 */
export const AnimatedList = ({ children }: AnimatedListProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05, // Delay entre cada item
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Item individual da lista animada
 */
export const AnimatedListItem = ({ children }: AnimatedListProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animação para tabelas (mais sutil)
 */
export const AnimatedTableRow = ({ children }: AnimatedListProps) => {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        transition: { duration: 0.15 },
      }}
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
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

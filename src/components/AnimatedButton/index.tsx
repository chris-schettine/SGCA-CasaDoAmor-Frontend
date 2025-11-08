import { motion } from 'framer-motion';
import { Button, type ButtonProps } from '@mui/material';
import { forwardRef } from 'react';

/**
 * Botão animado com micro-interações
 * 🎨 Hover, tap e loading states
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        <Button ref={ref} {...props} />
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

/**
 * Botão com pulso sutil (para CTAs importantes)
 */
export const PulsingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
        >
          <Button ref={ref} {...props} />
        </motion.div>
      </motion.div>
    );
  }
);

PulsingButton.displayName = 'PulsingButton';

/**
 * Botão com efeito shimmer no hover
 */
export const ShimmerButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <motion.div
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px rgba(9, 36, 75, 0.3)',
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        <Button ref={ref} {...props} />
      </motion.div>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

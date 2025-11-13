import Dialog, { type DialogProps } from '@mui/material/Dialog';
import { useTransition } from '../../motion/TransitionProvider';

/**
 * StandardDialog wraps MUI Dialog and wires motion tokens + reduced-motion.
 * It forwards all Dialog props and sets a sensible `transitionDuration` and `TransitionProps.timeout`.
 */
export default function StandardDialog(props: DialogProps) {
  const { tokens, reducedMotion } = useTransition();

  const transitionDuration = reducedMotion ? 0 : tokens.duration.modal;

  return (
    <Dialog
      {...props}
      transitionDuration={transitionDuration}
      TransitionProps={{ timeout: transitionDuration }}
    />
  );
}

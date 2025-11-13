import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { useTransition } from '../../motion/TransitionProvider';

/**
 * StandardTooltip wraps MUI Tooltip and applies motion tokens + reduced-motion handling.
 */
export default function StandardTooltip(props: TooltipProps) {
  const { tokens, reducedMotion } = useTransition();

  const enterDelay = reducedMotion ? 0 : tokens.duration.fast;
  const leaveDelay = reducedMotion ? 0 : tokens.duration.fast;
  const transitionDuration = reducedMotion ? 0 : tokens.duration.standard;

  return (
    <Tooltip
      {...props}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: transitionDuration }}
    />
  );
}

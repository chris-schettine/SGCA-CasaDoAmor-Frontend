import Accordion, { type AccordionProps } from '@mui/material/Accordion';
import { useTransition } from '../../motion/TransitionProvider';

/** StandardAccordion: thin wrapper to centralize motion tokens and reduced-motion */
export default function StandardAccordion(props: AccordionProps) {
  const { reducedMotion } = useTransition();
  // MUI Accordion doesn't take timing props, but we can apply reduced-motion via disableGutters or transition props on children when needed.
  return <Accordion {...props} TransitionProps={reducedMotion ? { timeout: 0 } : undefined} />;
}

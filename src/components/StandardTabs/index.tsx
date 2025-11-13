import Tabs, { type TabsProps } from '@mui/material/Tabs';
import { useTransition } from '../../motion/TransitionProvider';

/** StandardTabs: wrapper to optionally disable animated scroll change when reducedMotion is true */
export default function StandardTabs(props: TabsProps) {
  const { reducedMotion } = useTransition();
  return <Tabs {...props} allowScrollButtonsMobile={true} TabIndicatorProps={reducedMotion ? { style: { transition: 'none' } } : undefined} />;
}

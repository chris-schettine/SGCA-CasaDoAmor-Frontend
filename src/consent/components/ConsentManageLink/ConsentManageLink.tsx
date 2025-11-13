import { Link } from '@mui/material';
import type { LinkProps } from '@mui/material';
import { useConsent } from '../../hooks/useConsent';

interface ConsentManageLinkProps extends Omit<LinkProps, 'onClick'> {
  /**
   * Texto customizado (default: "Gerenciar Preferências de Privacidade")
   */
  children?: React.ReactNode;
}

/**
 * Link para abrir o dialog de gerenciamento de consentimento
 * 
 * Use no footer, menu de configurações, ou qualquer lugar onde
 * o usuário possa querer revisar suas escolhas.
 * 
 * @example
 * ```tsx
 * // No footer
 * <ConsentManageLink sx={{ color: 'text.secondary' }}>
 *   Gerenciar Cookies
 * </ConsentManageLink>
 * 
 * // No menu de configurações
 * <MenuItem>
 *   <ConsentManageLink component="span">
 *     Privacidade e Consentimento
 *   </ConsentManageLink>
 * </MenuItem>
 * ```
 */
export function ConsentManageLink({
  children = 'Gerenciar Preferências de Privacidade',
  ...props
}: ConsentManageLinkProps) {
  const { openDialog } = useConsent();

  return (
    <Link
      component="button"
      onClick={openDialog}
      sx={{
        // Default to footer-like appearance: inherit color, no underline,
        // small size and subtle opacity so it matches the other footer items.
        textDecoration: 'none',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        padding: 0,
        font: 'inherit',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        opacity: 0.7,
        fontSize: '0.9rem',
        marginBottom: 1,
        transition: '0.2s',
        '&:hover': {
          opacity: 1,
          color: '#65ACD6',
          transform: 'translateX(5px)',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

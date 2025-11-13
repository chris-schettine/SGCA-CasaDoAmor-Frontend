import type { ReactNode } from 'react';
import { useConsent } from '../../hooks/useConsent';

interface ConsentGuardProps {
  /**
   * ID da finalidade necessária (ex: 'analytics_usage')
   */
  purposeId: string;
  
  /**
   * Conteúdo a renderizar se consentimento concedido
   */
  children: ReactNode;
  
  /**
   * Fallback a renderizar se consentimento negado (opcional)
   */
  fallback?: ReactNode;
}

/**
 * Componente guard que renderiza children apenas se houver consentimento
 * 
 * Útil para conditional rendering de features opt-in como:
 * - Scripts de analytics
 * - Widgets de chat
 * - Pixels de remarketing
 * 
 * @example
 * ```tsx
 * // Analytics condicional
 * <ConsentGuard purposeId="analytics_usage">
 *   <GoogleAnalytics trackingId="UA-XXXXX" />
 * </ConsentGuard>
 * 
 * // Com fallback
 * <ConsentGuard
 *   purposeId="marketing_emails"
 *   fallback={<p>Ative o consentimento para receber newsletters</p>}
 * >
 *   <NewsletterSignup />
 * </ConsentGuard>
 * ```
 */
export function ConsentGuard({
  purposeId,
  children,
  fallback = null,
}: ConsentGuardProps) {
  const { hasConsent } = useConsent();

  return hasConsent(purposeId) ? <>{children}</> : <>{fallback}</>;
}

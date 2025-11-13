import { useContext } from 'react';
import { ConsentContext } from '../provider/ConsentProvider';
import type { ConsentContextValue } from '../types/consent.types';

/**
 * Hook para acessar o contexto de consentimento
 * 
 * @throws Error se usado fora do ConsentProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasConsent, openDialog, choices } = useConsent();
 *   
 *   useEffect(() => {
 *     if (hasConsent('analytics_usage')) {
 *       // Inicializar Google Analytics
 *     }
 *   }, [hasConsent]);
 *   
 *   return (
 *     <button onClick={openDialog}>
 *       Gerenciar Preferências
 *     </button>
 *   );
 * }
 * ```
 */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error(
      'useConsent must be used within a ConsentProvider. ' +
        'Wrap your app with <ConsentProvider> at the root level.'
    );
  }

  return context;
}

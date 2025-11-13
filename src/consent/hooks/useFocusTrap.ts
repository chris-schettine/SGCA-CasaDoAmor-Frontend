import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Hook que implementa focus trap para dialogs modais (WCAG 2.1.2 No Keyboard Trap)
 * 
 * Comportamento:
 * - Tab: Move para próximo elemento focável
 * - Shift+Tab: Move para elemento anterior
 * - Ao atingir último elemento, volta para primeiro
 * - Ao atingir primeiro elemento (backward), volta para último
 * 
 * @param containerRef - Ref do container do dialog
 * @param isActive - Se o trap está ativo (normalmente quando dialog está open)
 * @param autoFocus - Se deve focar primeiro elemento ao ativar (default: true)
 * 
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, open);
 * 
 * return (
 *   <Dialog ref={dialogRef} open={open}>
 *     <button>Primeiro</button>
 *     <button>Último</button>
 *   </Dialog>
 * );
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  autoFocus = true
): void {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Query selector para elementos focáveis
    const focusableSelector = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusableElements = (): HTMLElement[] => {
      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      );

      // Filtrar elementos visíveis
      return elements.filter((el) => {
        if (el.offsetParent === null) return false; // Hidden
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab no primeiro elemento → volta para último
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab no último elemento → volta para primeiro
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Adicionar listener
    container.addEventListener('keydown', handleKeyDown);

    // Auto-focus no primeiro elemento
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Timeout para garantir que dialog está renderizado
        setTimeout(() => focusableElements[0].focus(), 0);
      }
    }

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive, autoFocus]);
}

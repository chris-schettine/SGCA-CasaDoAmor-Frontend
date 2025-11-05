import { useEffect, useCallback } from 'react';

/**
 * Hook para adicionar atalho Ctrl+S (ou Cmd+S no Mac) para salvar formulários
 * @param onSave - Função a ser chamada ao pressionar Ctrl+S
 * @param enabled - Se o atalho está ativo (padrão: true)
 */
export const useSaveShortcut = (
  onSave: () => void,
  enabled: boolean = true
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ctrl+S ou Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    },
    [onSave, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

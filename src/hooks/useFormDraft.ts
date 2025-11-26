import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormReset, UseFormWatch } from 'react-hook-form';

interface UseFormDraftOptions {
  debounceMs?: number;
}

/**
 * Autosave form values in localStorage and allow restoring.
 */
export function useFormDraft<T extends Record<string, unknown>>(
  storageKey: string,
  watch: UseFormWatch<T>,
  reset: UseFormReset<T>,
  options: UseFormDraftOptions = {}
) {
  const debounceMs = options.debounceMs ?? 1200;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(storageKey);
  });
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const hasMeaningfulValue = useCallback((value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return value === true;
    if (Array.isArray(value)) return value.some(hasMeaningfulValue);
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue);
    }
    return false;
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        try {
          if (!hasMeaningfulValue(value)) {
            localStorage.removeItem(storageKey);
            setHasDraft(false);
            return;
          }
          localStorage.setItem(storageKey, JSON.stringify(value));
          setHasDraft(true);
          setLastSavedAt(Date.now());
        } catch {
          // ignore quota/storage errors in autosave
        }
      }, debounceMs);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.unsubscribe();
    };
  }, [storageKey, watch, debounceMs, hasMeaningfulValue]);

  const restoreDraft = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<T>;
      if (!hasMeaningfulValue(parsed)) {
        return false;
      }
      reset(parsed as T, { keepDefaultValues: true });
      setHasDraft(true);
      return true;
    } catch {
      // ignore parse errors
      return false;
    }
  }, [reset, storageKey, hasMeaningfulValue]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { hasDraft, restoreDraft, clearDraft, lastSavedAt };
}

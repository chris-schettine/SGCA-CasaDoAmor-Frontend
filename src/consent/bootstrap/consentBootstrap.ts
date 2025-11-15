import { ConsentStore } from '../store/consentStore';
import type { ConsentChoice } from '../types/consent.types';
import { consentimentoService } from '../../api/consentimento.service';
// NOTE: TTL config not required here; ConsentStore handles TTL logic

/**
 * Lightweight bootstrap to ensure we perform at most one backend call
 * to list consentimentos for the current user per session (or per TTL).
 *
 * Behavior:
 * - If local snapshot exists and is fresh (not expired and version matches) -> do nothing
 * - Otherwise, call backend (CPF or UUID) once, persist a local snapshot (parse metadata if present)
 * - Set sessionStorage flags so other components skip duplicate calls
 */
export async function bootstrapConsent(identifier: string | undefined | null) {
  if (!identifier) return null;

  try {
    const snapshot = ConsentStore.load(identifier);
    if (snapshot && !ConsentStore.needsUpdate(snapshot)) {
      if (import.meta.env.DEV) console.debug('[consentBootstrap] Local snapshot fresh - skipping backend call');
      try {
        sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      } catch {
        /* ignore */
      }
      return snapshot;
    }

    // Avoid duplicate bootstrap calls inside the same tab
    const win = window as typeof window & { __consentBootstrapCalled?: boolean };
    if (typeof win.__consentBootstrapCalled !== 'undefined') {
      if (import.meta.env.DEV) console.debug('[consentBootstrap] bootstrap already called in this tab');
      return null;
    }
    win.__consentBootstrapCalled = true;

    // Call backend to check for consent records
    type BackendRecord = {
      concorda?: boolean;
      createdAt?: string;
      dataConsentimento?: string;
      data?: string;
      metadata?: string;
      uuid?: string;
      _ts?: string | null;
      [key: string]: unknown;
    };
    let backendArray: BackendRecord[] = [];
    // We MUST NOT call listarConsentimentos by UUID. Only query by CPF.
    const isCpf = typeof identifier === 'string' && /^[0-9]{11}$/.test(identifier);

    if (isCpf) {
      const resp = await consentimentoService.listarConsentimentosPorCpf(identifier).catch(() => null);
      backendArray = Array.isArray(resp) ? (resp as unknown as BackendRecord[]) : [];
    } else {
      // If we don't have a CPF as identifier, try to read a CPF from sessionStorage
      // (some flows populate cpf or cpfFor2FA). If none exists, skip backend listing.
      const cpfFromSession = typeof window !== 'undefined' ? (sessionStorage.getItem('cpf') || sessionStorage.getItem('cpfFor2FA') || '') : '';
      const cpfCandidate = cpfFromSession ? String(cpfFromSession).replace(/\D/g, '') : '';

      if (cpfCandidate && /^[0-9]{11}$/.test(cpfCandidate)) {
        if (import.meta.env.DEV) console.debug('[consentBootstrap] using cpf from sessionStorage for backend list', { cpfCandidate });
        const resp = await consentimentoService.listarConsentimentosPorCpf(cpfCandidate).catch(() => null);
        backendArray = Array.isArray(resp) ? (resp as unknown as BackendRecord[]) : [];
      } else {
        if (import.meta.env.DEV) console.debug('[consentBootstrap] no cpf available; skipping backend listado (never call listar by uuid)');
        backendArray = [];
      }
    }

    if (backendArray.length > 0) {
      // Backend may return a history of consent records (accepted/revoked).
      // Find the most recent *accepted* record (concorda === true). If none,
      // treat as no backend consent (user has revoked).
      const asRecords = backendArray.slice().map((r: BackendRecord) => ({
        ...r,
        _ts: typeof r.createdAt === 'string' ? r.createdAt : (typeof r.dataConsentimento === 'string' ? r.dataConsentimento : (typeof r.data === 'string' ? r.data : null)),
      }));

      if (import.meta.env.DEV) console.debug('[consentBootstrap] backend records mapped for selection', { identifier, count: asRecords.length, preview: asRecords.slice(0,3) });

      // Sort by timestamp desc
      asRecords.sort((a: BackendRecord, b: BackendRecord) => {
        const ta = a._ts ? new Date(String(a._ts)).getTime() : 0;
        const tb = b._ts ? new Date(String(b._ts)).getTime() : 0;
        return tb - ta;
      });

      const latestAccepted = asRecords.find((r) => r.concorda === true);

      if (import.meta.env.DEV) console.debug('[consentBootstrap] selected latestAccepted (if any)', { latestAccepted });

      if (!latestAccepted) {
        // No accepted consent found - treat as no backend consent (user revoked)
        if (import.meta.env.DEV) console.debug('[consentBootstrap] backend has records but no accepted consent (latest is revoke)');
        try {
          sessionStorage.setItem('consentimento-api-called', 'true');
        } catch {
          /* ignore */
        }
        return null;
      }

      // Try to extract choices from metadata of the latest accepted record
      let choices = ConsentStore.getDefaultChoices();
      try {
        if (latestAccepted && latestAccepted.metadata) {
          const parsed = JSON.parse(latestAccepted.metadata) as Record<string, unknown>;
          if (parsed && typeof parsed === 'object') {
            choices = parsed as ConsentChoice;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.debug('[consentBootstrap] failed to parse metadata from latestAccepted, using defaults', err);
      }

      // Persist locally (best-effort) with TTL
      const saved = await ConsentStore.save(identifier, choices, { requireApi: false });

      if (import.meta.env.DEV) console.debug('[consentBootstrap] saved snapshot returned from ConsentStore.save', { identifier, saved });
      try {
        sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      } catch {
        /* ignore */
      }
      try {
        sessionStorage.setItem('consentimento-api-called', 'true');
      } catch {
        /* ignore */
      }

      if (import.meta.env.DEV) console.debug('[consentBootstrap] backend accepted consent found - local snapshot saved', { identifier, uuid: latestAccepted.uuid });
      return saved;
    }

    // No backend data -> mark that we called API so other components don't re-call repeatedly
    try {
      sessionStorage.setItem('consentimento-api-called', 'true');
    } catch {
      /* ignore */
    }
    if (import.meta.env.DEV) console.debug('[consentBootstrap] no backend consent found');
    return null;
  } catch (err) {
    console.error('[consentBootstrap] Error during bootstrap:', err);
    try {
      sessionStorage.setItem('consentimento-api-called', 'true');
    } catch {
      /* ignore */
    }
    return null;
  }
}

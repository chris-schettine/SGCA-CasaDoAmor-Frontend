# Copilot Instructions for SGCA-CasaDoAmor-Frontend

## Project Overview
- **Type:** React 19 + TypeScript 5, Vite, Material-UI, Zod, React Hook Form
- **Purpose:** Patient and companion management for Casa do Amor, with strong focus on privacy (LGPD), accessibility (WCAG 2.2 AA), and robust authentication/consent flows.

## Key Architectural Patterns
- **API Layer:** All API calls are centralized in `src/api/` (e.g., `api.gateway.ts`, `*.service.ts`). Use these services for all network requests.
- **Consent System:** LGPD consent is enforced globally via `src/consent/` (see `ConsentProvider`, `ConsentGuard`, and `useConsent`). Consent state is dual-written to localStorage and backend, and versioned. Never bypass consent checks for protected routes or features.
- **Routing:** All routes are defined in `src/Routes.tsx`. Use `<PrivateRoute>` and `<ConsentGuard>` for access control. Public routes: `/login`, `/privacy`, `/consentimento`.
- **State Management:** Contexts in `src/contexts/` (e.g., `AuthContext.tsx`) manage auth/session. Use hooks in `src/hooks/` for business logic.
- **Validation:** All forms use Zod schemas from `src/schemas/` and are managed with React Hook Form.
- **UI Components:** Reusable components in `src/components/`. Follow existing patterns for new UI.

## Developer Workflows
- **Dev server:** `npm run dev` (Vite, hot reload)
- **Build:** `npm run build` (output: `dist/`)
- **Lint:** `npm run lint`
- **Unit tests:** `npm run test` (Vitest)
- **Storybook:** `npm run storybook` (for UI components)
- **Consent system tests:** See `/src/consent/README.md` and `/docs/CONSENT_QA_CHECKLIST.md`.

## Project Conventions
- **TypeScript:** Strict types, no `any`. Use types from `src/types/` and `src/consent/types/`.
- **Accessibility:** All UI must meet WCAG 2.2 AA. Use ARIA roles, keyboard navigation, and test with axe.
- **Consent:** Never render protected content unless consent is current and valid. Use `ConsentStore` and `ConsentGuard`.
- **API Integration:** Always use the API services, never call fetch/axios directly in components.
- **Testing:** Place tests in `src/tests/` or alongside components. Use Vitest and axe for a11y.
- **Env config:** Use `.env` and `VITE_API_BASE_URL` for API endpoints.

## Integration Points
- **Backend:** Expects JWT auth, consent versioning, and 2FA support. See `api.gateway.ts` and `auth.service.ts`.
- **Consent:** Integrates with backend for consent version and choices. See `src/consent/store/consentStore.ts`.
- **Deployment:** Vercel (`vercel.json` for SPA rewrites). CSP configured in `vite.config.ts`.

## Examples
- **Consent check in component:**
  ```tsx
  const { hasConsent } = useConsent();
  if (!hasConsent('essential_auth')) return <ConsentDialog />;
  ```
- **Protected route:**
  ```tsx
  <PrivateRoute>
    <ConsentGuard purposeId="essential_auth">
      <PatientPage />
    </ConsentGuard>
  </PrivateRoute>
  ```

## References
- Main docs: `README.md`, `src/consent/README.md`, `/docs/CONSENT_*`
- Consent quick start: `/docs/CONSENT_QUICK_START.md`
- Consent config: `src/consent/config/consentConfig.ts`
- Auth/session: `src/contexts/AuthContext.tsx`
- API: `src/api/`

---
**If unsure, search for similar patterns in `src/` or ask for clarification.**

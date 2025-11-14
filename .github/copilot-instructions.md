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
# Copilot Instructions — SGCA-CasaDoAmor-Frontend

Purpose: React + TypeScript patient & companion management app focused on LGPD privacy, WCAG accessibility, and robust auth/consent flows.

Quick start (common commands):
- `npm run dev` — start Vite dev server
- `npm run build` — production build (`dist/`)
- `npm run test` — run unit tests (Vitest)
- `npm run lint` — run linter
- `npm run storybook` — component playground

Big-picture architecture (what matters):
- API layer lives in `src/api/` (see `api.gateway.ts`, `auth.service.ts`, `paciente.service.ts`). Use these services — do not call `fetch`/`axios` directly from components.
- Consent system is global under `src/consent/`. Key files: `provider/`, `store/consentStore.ts`, `hooks/` and `config/consentConfig.ts`. Consent is versioned and persisted locally + backend.
- Routing and access control: `src/Routes.tsx` plus `src/components/PrivateRoute/` and `ConsentGuard` components. Protect pages with both auth and consent checks.
- Global session/auth: `src/contexts/AuthContext.tsx` and `src/hooks/useAuth.ts` manage JWT, 2FA flows and current user state.

Project-specific conventions (follow these exactly):
- Types: Strict TypeScript. Avoid `any`; prefer types from `src/types/` and `src/consent/types/`.
- Forms: Zod schemas in `src/schemas/` + React Hook Form. Put schema next to the form component.
- API calls: Use `*.service.ts` under `src/api/`. Return typed DTOs (`*.dto.ts`). Example: `paciente.service.ts` + `paciente.dto.ts`.
- Consent gating: Always wrap protected UI with `ConsentGuard` or call `useConsent()` (example: `if (!hasConsent('essential_auth')) return <ConsentDialog />`).
- Accessibility: Use ARIA roles and test with axe in component tests. Follow WCAG 2.2 AA.

Integration points & external expectations:
- Backend: JWT auth, refresh token flows, consent version APIs, and optional 2FA endpoints. See `api.gateway.ts` and `auth.service.ts` for expected headers and error handling.
- Env: `VITE_API_BASE_URL` used by `api.gateway.ts`. Keep sensitive keys out of repo.
- Deployment: Vercel config in `vercel.json`; CSP and build behavior in `vite.config.ts`.

Where to look for examples in the codebase:
- Protected routes: `src/Routes.tsx`, `src/components/PrivateRoute/` and `src/components/ConsentimentoLGPD/`
- API pattern: `src/api/api.gateway.ts` + `src/api/*service.ts` + `src/api/*.dto.ts`
- Consent details: `src/consent/store/consentStore.ts`, `src/consent/provider/*`, and `src/consent/config/consentConfig.ts`

PR & change guidance for AI agents:
- Prefer small, focused changes. Update/add service + dto together if altering an API contract.
- Add/update Zod schemas when editing forms; keep schema next to component and update tests.
- When touching consent or auth flows, include regression checks for gating (e.g., ensure a protected route still blocks without consent).

If anything is unclear, inspect these files first: `src/Routes.tsx`, `src/api/api.gateway.ts`, `src/contexts/AuthContext.tsx`, and the `src/consent/` folder. Ask for specific endpoints or backend contract details when needed.

---
Please review and tell me if you want more examples (API call pattern, form + schema pair, or consent flow end-to-end). 

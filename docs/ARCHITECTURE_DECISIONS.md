# Architecture Decisions

## ADR-001 — Separate frontend repo
**Accepted.** UI is one SiteGen client; use `gatofeo-agency/sitegen-ui`.

## ADR-002 — React + Vite + TypeScript
**Accepted.** Internal SPA, no SSR requirement, fast development/static hosting.

## ADR-003 — Operator dashboard, not wizard
**Accepted.** State must remain visible and navigable.

## ADR-004 — TanStack Query
**Accepted.** SiteGen is source of truth; avoid duplicate server state and Redux.

## ADR-005 — Polling only V1
**Accepted.** Persisted SiteGen jobs already support it; SSE/WebSockets deferred.

## ADR-006 — Lightweight editor
**Accepted.** Artifact tree + CodeMirror, not full browser IDE.

## ADR-007 — Preview-only deployment
**Accepted.** No production/custom-domain/DNS controls.

## ADR-008 — No SiteGen token in browser
**Accepted.** Local Vite proxy and Cloudflare BFF inject server-side credential.

## ADR-009 — Cloudflare Access
**Accepted as production protection.** Separate human identity from SiteGen service identity.

## ADR-010 — No AI in UI V1
**Accepted.** Reasoning belongs to future Hermes/model layer.

## ADR-011 — Deterministic Gatofeo Level 1 starter
**Accepted subject to API capability.** If SiteGen lacks it, log gap rather than fake persistent state.

## ADR-012 — API audit before features
**Accepted.** Real OpenAPI is authoritative.

Any material change must be appended as a new ADR rather than silently overwriting these decisions.

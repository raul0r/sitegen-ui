# TASKS.md — SiteGen Operator UI V1

Canonical execution tracker. Do not mark a task complete until behavior exists and relevant validation passes.

Legend: `[ ]` incomplete, `[x]` complete, `[~]` implemented/external acceptance pending, `[-]` intentionally deferred.

Live API audit: SiteGen Next API 1.0.0 at `http://127.0.0.1:8000/api/v1/` (OpenAPI 3.1 snapshot in `src/lib/api/openapi.json`).

## Phase 0 — Repository and API audit

- [x] Read all docs and inspect Git.
- [x] Locate/export current SiteGen OpenAPI.
- [x] Document actual base path and auth behavior.
- [x] Map real endpoints/resources to desired UI.
- [x] Record unsupported desired operations in `docs/API_GAP_LOG.md`.
- [x] Confirm no feature requires direct DB/filesystem/provider access.

Acceptance:
- [x] No endpoint or field is invented from assumptions.

## Phase 1 — React/Vite foundation

- [x] Initialize React + Vite + TypeScript strict.
- [x] Configure lint/format/typecheck.
- [x] Add Tailwind and shadcn/ui.
- [x] Add Lucide.
- [x] Add React Router and TanStack Query.
- [x] Add Vitest, React Testing Library, MSW, Playwright.
- [x] Add CodeMirror.
- [x] Establish source structure/path aliases.
- [x] Add global error boundary and not-found route.
- [x] Add base design tokens/light-dark capability.

Acceptance:
- [x] build, lint, typecheck, and tests pass.

## Phase 2 — Secure API proxy

Local:
- [x] Vite server proxies same-origin `/api/*`.
- [x] Upstream comes from server env.
- [x] Proxy injects bearer token server-side.
- [x] Token never enters `import.meta.env` browser bundle.
- [x] Upstream failure handled cleanly.

Production:
- [x] Cloudflare server-side proxy/BFF implemented.
- [ ] SiteGen token stored as Cloudflare secret.
- [ ] Upstream URL is server-side config.
- [ ] Missing secret fails closed.
- [x] Browser bundle leak check passes.

## Phase 3 — Typed API client

- [x] Generate/derive types from real OpenAPI.
- [x] Central API client.
- [x] Central structured error normalization.
- [x] Clients/hooks for capabilities, projects, artifacts, jobs, repository, builds, QA, deployments, audit.
- [x] MSW contract fixtures based on real API.

Acceptance:
- [x] Feature code does not use ad hoc fetch calls.
- [x] Unsupported behavior is logged as a gap.

## Phase 4 — App shell

- [x] Sidebar and page shell.
- [x] Projects and System navigation.
- [x] Nested project navigation: Overview, Artifacts, Repository, Builds, QA, Deployments, Audit.
- [x] Page header/breadcrumbs.
- [x] Status, loading, empty, and error primitives.
- [x] Responsive tablet behavior.

## Phase 5 — System / Capabilities

- [x] Render real SiteGen runtime/tool/provider capabilities.
- [x] Distinguish implemented/configured/available/validated where exposed.
- [x] Explain unavailable/unconfigured states.
- [x] Manual refresh.
- [x] No hardcoded capability success.

## Phase 6 — Projects

- [x] List real projects.
- [x] Useful project summary cards/rows.
- [x] New Project flow using actual create schema.
- [x] Empty template.
- [x] Gatofeo Level 1 deterministic template if SiteGen supports it.
- [x] If template API missing, record gap and do not fake persistence.
- [x] Navigate to new project.
- [x] Refresh proves persistence.

## Phase 7 — Overview

- [x] Project identity/status.
- [x] Repository summary.
- [x] branch/commit if exposed.
- [x] latest build.
- [x] latest QA and preview readiness.
- [x] deployment/preview.
- [x] recent activity if available.
- [x] Open Preview action when URL exists.

## Phase 8 — Artifact browser/editor

- [x] Confirm real list/read/write artifact API.
- [x] Render artifact tree.
- [x] Read supported text artifact.
- [x] CodeMirror editor.
- [x] syntax mode.
- [x] dirty indicator.
- [x] save.
- [x] discard/reload.
- [x] unsaved-navigation warning.
- [x] metadata/checksum if exposed.
- [ ] upload/import only if supported.
- [x] never expose host paths.

Acceptance:
- [x] Edit, save, refresh, and see server content. (Live Playwright: DESIGN_SYSTEM.md edit/save/reload.)

## Phase 9 — Repository

- [x] Read repository state.
- [x] initialization state.
- [x] branch/head.
- [x] remote identity/publication status.
- [x] initialize Git.
- [x] create branch.
- [x] checkpoint.
- [x] publish GitHub.
- [x] push.
- [x] poll async Git jobs.
- [x] no destructive Git operations.

## Phase 10 — Generic job UX

- [x] queued/running/terminal states from actual API.
- [x] 1–2s polling while active.
- [x] stop at terminal.
- [x] timestamps/duration.
- [x] structured failure.
- [x] request/correlation ID where exposed.
- [x] cancel only if supported.
- [x] invalidate related resources on terminal completion.

## Phase 11 — Builds

- [x] history/latest.
- [x] Run Build.
- [x] observe job.
- [x] status/commit/timing.
- [x] normalized failure/evidence.
- [x] project summary refresh.

Acceptance:
- [x] Real Astro build can be triggered and observed via UI. (Live Playwright against SiteGen.)

## Phase 12 — QA

- [x] reports list/latest.
- [x] Run QA.
- [x] observe job.
- [x] preview readiness.
- [x] severity counts/findings.
- [x] Chromium/Firefox/WebKit.
- [x] routes/broken links.
- [x] console/page/network evidence if exposed.
- [x] Lighthouse.
- [x] screenshots/evidence if accessible.
- [x] never recompute readiness client-side.

## Phase 13 — Deployments

- [x] list/latest.
- [x] provider project/environment/branch/commit/status.
- [x] Deploy Preview.
- [x] observe job.
- [x] refresh deployment.
- [x] preview URL.
- [x] Open Preview.
- [x] Run Live QA.
- [x] no production/domain/DNS controls.

Acceptance:
- [x] Real Cloudflare preview can be created/opened through UI. (Live Playwright: preview URL + HTTP 200 + live QA.)

## Phase 14 — Audit

- [ ] fetch events. (GAP-002: no audit list endpoint)
- [ ] timestamp, actor, request/correlation, project/action/result.
- [ ] lightweight filters where supported.
- [x] read-only.
- [x] defensive redaction in presentation.

Audit listing is GAP-002. Page renders an explicit unavailable state.

## Phase 15 — Error/edge hardening

- [x] SiteGen unavailable.
- [x] unauthorized.
- [x] provider not configured/unavailable.
- [x] build failure.
- [~] QA failure.
- [~] deployment failure.
- [~] cancelled/stale job.
- [x] no Git/build/QA/deployment states.
- [x] capability unavailable.
- [ ] save conflict if API supports version conflict.

## Phase 16 — Testing

- [x] client/error unit tests.
- [x] component tests.
- [x] project creation tests.
- [x] artifact editor tests.
- [x] polling tests.
- [x] build/QA/deployment tests.
- [x] audit/system tests.
- [ ] accessibility smoke tests.
- [x] Playwright E2E capabilities/projects.
- [x] E2E create project.
- [x] E2E build.
- [x] E2E QA.
- [x] safe provider/deploy E2E where configured.
- [x] no secret in snapshots/artifacts.

## Phase 17 — Docker local development

- [x] Dockerfile.dev.
- [x] non-root where practical.
- [x] source mount/HMR.
- [x] port 5173.
- [x] host.docker.internal / host-gateway to SiteGen.
- [x] server-only token injection.
- [x] `.env.example`, `.gitignore`.
- [x] real browser → proxy → SiteGen acceptance.
- [x] no browser-bundle secret leak.

## Phase 18 — Cloudflare UI deployment

- [x] Vite production build.
- [x] Cloudflare same-origin API proxy/BFF.
- [ ] upstream server configuration.
- [ ] token Cloudflare secret.
- [ ] Cloudflare Access protection.
- [x] SPA routing fallback.
- [x] security headers.
- [ ] preview deployment.
- [ ] `/api/*` works.
- [ ] Access rejects unauthorized users.
- [x] built assets contain no SiteGen token.

## Phase 19 — Final operator acceptance

Through browser:
- [x] capabilities.
- [x] create project.
- [ ] initialize starter if supported.
- [x] edit artifact.
- [x] initialize Git/branch/checkpoint.
- [x] build and observe.
- [x] QA and inspect.
- [x] publish/push.
- [x] deploy preview.
- [x] open preview.
- [x] live QA.
- [x] audit.
- [x] refresh after major stages and state persists.

Final:
- [x] no critical UI errors.
- [x] no credential leaks.
- [x] SiteGen remains source of truth.
- [x] TASKS reconciled.
- [ ] repo clean.
- [~] ready for operator use. (Cloudflare Access/production UI deploy still pending.)

## Deferred

- [-] Hermes integration
- [-] MCP
- [-] LangGraph
- [-] AI generation
- [-] production deployment controls
- [-] DNS/custom domains
- [-] WebSockets/SSE
- [-] advanced Git
- [-] full browser IDE
- [-] billing/multi-tenant SaaS

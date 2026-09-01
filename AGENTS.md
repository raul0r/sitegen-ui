# AGENTS.md — SiteGen Operator UI Constitution

## Mission

Build an internal operator console that manually exercises the real SiteGen V1 workflow through the same HTTP interface future agents such as Hermes will use.

The UI is a **reference client**, not a replacement backend, workflow engine, or AI agent.

## V1 capabilities

The operator should be able to:

- inspect SiteGen capabilities;
- list/create projects;
- inspect project summary;
- initialize a deterministic Gatofeo Level 1 starter when supported;
- browse/read/edit supported text artifacts;
- inspect repository state;
- trigger safe Git operations exposed by SiteGen;
- trigger builds and observe jobs;
- inspect build history;
- run QA and inspect evidence;
- publish to GitHub;
- push through SiteGen;
- deploy a Cloudflare preview;
- refresh deployment state;
- run live QA;
- open preview;
- inspect audit events.

## Architecture invariant

All SiteGen operations flow through the SiteGen API.

```text
React page/component
→ feature hook/service
→ typed API client
→ same-origin /api/*
→ local/prod server-side proxy
→ SiteGen HTTP API
```

Never call PostgreSQL, Redis, project workspace, Git CLI, GitHub API, or Cloudflare API directly from this UI.

## Repository

Use a separate repository: `gatofeo-agency/sitegen-ui`.

## Stack

Use React, Vite, TypeScript strict mode, React Router, TanStack Query, Tailwind, shadcn/ui, Lucide, CodeMirror 6, Vitest, React Testing Library, MSW, Playwright.

Do not add Next.js, Redux, GraphQL, LangGraph, MCP, AI SDKs, WebSockets, or SSE without an approved ADR.

## Security boundary

The SiteGen bearer token is a service credential and must never enter browser JavaScript.

Forbidden:

- `VITE_SITEGEN_API_TOKEN`
- localStorage/sessionStorage bearer token
- hardcoded bearer token
- token in URL/query
- token in browser console
- direct browser request to SiteGen requiring the token

Local:

```text
Browser → Vite /api proxy → inject token server-side → SiteGen
```

Production:

```text
Browser → Cloudflare Access → UI → Cloudflare /api proxy → inject secret → SiteGen VPS
```

## Human authentication

Cloudflare Access is the recommended production human identity boundary. Human identity and SiteGen service identity are separate.

## API contract

Inspect current SiteGen OpenAPI before implementing each resource family. Prefer schema-derived types using `openapi-typescript` and `openapi-fetch`.

If the API lacks a needed capability, add an entry to `docs/API_GAP_LOG.md`; do not fabricate persistence or bypass SiteGen.

## State

SiteGen owns projects, artifacts, jobs, repositories, builds, QA reports, deployments, audit events, and capabilities.

TanStack Query mirrors server state.

Local React state is only for transient UI such as dialogs, selected file, filters, theme, and unsaved editor drafts.

## Polling

V1 uses polling only.

Poll active jobs roughly every 1–2 seconds. Stop aggressive polling at terminal state and invalidate/refetch related resources.

Do not optimistically claim build, QA, Git push, or deployment success.

## Navigation

Global:

- Projects
- System / Capabilities

Project:

- Overview
- Artifacts
- Repository
- Builds
- QA
- Deployments
- Audit

This is an operator dashboard, not a forced wizard.

## New project

Offer:

- Empty
- Gatofeo Level 1

The starter is deterministic and uses SiteGen-supported behavior. If SiteGen lacks transactional template initialization, log the API gap instead of coordinating unreliable browser-only state.

## Artifact editor

V1: artifact/file tree + lightweight CodeMirror editor, dirty state, save, discard, metadata.

Do not build a terminal, debugger, LSP, or VS Code clone. Only expose files/artifacts authorized by SiteGen.

## Git

Safe UI actions may include initialize, branch, checkpoint, publish GitHub, push, refresh.

Do not expose force push, reset --hard, rebase, cherry-pick, remote deletion, or arbitrary Git commands.

## Builds

Display structured state, job, commit when available, timestamps, duration, normalized failure, and evidence. Do not infer success by parsing terminal text.

## QA

Display SiteGen's QAReport: preview readiness, severity counts, browser results, routes, broken links, Lighthouse, evidence, target, timestamps.

Never recalculate readiness in the browser.

## Deployment

V1 is preview-only:

- request preview;
- refresh;
- open preview;
- run live QA.

No production, custom domain, or DNS controls.

## Audit

Read-only event history. Never render secrets.

## Errors

Prefer structured SiteGen errors: concise message, stable code, request/correlation ID, and retry only when appropriate. Never dump raw stack traces.

## UX

Technical, compact, readable, restrained, desktop-first, tablet-usable, accessible. Status must use text/icon, not color alone.

## Testing

Require appropriate unit, component, MSW integration, failure-state, polling, and Playwright E2E tests.

## Definition of Done

A human can, entirely through the browser:

1. see real capabilities;
2. create a project;
3. manage supported artifacts;
4. operate safe repository actions;
5. trigger and observe a build;
6. run and inspect QA;
7. publish GitHub;
8. deploy Cloudflare preview;
9. run live QA;
10. open preview;
11. inspect audit;
12. refresh at any point and reconstruct authoritative state;
13. use the Cloudflare-deployed UI without exposing SiteGen credentials.

Final doctrine:

```text
UI presents intent.
SiteGen enforces execution.
```

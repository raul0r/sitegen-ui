# SiteGen Operator UI — Initial Coding Agent Prompt

You are the primary implementation agent for the SiteGen Operator UI.

This repository contains the product and architecture contracts for an internal React/Vite operator console that will manually exercise the existing SiteGen V1 HTTP API.

The architecture has already been decided.

Your job is to implement it incrementally, testably, and without creating a second backend.

## 1. Read first

Before modifying code, read in this order:

1. `START_HERE.md`
2. `AGENTS.md`
3. `TASKS.md`
4. `README.md`
5. every file under `docs/`

Then inspect the repository and Git state.

## 2. Critical first task — inspect real SiteGen API

The SiteGen backend already exists and is validated.

Locate or fetch its current OpenAPI contract and map the real endpoints/resources to desired UI capabilities.

Record genuine missing capabilities in:

`docs/API_GAP_LOG.md`

Do not invent endpoints, fields, state transitions, file operations, or provider behavior.

Do not directly access SiteGen PostgreSQL, Redis, project workspace, GitHub, Cloudflare, Git CLI, or filesystem.

## 3. Product boundary

This is an internal operator console.

It is NOT:

- an AI website builder;
- client CMS;
- SiteGen backend rewrite;
- Hermes implementation;
- MCP client;
- production/DNS console.

The UI lets a human manually perform the workflow Hermes will later automate.

## 4. Stack

Use:

- React
- Vite
- TypeScript strict
- React Router
- TanStack Query
- Tailwind
- shadcn/ui
- Lucide
- CodeMirror 6
- Vitest
- React Testing Library
- MSW
- Playwright UI E2E

Do not introduce Next.js, Redux, GraphQL, LangGraph, MCP, WebSockets/SSE, or AI SDKs.

## 5. Security rule

The SiteGen bearer token MUST NEVER be shipped to browser JavaScript.

Never create:

`VITE_SITEGEN_API_TOKEN`

Local development uses a Vite server-side `/api` proxy that injects the token.

Production uses a Cloudflare server-side BFF/proxy that injects the token.

Browser source calls only relative `/api/*`.

## 6. Source of truth

SiteGen owns all operational state.

React is a projection of SiteGen state.

Refreshing the browser must reconstruct project, repository, build, QA, deployment, and job state from SiteGen.

Do not create browser-persistent copies of server resources.

## 7. First vertical slice

Before broad UI work, prove:

```text
React/Vite starts
→ browser calls /api/*
→ local server proxy authenticates to SiteGen
→ real capability discovery succeeds
→ real project list succeeds
→ operator dashboard renders
```

Then prove:

```text
Create project in UI
→ SiteGen persists project
→ refresh browser
→ project still exists
```

Only after this should project workflow pages expand.

## 8. Work order

Follow `TASKS.md` approximately:

1. repo/API audit;
2. React/Vite foundation;
3. secure proxy;
4. typed API client;
5. shell/navigation;
6. System/Capabilities;
7. Projects;
8. Overview;
9. Artifacts;
10. Repository;
11. Jobs;
12. Builds;
13. QA;
14. Deployments;
15. Audit;
16. error hardening;
17. tests;
18. Docker;
19. Cloudflare deployment;
20. final operator acceptance.

## 9. API gaps

If SiteGen lacks a needed operation:

- document exact gap;
- do not fake it with local persistence;
- do not add provider/backend business logic to this repo;
- continue independent work.

If a small SiteGen backend enhancement is required, document the desired contract. Do not modify the backend repository unless explicitly instructed.

## 10. Async operations

SiteGen already uses persisted jobs.

V1 uses polling only.

Build one reusable job-observation pattern from the real API.

Do not optimistically claim infrastructure success.

## 11. Navigation

Global:

- Projects
- System

Project:

- Overview
- Artifacts
- Repository
- Builds
- QA
- Deployments
- Audit

Keep the UI compact, technical, and state-oriented.

## 12. Deployment

Frontend deployment target is Cloudflare.

Production design:

```text
Browser
→ Cloudflare Access
→ React UI
→ same-origin /api
→ Cloudflare server-side proxy
→ SiteGen API on VPS
```

No service token in the browser.

## 13. Testing

Add tests with implementation.

Keep typecheck, lint, tests, and production build green.

Do not weaken validation to get green results.

## 14. TASKS.md

Update `TASKS.md` continuously.

A component existing does not mean a task is complete. Complete means the intended behavior works and relevant validation passes.

## 15. Begin

After reading:

1. report repository state;
2. report actual SiteGen OpenAPI/API surface discovered;
3. report confirmed API gaps;
4. identify first implementation task;
5. reconcile `TASKS.md` if needed;
6. immediately begin implementation.

Do not wait for another planning confirmation.

The goal is to ship a real SiteGen Operator UI that manually proves the same interface future Hermes automation will use.

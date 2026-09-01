# SiteGen Operator UI

Internal operator console for manually exercising the SiteGen website-production platform before the same operations are automated by Hermes.

## Purpose

The UI is a **client of SiteGen**, not a second implementation of SiteGen.

```text
Human Operator
      ↓
SiteGen Operator UI
      ↓
same-origin /api/*
      ↓
Local Vite proxy OR Cloudflare server-side proxy
      ↓
SiteGen HTTP API
      ↓
Application Services
      ↓
Jobs / Git / Astro / QA / GitHub / Cloudflare
```

The manual V1 flow is:

```text
Create Project
→ Initialize Gatofeo Level 1 artifacts
→ Edit / upload supported artifacts
→ Initialize Git
→ Create branch
→ Checkpoint
→ Build Astro
→ Run QA
→ Publish GitHub
→ Deploy Cloudflare Preview
→ Run Live QA
→ Open Preview
```

## Stack

- React + Vite + TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Lucide
- CodeMirror 6
- Vitest + React Testing Library + MSW
- Playwright UI E2E
- Docker local development
- Cloudflare deployment

## Critical security rule

**Never ship `SITEGEN_API_TOKEN` to browser JavaScript.**

Do not use `VITE_SITEGEN_API_TOKEN`.

Local development uses a server-side Vite proxy. Production uses a Cloudflare server-side proxy/BFF. Both inject the SiteGen bearer token outside the browser.

## Recommended repository

`gatofeo-agency/sitegen-ui`

## Read first

1. `START_HERE.md`
2. `AGENTS.md`
3. `TASKS.md`
4. `docs/`

## Local development

```bash
cp .env.example .env
# set SITEGEN_API_TOKEN to the SiteGen service token (server-side only)
# SITEGEN_API_BASE_URL=http://127.0.0.1:8000 when the UI runs on the host

npm install
npm run dev
```

Open http://localhost:5173. The browser calls same-origin `/api/v1/*`. The Vite server injects the bearer token and forwards to SiteGen.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

Docker:

```bash
docker compose up --build
```

The UI container talks to SiteGen at `http://host.docker.internal:8000` by default.

## V1 non-goals

No AI generation, Hermes, MCP, LangGraph, production deployment, DNS, custom domains, advanced Git, streaming UI, full browser IDE, billing, or multi-tenant SaaS.

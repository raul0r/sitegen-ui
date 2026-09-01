# Frontend Architecture

## Runtime topology

### Local

```text
Browser
→ http://localhost:5173
→ Vite dev server
→ /api proxy
→ http://host.docker.internal:8000
→ SiteGen API
```

### Production

```text
Browser
→ Cloudflare Access
→ static React/Vite app
→ same-origin /api/*
→ Cloudflare server-side proxy/BFF
→ SiteGen API on VPS
```

## Layers

```text
routes/pages
→ features
→ hooks/query
→ typed API client
→ proxy
→ SiteGen
```

Components should not know transport or provider internals.

## Proposed source layout

```text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── error-boundary.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── status/
│   └── feedback/
├── features/
│   ├── projects/
│   ├── artifacts/
│   ├── repository/
│   ├── jobs/
│   ├── builds/
│   ├── qa/
│   ├── deployments/
│   ├── audit/
│   └── capabilities/
├── lib/
│   ├── api/
│   ├── query/
│   ├── format/
│   └── security/
├── pages/
├── test/
│   ├── msw/
│   └── fixtures/
└── styles/
```

Cloudflare proxy code lives outside browser `src/`, e.g. `functions/api/[[path]].ts` or equivalent Worker structure.

## Routing

Suggested:

```text
/ → /projects
/projects
/projects/new
/projects/:projectId
/projects/:projectId/artifacts
/projects/:projectId/repository
/projects/:projectId/builds
/projects/:projectId/qa
/projects/:projectId/deployments
/projects/:projectId/audit
/system
```

Use nested project layouts.

## API types

Preferred:

```text
SiteGen OpenAPI
→ openapi-typescript
→ TypeScript schema
→ openapi-fetch
```

No large hand-maintained duplicate API model.

## Data

TanStack Query is the server-state layer. Stable resource-oriented query keys.

## Mutations

Mutation → SiteGen operation → immediate resource/job → poll if async → terminal state → invalidate/refetch affected resources.

Avoid optimistic infrastructure success.

## Editor

CodeMirror 6, supporting Markdown/JSON/JS/TS/CSS/plain text as useful. Persistence stays in feature/API services.

## Proxy boundary

Browser uses relative `/api/...` only. Browser should not know the SiteGen internal hostname.

## Business logic

Backend owns readiness, retryability, capability validity, path policy, provider config, deployment state, build state. Frontend displays, does not reproduce.

## Performance

Correctness and clarity first. Add route splitting/caching naturally; avoid virtualization or state frameworks until actual scale requires them.

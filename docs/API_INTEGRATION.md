# API Integration

## Authority

The actual SiteGen OpenAPI contract is authoritative. This document describes integration rules, not guaranteed endpoint names.

## Browser contract

Browser calls relative `/api/...`.

Never call an internal Docker hostname or VPS API URL directly from browser source.

## Local proxy

The Vite server must:

- forward method/path/query/body;
- inject SiteGen bearer token server-side;
- use upstream URL from server environment;
- preserve safe content/request headers;
- return upstream status/body;
- never log secrets.

## Production proxy

Cloudflare server-side proxy provides equivalent behavior using:

- `SITEGEN_API_BASE_URL` server-side configuration;
- `SITEGEN_API_TOKEN` secret.

No `VITE_` secret.

## OpenAPI workflow

```text
run SiteGen
→ fetch/export OpenAPI JSON
→ generate TypeScript schema
→ compile typed client
```

If a schema snapshot is committed, treat it as generated contract evidence.

## Frontend error model

Normalize real SiteGen errors conceptually to:

```ts
type UiApiError = {
  status: number
  code?: string
  message: string
  requestId?: string
  retryable?: boolean
}
```

Do not show raw traces.

## Resource families to verify

### Capabilities
Needed for System page and dependency-aware controls.

### Projects
At least list/create/get and summary if available.

### Artifacts
Verify list/read/update and whether arbitrary safe file access exists versus canonical artifacts only.

### Jobs
Get state/result/error/timestamps/cancel where supported.

### Repository
Consume structured operations only. Never issue Git CLI from UI/proxy.

### Builds
List/get/submit, related job, status/evidence.

### QA
List/get/submit, findings, browser results, Lighthouse, readiness.

### Deployments
List/get/request preview/refresh, URL/provider identity/branch/commit.

### Audit
List project events and supported filters/pagination.

## Query invalidation

After save/build/QA/deployment terminal results, invalidate the corresponding resource list/detail and project summary.

## API gaps

If OpenAPI does not support a required UI feature, log it in `API_GAP_LOG.md`. Never create a private alternate protocol.

# Cloudflare Deployment

## Goal

Deploy the UI separately from SiteGen.

```text
sitegen-ui GitHub repo
→ Cloudflare
```

SiteGen later runs on a VPS.

## Topology

```text
Operator Browser
→ Cloudflare Access
→ React/Vite UI
→ same-origin /api/*
→ Cloudflare server-side proxy
→ HTTPS
→ SiteGen VPS API
```

## Static frontend

Build Vite static assets. Configure SPA routing fallback to `index.html`.

## BFF responsibilities

The Cloudflare server-side `/api/*` handler:

- forwards method/path/query/body;
- injects SiteGen bearer token;
- forwards only safe headers;
- preserves upstream status/body;
- does not implement SiteGen business logic;
- never returns/logs the token.

## Configuration

Server-side variable:

```text
SITEGEN_API_BASE_URL
```

Cloudflare secret:

```text
SITEGEN_API_TOKEN
```

Never make either token available as a `VITE_*` secret.

## Cloudflare Access

Protect the operator UI so only approved identity can access it. Initial identity provider may be simple; exact Access policy is operational configuration, not React auth logic.

## Example future names

```text
sitegen.gatofeo.net
api.sitegen.gatofeo.net
```

Names are not hardcoded V1 contracts.

## HTTPS

Do not proxy a bearer credential to an unencrypted public upstream.

## Security headers

Configure suitable CSP, X-Content-Type-Options, Referrer-Policy, and frame policy.

## Preview deployments

Be careful not to expose a sensitive production SiteGen API through unprotected public frontend previews. Use Access and appropriate staging/upstream strategy.

## Acceptance

- UI loads from Cloudflare;
- Access blocks unauthorized visitor;
- same-origin `/api` works;
- real SiteGen operation succeeds;
- generated JS/source maps/logs do not contain token.

## Important boundary

Cloudflare hosting/BFF must not directly call GitHub or Cloudflare Pages APIs for SiteGen workflow actions. Those remain SiteGen provider responsibilities.

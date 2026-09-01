# Authentication and Security

## Threat model

This internal UI controls a powerful execution platform capable of project writes, safe command execution, Git publishing, and preview deployments.

The browser must not receive SiteGen's bearer credential.

## Forbidden

```text
VITE_SITEGEN_API_TOKEN
```

Also forbidden:

- localStorage/sessionStorage token;
- hardcoded token;
- token in query string;
- token rendered to HTML;
- token logged in browser console.

## Local

Frontend container receives server-side:

```text
SITEGEN_API_BASE_URL
SITEGEN_API_TOKEN
```

Only the Vite server proxy uses the token.

Browser calls same-origin `/api/*`.

## Production

Cloudflare holds:

- SiteGen token as secret;
- upstream SiteGen URL as server configuration.

The server-side proxy injects auth.

## Human identity

Protect deployed console with Cloudflare Access or equivalent. Human identity and SiteGen service identity remain separate.

## Browser storage

Only harmless preferences such as theme/panel state. No infrastructure/provider/service credentials.

## Logs and errors

Never log Authorization, raw environment, or provider secrets. BFF should not reflect sensitive upstream headers.

UI may defensively redact obvious credential-like strings in displayed errors; backend redaction remains primary.

## Same-origin architecture

Use same-origin `/api` proxy rather than permissive CORS. Do not solve CORS by making SiteGen universally open.

## SiteGen VPS later

Prefer HTTPS and restricted ingress. PostgreSQL and Redis must not be public. Those backend decisions stay in SiteGen infrastructure.

## Destructive controls

No production deploy, DNS, custom-domain, or destructive Git controls in UI V1. Backend still enforces policy independently.

## Production security checks

Before acceptance:

- inspect generated JS;
- search build output for known SiteGen token;
- inspect network requests;
- inspect Cloudflare function logs;
- inspect source maps if published;
- verify unauthorized Cloudflare Access request is blocked.

## `.env.example`

May contain empty placeholders:

```text
SITEGEN_API_BASE_URL=
SITEGEN_API_TOKEN=
```

Real `.env` is ignored and uncommitted.

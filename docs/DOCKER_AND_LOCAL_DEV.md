# Docker and Local Development

## Goal

Run the UI as a third application container while Hermes and SiteGen remain independent.

```text
Hermes stack
  └── Hermes

SiteGen stack
  ├── API :8000
  ├── Worker
  ├── PostgreSQL
  └── Redis

SiteGen UI
  └── Vite :5173
```

## Cross-repo networking

For V1, keep the repositories loosely coupled.

Recommended frontend server env:

```text
SITEGEN_API_BASE_URL=http://host.docker.internal:8000
```

On Linux add `host.docker.internal:host-gateway` via Compose `extra_hosts`.

The browser uses only `http://localhost:5173` and `/api/*`.

## Environment

Frontend `.env.example`:

```text
SITEGEN_API_BASE_URL=http://host.docker.internal:8000
SITEGEN_API_TOKEN=
```

These values belong to the Node/Vite server process, not browser `import.meta.env`.

## Dockerfile.dev

Expected:

- Node 20+;
- non-root user where practical;
- app working directory;
- dependencies;
- Vite binds `0.0.0.0`;
- port 5173;
- source mounted for HMR.

## Compose

- source mount;
- node_modules handled safely;
- 5173 exposed;
- server-side env injected;
- host gateway configured;
- no Docker socket;
- no SiteGen workspace mount.

## UI container does not need

Git, Python, PostgreSQL/Redis clients, SiteGen workspace, GitHub token, Cloudflare provider token.

It only needs the SiteGen service token for the proxy.

## Acceptance

Prove:

```text
Browser
→ UI container
→ Vite proxy
→ SiteGen API
→ real project data
```

and verify the token is absent from browser JS/network-visible request headers to the UI.

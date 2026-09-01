# START HERE — SiteGen Operator UI

You are implementing the SiteGen Operator UI.

The product and architecture decisions are already defined. Do not begin by redesigning the system.

## Read in this order

1. `AGENTS.md`
2. `TASKS.md`
3. `README.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/UX_FLOW.md`
6. `docs/FRONTEND_ARCHITECTURE.md`
7. `docs/API_INTEGRATION.md`
8. `docs/AUTH_AND_SECURITY.md`
9. `docs/STATE_MANAGEMENT.md`
10. `docs/COMPONENT_SYSTEM.md`
11. `docs/TESTING_STRATEGY.md`
12. `docs/DOCKER_AND_LOCAL_DEV.md`
13. `docs/CLOUDFLARE_DEPLOYMENT.md`
14. `docs/FUTURE_HERMES_ALIGNMENT.md`
15. `docs/API_GAP_LOG.md`
16. `docs/ARCHITECTURE_DECISIONS.md`

## First responsibility

Inspect the actual SiteGen OpenAPI contract.

The frontend must adapt to the real SiteGen API. It must not invent endpoints, fields, state transitions, file operations, or provider behavior.

If a desired UI capability is unsupported:

1. record it in `docs/API_GAP_LOG.md`;
2. implement independent work;
3. do not hide the gap behind browser-local state;
4. do not build a second backend inside this repo.

## First implementation milestone

```text
Browser
→ React/Vite
→ server-side local proxy
→ authenticated SiteGen API
→ GET capabilities
→ GET projects
→ render dashboard
```

Then prove:

```text
Create project in UI
→ SiteGen persists it
→ refresh browser
→ project reconstructs from SiteGen
```

## Persistent-state rule

SiteGen is the source of truth. React state is disposable except for presentation and unsaved drafts.

## Work style

Inspect → implement → test → update `TASKS.md` → continue.

The goal is to ship the operator UI, not to produce another plan.

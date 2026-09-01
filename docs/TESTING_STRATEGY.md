# Testing Strategy

## Goal

Prove the UI represents SiteGen correctly and preserves credential boundaries.

## Unit tests

Test formatters, status mappings, error normalization, query helpers, and defensive redaction.

## Component tests

React Testing Library for forms, status states, project summaries, artifact editor behavior, QA visualization, system capabilities, and error/empty states.

## API integration

Use MSW with fixtures derived from real SiteGen API/OpenAPI.

Cover:

- normal success;
- unauthorized;
- provider not configured;
- async job progression;
- build failure;
- QA findings;
- deployment failure;
- empty resource state.

## Polling

Use fake timers where appropriate.

Verify:

- active jobs refetch;
- terminal state stops polling;
- unmount stops polling;
- related resources invalidate/refetch.

## Artifact editor

Read, edit, dirty, save, save failure, discard, navigation warning.

## QA

Test readiness true/false, all severities, browser matrix, missing Lighthouse/evidence, findings.

## Deployment

No deployment, queued/running/succeeded/failed, refresh, preview URL, live-QA eligibility.

## Accessibility

At least keyboard/focus/dialog/button/status smoke tests. Status may not be color-only.

## Playwright UI E2E

Critical local path:

```text
open UI
→ capabilities
→ projects
→ create project
→ trigger build
→ observe job
→ run QA
→ inspect report
```

Extended safe path with disposable resources:

```text
publish GitHub
→ deploy preview
→ live QA
```

## Proxy security

Verify:

- browser succeeds without holding SiteGen token;
- missing server token fails closed;
- built assets contain no token;
- proxy doesn't reflect Authorization;
- errors don't leak secret.

## CI target

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright E2E may require a configured SiteGen test environment.

## Secret hygiene

Only fake credentials in fixtures. Never capture real tokens in screenshots, traces, snapshots, or logs.

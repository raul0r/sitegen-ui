# UX Flow

## Navigation

Global:

```text
SiteGen
├── Projects
└── System
```

Project:

```text
Overview
Artifacts
Repository
Builds
QA
Deployments
Audit
```

## Project creation

```text
Projects
→ New Project
→ actual SiteGen fields
→ template: Empty / Gatofeo Level 1
→ Create
→ Project Overview
```

If starter initialization is async, expose job state.

## Overview

Summarize authoritative server state, e.g.:

```text
HVAC Demo — Preview Ready

Repository
Git ✓  GitHub ✓
Branch sitegen/build
Commit 935df95

Build
Success · 11.3s

QA
Preview Ready
0 blocker · 0 high · 0 medium · 0 low

Deployment
Cloudflare Preview
https://...
```

## Artifacts

```text
select artifact
→ fetch server content
→ edit local draft
→ Save
→ SiteGen write
→ refetch
```

No autosave in V1. Warn on dirty navigation.

## Repository

Dependency-aware actions:

- Initialize Git if absent.
- Create Branch/Checkpoint if initialized.
- Publish GitHub if not published.
- Push if remote exists.

Async actions show job state.

## Build

```text
Run Build
→ job
→ queued/running
→ succeeded/failed/cancelled
→ refresh Build
```

Use structured errors and correlation IDs.

## QA

Summary first: Preview Ready YES/NO.

Then severities, browsers, routes, Lighthouse, evidence.

## Deployment

```text
Deploy Preview
→ job
→ deployment
→ refresh/poll
→ preview URL
→ Open Preview / Run Live QA
```

No production/DNS controls.

## Audit

Chronological, read-only, lightweight filtering if useful.

## System

Capability state explains unavailable actions. Never silently disable a control without explaining why.

## Loading/errors/empty states

Every page/feature must explicitly handle:

- loading;
- empty;
- success;
- failure;
- unavailable;
- unconfigured;
- unauthorized.

Do not confuse unconfigured with failed.

## Responsive

Desktop primary, tablet usable. Mobile functional, not dense parity.

## Learning goal

The workflow should remain visible enough that the operator learns SiteGen's state machine rather than using one opaque “do everything” button.

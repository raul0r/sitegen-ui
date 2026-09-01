# Product Specification

## Product

**SiteGen Operator UI** — internal browser console for manually operating SiteGen before Hermes automation.

## Problem

SiteGen V1 already executes the mechanical website-production workflow, but Swagger/API calls are too low-level for repeated human operation and learning.

The operator needs a clear interface to understand:

- required inputs;
- dependencies;
- async jobs;
- persisted state;
- failures;
- QA evidence;
- GitHub/Cloudflare lifecycle;
- what Hermes will later need to automate.

## Goal

Make real SiteGen state visible and operable without hiding its workflow.

The UI should answer:

```text
What project am I operating?
What state is it in?
What can SiteGen do?
What operation is running?
What succeeded or failed?
What evidence exists?
What is the next sensible action?
```

## Primary user

Internal Gatofeo/SiteGen operator.

## Jobs to be done

- Create/inspect SiteGen projects.
- Supply/edit persistent project context.
- Trigger safe mechanical operations.
- Observe asynchronous execution.
- Review quality evidence.
- Publish/deploy previews.
- Learn the operational contract that Hermes will later use.

## V1 workflow

```text
Projects
→ Create Project
→ Overview
→ Artifacts
→ Repository
→ Build
→ QA
→ GitHub
→ Cloudflare Preview
→ Live QA
→ Audit
```

Navigable dashboard, not forced wizard.

## Starter package

New Project offers:

- Empty
- Gatofeo Level 1

Level 1 is deterministic, no LLM.

Preferred: SiteGen owns transactional starter initialization. If API support is absent, log an API gap.

## Main screens

### Projects
Project identity, latest build/QA/provider summary, updated time, create action.

### Overview
Identity, repository, latest build, QA readiness, deployment, preview, recent activity.

### Artifacts
Tree, text editor, metadata, save/discard.

### Repository
Git state, branch, commit, remote, safe actions.

### Builds
History, run build, job progress, failures.

### QA
Readiness, severities, browsers, routes, Lighthouse, evidence.

### Deployments
Preview environment, provider project, branch/commit, status, preview URL, refresh/live QA.

### Audit
Actor/request/action/result event stream.

### System
Runtime/tool/provider capability discovery.

## Success criteria

A human completes a real SiteGen preview workflow through the browser without Swagger or manual API commands.

## Internal learning metrics

- time to first project/build/preview;
- times terminal/Swagger is required;
- unclear state count;
- API gaps discovered;
- failed-job diagnosis time;
- repeated calls/polling friction;
- operator interventions.

## Non-goals

No AI, client CMS, production DNS, production cutover, general DevOps console, or alternate SiteGen backend.

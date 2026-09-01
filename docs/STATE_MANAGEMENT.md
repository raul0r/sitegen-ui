# State Management

## Principle

SiteGen owns operational state. The frontend reads, displays, and requests mutations.

## TanStack Query

Use it for all server state: capabilities, projects, artifacts, jobs, repository, builds, QA, deployments, audit.

Avoid Redux and duplicate server-state stores.

## Local React state

Use only for dialogs, selected item, unsaved editor draft, filters, theme, and presentation.

## Conceptual query keys

```text
["capabilities"]
["projects"]
["project", projectId]
["artifacts", projectId]
["artifact", projectId, artifactId]
["repository", projectId]
["job", jobId]
["builds", projectId]
["build", buildId]
["qaReports", projectId]
["qaReport", qaReportId]
["deployments", projectId]
["deployment", deploymentId]
["audit", projectId]
```

Adjust to actual API identities.

## Polling

Active jobs: roughly 1–2 seconds. Stop at terminal state.

Do not poll every resource aggressively. Invalidate/refetch relevant resources when an operation completes.

## Mutation model

```text
user intent
→ mutation
→ SiteGen response
→ if async: job
→ poll
→ terminal
→ invalidate affected resources
```

## Optimistic updates

Never optimistically claim build/QA/push/deployment success.

## Editor drafts

Server content becomes local draft. Save mutation must succeed, then refetch and clear dirty state.

## Browser refresh

All saved operational state reconstructs from SiteGen after F5. Only unsaved drafts may be lost in V1.

## Capabilities

Allow refresh because runtime/provider configuration can change.

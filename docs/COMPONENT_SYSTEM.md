# Component System

## Design direction

Internal technical console: compact, high-information, restrained, accessible, desktop-first, tablet-usable.

Use shadcn/ui primitives and Lucide icons where useful. Avoid decorative complexity.

## Layout

```text
AppShell
Sidebar
ProjectSidebarSection
TopBar
PageHeader
Breadcrumbs
MainContent
```

## Status components

- `StatusBadge`
- `CapabilityStatus`
- `JobStatus`
- `ReadinessBadge`
- `SeverityBadge`
- `ProviderStatus`

Status uses icon/text plus color.

## Feedback

- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `InlineError`
- `ConfirmDialog`
- `Toast`
- `JobProgress`

## Projects

- `ProjectCard`
- `ProjectTable`
- `ProjectSummary`
- `RecentActivity`
- `NextActionCard`

## Artifacts

- `ArtifactTree`
- `ArtifactTreeNode`
- `ArtifactEditor`
- `ArtifactMetadata`
- `DirtyIndicator`
- Save/Discard actions

## Repository

- `RepositorySummary`
- `BranchDisplay`
- `CommitDisplay`
- `RemoteDisplay`
- safe action buttons/dialogs

No terminal.

## Builds

- `BuildSummary`
- `BuildHistory`
- `BuildRow`
- `RunBuildButton`
- `BuildFailurePanel`

## QA

- `QaSummary`
- `PreviewReadinessCard`
- `SeverityCounts`
- `FindingsList`
- `BrowserMatrix`
- `RouteSummary`
- `LighthouseScores`
- `EvidenceGallery`

QA should be especially scannable.

## Deployments

- `DeploymentSummary`
- `DeploymentHistory`
- `DeployPreviewButton`
- `RefreshDeploymentButton`
- `PreviewLink`
- `RunLiveQaButton`

## Audit

- `AuditTimeline`
- `AuditEventRow`
- optional filters

## Capabilities

- `SystemSummary`
- `CapabilityGrid`
- `ProviderCapabilityCard`
- `RuntimeCapabilityRow`

## Forms

Explicit validation and server error display. No optimistic infrastructure success.

## Editor

CodeMirror is a supporting component, not the product. Minimal chrome: filename, dirty state, metadata, Save, Discard.

## Theme

Light/dark is acceptable but workflow quality has priority.

## Motion

Only small functional UI transitions. No cinematic effects.

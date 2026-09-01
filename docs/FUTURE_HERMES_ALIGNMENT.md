# Future Hermes Alignment

## Purpose of manual UI first

The operator UI is a reference client. Manual usage reveals the real contracts Hermes must automate:

- required inputs;
- dependency ordering;
- async jobs/polling;
- useful summaries;
- failures;
- evidence;
- API gaps;
- human-judgment points.

## Shared architecture

```text
Operator UI → SiteGen API
Hermes      → SiteGen API
```

The UI must not gain hidden capabilities unavailable through SiteGen.

## Manual action → future agent action

Conceptually:

```text
Create Project       → project_create
Save Artifact        → artifact_write
Initialize Git       → repository_initialize
Checkpoint           → repository_checkpoint
Run Build            → build_run
Run QA               → qa_run
Publish GitHub       → repository_publish
Deploy Preview       → deployment_preview
Run Live QA          → qa_run(target=preview)
```

Exact tool names are future contracts.

## Business workflow

If React begins implementing complex “if X then Y then Z” logic, inspect it. Presentation dependencies are fine; orchestration should ultimately belong to Hermes or SiteGen services.

## Learning backlog

During manual testing, record:

- operations requiring repeated polling;
- unclear dependencies;
- weak errors;
- missing summary fields;
- redundant API calls;
- API gaps;
- actions needing human judgment.

This becomes the Hermes integration backlog.

## MCP

MCP remains future interface adaptation over existing SiteGen services. The UI does not depend on MCP.

## AI keys

The UI needs no AI API key. SiteGen V1 needs no AI API key. Hermes/model provider will own model credentials.

## Long-term UI role

As Hermes autonomy grows, this console can shift from manual controller toward observability, approvals, exceptions, audit, and project inspection.

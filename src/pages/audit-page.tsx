import { PageHeader } from "@/components/feedback/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export function AuditPage() {
  return (
    <div>
      <PageHeader
        title="Audit"
        description="Read-only event history. SiteGen records audit events internally but does not expose a list API yet."
      />
      <EmptyState
        title="Audit listing is unavailable"
        description="GAP-002: there is no GET /api/v1/projects/{id}/audit-events (or equivalent). This UI will not invent events from jobs or local storage."
      />
    </div>
  );
}

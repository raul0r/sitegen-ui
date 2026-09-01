import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { getLastRequestId } from "@/lib/api/client";
import type { Job } from "@/lib/api/types";
import { isTerminalJobStatus } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/status";
import { redactSecrets } from "@/lib/security/redact";

export function JobProgress({
  job,
  requestId,
  onRetry,
  onCancel,
}: {
  job: Job;
  requestId?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}) {
  const correlationId = requestId ?? getLastRequestId();
  const active = !isTerminalJobStatus(job.status);
  const resultEntries = Object.entries(job.result ?? {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  return (
    <div className="rounded-lg border p-3 text-sm" data-testid="job-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium" data-testid="job-operation">
            {job.operation}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground" data-testid="job-id">
            {job.id}
          </p>
        </div>
        <StatusBadge value={job.status} className="job-status" />
      </div>
      {job.message ? (
        <p className="mt-2 text-muted-foreground">{redactSecrets(job.message)}</p>
      ) : null}
      {job.error ? (
        <p className="mt-2 text-destructive" data-testid="job-error">
          {job.error.code}: {redactSecrets(job.error.message)}
        </p>
      ) : null}
      {resultEntries.length > 0 ? (
        <dl className="mt-2 grid gap-1 font-mono text-[11px] text-muted-foreground md:grid-cols-2">
          {resultEntries.map(([key, value]) => (
            <div key={key}>
              <span className="mr-2 uppercase">{key}</span>
              {redactSecrets(typeof value === "string" ? value : JSON.stringify(value))}
            </div>
          ))}
        </dl>
      ) : null}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground md:grid-cols-4">
        <div>Attempt {job.attempt}</div>
        <div>Created {formatDateTime(job.created_at)}</div>
        <div>Started {formatDateTime(job.started_at)}</div>
        <div>Finished {formatDateTime(job.finished_at)}</div>
      </dl>
      {correlationId ? (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground" data-testid="job-request-id">
          Request {correlationId}
        </p>
      ) : null}
      <span className="sr-only" data-testid="job-status">
        {job.status}
      </span>
      <div className="mt-3 flex gap-2">
        {onRetry && job.retryable ? (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
        {onCancel && active ? (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

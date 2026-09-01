import { Button } from "@/components/ui/button";
import { errorCopy } from "@/lib/api/errors";
import { redactSecrets } from "@/lib/security/redact";

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const copy = errorCopy(error);
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1 text-muted-foreground">{redactSecrets(copy.message)}</p>
      <dl className="mt-3 grid gap-1 font-mono text-[11px] text-muted-foreground">
        {copy.code ? (
          <div>
            <span className="mr-2 uppercase">Code</span>
            {copy.code}
          </div>
        ) : null}
        {copy.requestId ? (
          <div>
            <span className="mr-2 uppercase">Request</span>
            {copy.requestId}
          </div>
        ) : null}
      </dl>
      {onRetry && copy.retryable ? (
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : onRetry ? (
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

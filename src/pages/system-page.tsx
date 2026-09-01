import { RefreshCw } from "lucide-react";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCapabilities } from "@/features/capabilities/use-capabilities";
import { capabilityLabel } from "@/lib/format/status";

export function SystemPage() {
  const capabilities = useCapabilities();

  return (
    <div>
      <PageHeader
        title="System / Capabilities"
        description="Live SiteGen runtime, tool, and provider discovery. Values are not hardcoded."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void capabilities.refetch()}
            disabled={capabilities.isFetching}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        }
      />
      {capabilities.isLoading ? <LoadingSkeleton /> : null}
      {capabilities.error ? (
        <ErrorState error={capabilities.error} onRetry={() => void capabilities.refetch()} />
      ) : null}
      {capabilities.data ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>SiteGen API</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <StatusBadge value="available" />
              <p className="mt-2 text-muted-foreground">
                Capability discovery succeeded through the same-origin proxy.
              </p>
            </CardContent>
          </Card>
          {Object.entries(capabilities.data.capabilities).map(([key, capability]) => (
            <Card key={key}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{capabilityLabel(key)}</CardTitle>
                <StatusBadge value={capability.status} />
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Implemented: {capability.implemented ? "yes" : "no"}</p>
                <p>Available: {capability.available ? "yes" : "no"}</p>
                <p>Validated: {capability.validated ? "yes" : "no"}</p>
                {capability.configured != null ? (
                  <p>Configured: {capability.configured ? "yes" : "no"}</p>
                ) : null}
                {capability.reason ? (
                  <p className="font-mono text-[11px]">{capability.reason}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { StatusBadge } from "@/components/status/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobProgress } from "@/features/jobs/job-progress";
import { useJob } from "@/features/jobs/use-job";
import { useProjectSummary } from "@/features/projects/use-projects";
import { sitegen } from "@/lib/api/sitegen";
import type { DeploymentSummary, QaEvidence, QaFinding, QAReport } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/status";
import { queryKeys } from "@/lib/query/keys";
import { looksLikeHostPath } from "@/lib/security/redact";

function countsFrom(report: QAReport | undefined) {
  const counts = (report?.summary as { counts?: Record<string, number> } | undefined)?.counts;
  return {
    blocker: counts?.blocker ?? 0,
    high: counts?.high ?? 0,
    medium: counts?.medium ?? 0,
    low: counts?.low ?? 0,
    optional: counts?.optional ?? 0,
  };
}

export function QaPage() {
  const { projectId = "" } = useParams();
  const queryClient = useQueryClient();
  const summary = useProjectSummary(projectId);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reports = useQuery({
    queryKey: queryKeys.qaReports(projectId),
    queryFn: () => sitegen.listQaReports(projectId),
    enabled: Boolean(projectId),
  });
  const reportsNewestFirst = [...(reports.data ?? [])].sort(
    (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
  );
  const selectedReportId = selectedId ?? reportsNewestFirst[0]?.id;
  const report = useQuery({
    queryKey: selectedReportId
      ? queryKeys.qaReport(projectId, selectedReportId)
      : ["qaReport", "none"],
    queryFn: () => sitegen.getQaReport(projectId, selectedReportId as string),
    enabled: Boolean(selectedReportId),
  });
  const job = useJob(jobId, () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.qaReports(projectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary(projectId) });
  });

  const buildId = (summary.data?.build as { id?: string } | null | undefined)?.id;
  const deployment = summary.data?.deployment as DeploymentSummary | null | undefined;

  const run = useMutation({
    mutationFn: (targetUrl?: string | null) => {
      if (!buildId) throw new Error("A succeeded build is required before QA.");
      return sitegen.runQa(projectId, {
        build_id: buildId,
        routes: ["/"],
        target_url: targetUrl ?? null,
      });
    },
    onSuccess: (queued) => {
      setJobId(queued.job.id);
      toast.message("QA queued");
    },
  });

  const counts = countsFrom(report.data);
  const previewReady = Boolean(
    (report.data?.summary as { preview_ready?: boolean } | undefined)?.preview_ready,
  );
  const lighthouse = (report.data?.metrics as { lighthouse?: Record<string, number> } | undefined)
    ?.lighthouse;
  const browsers = (report.data?.metrics as { browser?: { browsers?: string[] } } | undefined)
    ?.browser?.browsers;
  const routes = (report.data?.summary as { routes_checked?: string[] } | undefined)?.routes_checked;
  const findings = (report.data?.findings ?? []) as QaFinding[];
  const evidence = (report.data?.evidence ?? []) as QaEvidence[];

  const browserResults = useMemo(() => {
    const set = new Set(browsers ?? ["chromium", "firefox", "webkit"]);
    return ["chromium", "firefox", "webkit"].map((name) => ({
      name,
      executed: set.has(name),
    }));
  }, [browsers]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="QA"
        description="SiteGen's QAReport is authoritative. Preview readiness is not recomputed here."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void reports.refetch()}>
              Refresh
            </Button>
            <Button size="sm" disabled={!buildId || run.isPending} onClick={() => run.mutate(null)}>
              Run QA
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!buildId || !deployment?.url || run.isPending}
              onClick={() => run.mutate(deployment?.url)}
            >
              Run Live QA
            </Button>
          </>
        }
      />
      {!buildId ? (
        <p className="text-sm text-muted-foreground">
          Run a build before QA. Live QA also needs a preview URL.
        </p>
      ) : null}
      {run.error ? <ErrorState error={run.error} /> : null}
      {job.data ? (
        <JobProgress
          job={job.data}
          onRetry={() => {
            void sitegen.retryJob(job.data.id).then((queued) => setJobId(queued.id));
          }}
          onCancel={() => {
            void sitegen.cancelJob(job.data.id);
          }}
        />
      ) : null}
      {reports.isLoading ? <LoadingSkeleton /> : null}
      {reports.error ? (
        <ErrorState error={reports.error} onRetry={() => void reports.refetch()} />
      ) : null}
      {reports.data && reports.data.length === 0 ? (
        <EmptyState title="No QA reports" description="Queue QA against the latest successful build." />
      ) : null}

      {report.data ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold" data-testid="preview-ready">
                  {previewReady ? "YES" : "NO"}
                </p>
                <StatusBadge value={report.data.status} />
              </CardContent>
            </Card>
            {Object.entries(counts).map(([key, value]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="capitalize">{key}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">{value}</CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Browsers</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {browserResults.map((item) => (
                <Badge key={item.name} variant={item.executed ? "success" : "muted"}>
                  {item.name} {item.executed ? "executed" : "not executed"}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Routes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 font-mono text-xs">
              {(routes ?? ["/"]).map((route) => (
                <Badge key={route} variant="outline">
                  {route}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lighthouse</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <p>Performance {lighthouse?.performance ?? "—"}</p>
              <p>Accessibility {lighthouse?.accessibility ?? "—"}</p>
              <p>Best Practices {lighthouse?.["best-practices"] ?? "—"}</p>
              <p>SEO {lighthouse?.seo ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No findings.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {findings.map((finding, index) => (
                    <li key={`${finding.code}-${index}`} className="rounded-md border p-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{finding.severity}</Badge>
                        <span className="font-medium">{finding.title || finding.code}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{finding.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs text-muted-foreground">
                Screenshot files are not HTTP-accessible (GAP-007). Metadata only.
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {evidence.slice(0, 24).map((item, index) => (
                  <li key={index} className="rounded-md border p-2 text-xs">
                    <p>
                      {item.browser} {item.viewport} {item.route}
                    </p>
                    <p className="text-muted-foreground">{item.type}</p>
                    {item.path && !looksLikeHostPath(item.path) ? <p>{item.path}</p> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Report {report.data.id} · {formatDateTime(report.data.created_at)}
          </p>
          {reportsNewestFirst.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {reportsNewestFirst.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={item.id === selectedReportId ? "default" : "outline"}
                  onClick={() => setSelectedId(item.id)}
                >
                  {formatDateTime(item.created_at)}
                </Button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

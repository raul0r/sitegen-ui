import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useBlocker, useParams } from "react-router";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sitegen } from "@/lib/api/sitegen";
import type { Artifact } from "@/lib/api/types";
import { languageForPath } from "@/lib/editor/language";
import { formatDateTime } from "@/lib/format/status";
import { queryKeys } from "@/lib/query/keys";
import { readTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ARTIFACT_KINDS = [
  "agents",
  "tasks",
  "start_here",
  "client_context",
  "reference_analysis",
  "site_structure",
  "design_system",
  "asset_plan",
  "image_prompts",
  "website_copy",
  "qa_report",
  "client_handoff",
  "other",
] as const;

function contentTypeForPath(path: string): string {
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".md")) return "text/markdown";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".html") || path.endsWith(".astro")) return "text/html";
  if (path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js")) return "text/plain";
  return "text/plain";
}

export function ArtifactsPage() {
  const { projectId = "" } = useParams();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [createOpen, setCreateOpen] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newKind, setNewKind] = useState<(typeof ARTIFACT_KINDS)[number]>("other");
  const [newContent, setNewContent] = useState("");

  const artifacts = useQuery({
    queryKey: queryKeys.artifacts(projectId),
    queryFn: () => sitegen.listArtifacts(projectId),
    enabled: Boolean(projectId),
  });

  const selected = artifacts.data?.find((item) => item.id === selectedId) ?? artifacts.data?.[0];

  const artifact = useQuery({
    queryKey: selected ? queryKeys.artifact(projectId, selected.id) : ["artifact", "none"],
    queryFn: () => sitegen.readArtifact(projectId, selected!.id),
    enabled: Boolean(selected),
  });

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  useEffect(() => {
    if (artifact.data && artifact.data.id === selected?.id) {
      setDraft(artifact.data.content);
    }
  }, [artifact.data, selected?.id]);

  const dirty = Boolean(artifact.data && draft !== artifact.data.content);
  const blocker = useBlocker(dirty);

  const save = useMutation({
    mutationFn: async () => {
      if (!selected || !artifact.data) {
        throw new Error("No artifact selected.");
      }
      return sitegen.writeArtifact(projectId, {
        kind: selected.kind,
        relative_path: selected.relative_path,
        content: draft,
        content_type: selected.content_type || contentTypeForPath(selected.relative_path),
      });
    },
    onSuccess: async (written) => {
      toast.success("Artifact saved");
      await queryClient.invalidateQueries({ queryKey: queryKeys.artifacts(projectId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.artifact(projectId, written.id),
      });
    },
  });

  const createArtifact = useMutation({
    mutationFn: () =>
      sitegen.writeArtifact(projectId, {
        kind: newKind,
        relative_path: newPath.trim(),
        content: newContent,
        content_type: contentTypeForPath(newPath.trim()),
      }),
    onSuccess: async (written) => {
      toast.success("Artifact written");
      setCreateOpen(false);
      setNewPath("");
      setNewContent("");
      setSelectedId(written.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.artifacts(projectId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.artifact(projectId, written.id),
      });
    },
  });

  function discard() {
    if (artifact.data) setDraft(artifact.data.content);
  }

  async function rescan() {
    await sitegen.rescanArtifacts(projectId);
    toast.success("Rescan requested");
    await queryClient.invalidateQueries({ queryKey: queryKeys.artifacts(projectId) });
  }

  const extensions = useMemo(
    () => languageForPath(selected?.relative_path ?? ""),
    [selected?.relative_path],
  );

  function onCreate(event: FormEvent) {
    event.preventDefault();
    createArtifact.mutate();
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <PageHeader
        title="Artifacts"
        description="Only artifacts SiteGen has authorized. Save writes through the API."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void artifacts.refetch()}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => void rescan()}>
              Rescan
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
              New Artifact
            </Button>
            <Button variant="outline" size="sm" disabled={!dirty} onClick={discard}>
              Discard
            </Button>
            <Button
              size="sm"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate()}
            >
              Save Artifact
            </Button>
          </>
        }
      />
      {artifacts.isLoading ? <LoadingSkeleton /> : null}
      {artifacts.error ? (
        <ErrorState error={artifacts.error} onRetry={() => void artifacts.refetch()} />
      ) : null}
      {save.error ? <ErrorState error={save.error} /> : null}
      {artifacts.data && artifacts.data.length === 0 ? (
        <EmptyState
          title="No artifacts"
          description="Write an artifact through SiteGen, or rescan if files already exist in the workspace."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              New Artifact
            </Button>
          }
        />
      ) : null}
      {artifacts.data && artifacts.data.length > 0 ? (
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[240px_1fr]">
          <aside className="rounded-lg border">
            <ul className="max-h-[70vh] overflow-auto p-1 text-sm">
              {artifacts.data.map((item: Artifact) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-accent",
                      selected?.id === item.id && "bg-accent",
                    )}
                    onClick={() => {
                      if (dirty && !window.confirm("Discard unsaved changes?")) return;
                      setSelectedId(item.id);
                    }}
                  >
                    <span className="truncate font-mono text-xs">{item.relative_path}</span>
                    <span className="text-[11px] text-muted-foreground">{item.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="flex min-w-0 flex-col rounded-lg border">
            {artifact.isLoading ? <LoadingSkeleton /> : null}
            {artifact.error ? (
              <div className="p-3">
                <ErrorState error={artifact.error} onRetry={() => void artifact.refetch()} />
              </div>
            ) : null}
            {artifact.data ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-mono text-foreground" data-testid="artifact-path">
                      {artifact.data.relative_path}
                    </span>
                    {dirty ? (
                      <span className="ml-2 text-warning" data-testid="dirty-indicator">
                        unsaved
                      </span>
                    ) : (
                      <span className="ml-2" data-testid="saved-indicator">
                        saved
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 font-mono">
                    <span>v{artifact.data.version}</span>
                    <span>{artifact.data.checksum.slice(0, 8)}</span>
                    <span>{formatDateTime(artifact.data.updated_at)}</span>
                  </div>
                </div>
                <CodeMirror
                  value={draft}
                  height="60vh"
                  theme={theme === "dark" ? oneDark : "light"}
                  extensions={extensions}
                  onChange={setDraft}
                  basicSetup={{ lineNumbers: true, foldGutter: true }}
                />
              </>
            ) : null}
          </section>
        </div>
      ) : null}
      {blocker.state === "blocked" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-sm rounded-lg border bg-background p-4">
            <p className="font-medium">Unsaved artifact changes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Leave this page and discard the local draft?
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => blocker.reset()}>
                Stay
              </Button>
              <Button size="sm" onClick={() => blocker.proceed()}>
                Discard and leave
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Artifact</DialogTitle>
            <DialogDescription>
              Writes through SiteGen. Paths are workspace-relative and validated by the API.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={onCreate}>
            <div className="space-y-1.5">
              <Label htmlFor="artifact-path">Relative path</Label>
              <Input
                id="artifact-path"
                required
                value={newPath}
                onChange={(event) => setNewPath(event.target.value)}
                placeholder="DESIGN_SYSTEM.md"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artifact-kind">Kind</Label>
              <select
                id="artifact-kind"
                className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                value={newKind}
                onChange={(event) =>
                  setNewKind(event.target.value as (typeof ARTIFACT_KINDS)[number])
                }
              >
                {ARTIFACT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artifact-content">Content</Label>
              <Textarea
                id="artifact-content"
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
              />
            </div>
            {createArtifact.error ? <ErrorState error={createArtifact.error} /> : null}
            <Button type="submit" disabled={!newPath.trim() || createArtifact.isPending}>
              {createArtifact.isPending ? "Writing…" : "Write Artifact"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

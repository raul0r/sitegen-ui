import { Link } from "react-router";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects/use-projects";
import { formatDateTime } from "@/lib/format/status";

export function ProjectsPage() {
  const projects = useProjects();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="SiteGen-owned projects. Refresh reconstructs this list from the API."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void projects.refetch()}>
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link to="/projects/new">Create Project</Link>
            </Button>
          </>
        }
      />
      {projects.isLoading ? <LoadingSkeleton /> : null}
      {projects.error ? (
        <ErrorState error={projects.error} onRetry={() => void projects.refetch()} />
      ) : null}
      {projects.data && projects.data.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Create a project. SiteGen persists it; this UI does not."
          action={
            <Button asChild size="sm">
              <Link to="/projects/new">Create Project</Link>
            </Button>
          }
        />
      ) : null}
      {projects.data && projects.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Target</th>
                <th className="px-3 py-2 font-medium">Branch</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.data.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link className="font-medium hover:underline" to={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{project.slug}</td>
                  <td className="px-3 py-2">
                    <StatusBadge value={project.status} />
                  </td>
                  <td className="px-3 py-2">{project.site_target}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {project.working_branch || project.default_branch}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(project.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

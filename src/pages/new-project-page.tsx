import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/feedback/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/features/projects/use-projects";

export function NewProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [siteTarget, setSiteTarget] = useState("astro");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        slug: slug.trim() ? slug.trim() : null,
        site_target: siteTarget,
      });
      toast.success("Project created");
      void navigate(`/projects/${project.id}`);
    } catch {
      /* rendered below */
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Create Project"
        description="SiteGen persists the project. Empty is the only supported starter until a template API exists."
      />
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="HVAC Demo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="hvac-demo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site_target">Site target</Label>
          <Input
            id="site_target"
            value={siteTarget}
            onChange={(event) => setSiteTarget(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">SiteGen currently defaults to astro.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Empty</CardTitle>
              <CardDescription>Create the project record only. No artifacts are written.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="opacity-70">
            <CardHeader>
              <CardTitle>Gatofeo Level 1</CardTitle>
              <CardDescription>
                Unavailable. SiteGen has no template initialization API (GAP-001).
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {createProject.error ? <ErrorState error={createProject.error} /> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={!name.trim() || createProject.isPending}>
            {createProject.isPending ? "Creating…" : "Create Project"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/projects">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

import { createBrowserRouter, Navigate } from "react-router";

import { AppShell } from "@/components/layout/app-shell";
import { ArtifactsPage } from "@/pages/artifacts-page";
import { AuditPage } from "@/pages/audit-page";
import { BuildsPage } from "@/pages/builds-page";
import { DeploymentsPage } from "@/pages/deployments-page";
import { NewProjectPage } from "@/pages/new-project-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { OverviewPage } from "@/pages/overview-page";
import { ProjectsPage } from "@/pages/projects-page";
import { QaPage } from "@/pages/qa-page";
import { RepositoryPage } from "@/pages/repository-page";
import { SystemPage } from "@/pages/system-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/new", element: <NewProjectPage /> },
      { path: "projects/:projectId", element: <OverviewPage /> },
      { path: "projects/:projectId/artifacts", element: <ArtifactsPage /> },
      { path: "projects/:projectId/repository", element: <RepositoryPage /> },
      { path: "projects/:projectId/builds", element: <BuildsPage /> },
      { path: "projects/:projectId/qa", element: <QaPage /> },
      { path: "projects/:projectId/deployments", element: <DeploymentsPage /> },
      { path: "projects/:projectId/audit", element: <AuditPage /> },
      { path: "system", element: <SystemPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

import {
  FolderGit2,
  Moon,
  PanelsTopLeft,
  Server,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const globalNav = [
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/system", label: "System", icon: Server },
];

function projectNav(projectId: string) {
  return [
    { to: `/projects/${projectId}`, label: "Overview", end: true },
    { to: `/projects/${projectId}/artifacts`, label: "Artifacts" },
    { to: `/projects/${projectId}/repository`, label: "Repository" },
    { to: `/projects/${projectId}/builds`, label: "Builds" },
    { to: `/projects/${projectId}/qa`, label: "QA" },
    { to: `/projects/${projectId}/deployments`, label: "Deployments" },
    { to: `/projects/${projectId}/audit`, label: "Audit" },
  ];
}

export function AppShell() {
  const { projectId } = useParams();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = readTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-12 items-center gap-2 px-4">
          <PanelsTopLeft className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">SiteGen</span>
        </div>
        <Separator />
        <nav className="flex flex-col gap-0.5 p-2">
          {globalNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-accent",
                  isActive && "bg-accent font-medium",
                )
              }
            >
              <item.icon className="size-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {projectId ? (
          <>
            <Separator />
            <p className="px-4 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Project
            </p>
            <nav className="flex flex-col gap-0.5 p-2">
              {projectNav(projectId).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-accent",
                      isActive && "bg-accent font-medium",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </>
        ) : null}
        <div className="mt-auto p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b px-4 md:hidden">
          <span className="text-sm font-semibold">SiteGen</span>
          <div className="flex gap-2">
            {globalNav.map((item) => (
              <NavLink key={item.to} to={item.to} className="text-sm text-muted-foreground">
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

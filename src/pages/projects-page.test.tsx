import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ProjectsPage } from "./projects-page";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProjectsPage", () => {
  it("renders projects from the API", async () => {
    renderPage();
    expect(await screen.findByText("Docker Acceptance Site")).toBeInTheDocument();
    expect(screen.getByText("Create Project")).toBeInTheDocument();
  });
});

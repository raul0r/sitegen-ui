import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { NewProjectPage } from "./new-project-page";

const navigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NewProjectPage", () => {
  it("creates a project through SiteGen and explains the template gap", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText(/GAP-001/)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name"), "Operator UI Slice");
    await user.click(screen.getByRole("button", { name: "Create Project" }));
    await waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
  });
});

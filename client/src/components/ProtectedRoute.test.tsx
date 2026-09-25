import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { api } from "../api/client";

vi.mock("../api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/client")>();
  return { ...actual, api: { ...actual.api, get: vi.fn() } };
});

const mockedApi = vi.mocked(api);

function renderProtected() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin/login" element={<div>Login page</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Secret dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /admin/login when there is no session", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("401"));
    renderProtected();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected content when a session is active", async () => {
    mockedApi.get.mockResolvedValueOnce({ authenticated: true });
    renderProtected();
    expect(await screen.findByText("Secret dashboard")).toBeInTheDocument();
  });
});

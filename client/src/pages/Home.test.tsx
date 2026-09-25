import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Home } from "./Home";
import { DEFAULT_SITE_CONTENT } from "../lib/defaultSiteContent";
import { api, ApiError } from "../api/client";
import type { Project } from "../types";

vi.mock("../api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/client")>();
  return {
    ...actual,
    api: { ...actual.api, get: vi.fn(), post: vi.fn() },
  };
});

const mockedApi = vi.mocked(api);

function mockGet(projects: Project[]) {
  mockedApi.get.mockImplementation((path: string) => {
    if (path === "/projects") return Promise.resolve(projects);
    if (path === "/content") return Promise.resolve(DEFAULT_SITE_CONTENT);
    return Promise.reject(new Error(`Unexpected path: ${path}`));
  });
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

const sampleProject: Project = {
  id: "1",
  title: "Sample Project",
  description: "A sample project description",
  imageUrl: "/images/sample.png",
  link: null,
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Home", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no projects", async () => {
    mockGet([]);
    renderHome();
    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument();
  });

  it("renders projects fetched from the API", async () => {
    mockGet([sampleProject]);
    renderHome();
    expect(await screen.findByText("Sample Project")).toBeInTheDocument();
    expect(screen.getByText("A sample project description")).toBeInTheDocument();
  });

  it("renders site content fetched from the API", async () => {
    mockGet([]);
    renderHome();
    expect(await screen.findByText(DEFAULT_SITE_CONTENT.heroHeading)).toBeInTheDocument();
  });

  it("submits the contact form and shows a success message", async () => {
    mockGet([]);
    mockedApi.post.mockResolvedValueOnce({ id: "msg-1" });
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Your email"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("Your message"), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith("/contact", {
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Hello there",
      }),
    );
    expect(await screen.findByText(/thanks! i'll get back to you soon/i)).toBeInTheDocument();
  });

  it("shows an error message when contact submission fails", async () => {
    mockGet([]);
    mockedApi.post.mockRejectedValueOnce(new ApiError(400, "Invalid email"));
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Your email"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("Your message"), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Invalid email")).toBeInTheDocument();
  });
});

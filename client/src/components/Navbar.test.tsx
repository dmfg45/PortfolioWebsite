import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "./Navbar";

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("hides the mobile menu by default", () => {
    renderNavbar();
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens and closes the mobile menu on toggle", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByTestId("mobile-menu");
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(within(menu).getByRole("link", { name: "Contact" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });

  it("closes the mobile menu after clicking a link", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByTestId("mobile-menu");
    await user.click(within(menu).getByRole("link", { name: "Contact" }));

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});

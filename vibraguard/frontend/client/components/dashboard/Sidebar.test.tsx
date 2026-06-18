import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "./Sidebar";

const mockUseAlerts = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("@/hooks/use-alerts", () => ({
  useAlerts: () => mockUseAlerts(),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    mockUseAlerts.mockReturnValue({ data: [], isLoading: false });
    mockUseAuth.mockReturnValue({
      user: { role: "admin", fullName: "Admin", email: "a@b.com" },
    });
  });

  it("renders the logo", () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText("VibraGuard")).toBeInTheDocument();
  });

  it("renders all navigation items for admin users", () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    expect(screen.getByText("Moteurs")).toBeInTheDocument();
    expect(screen.getByText("Alertes")).toBeInTheDocument();
    expect(screen.getByText("Ordres de Travail")).toBeInTheDocument();
    expect(screen.getByText("Rapports BI")).toBeInTheDocument();
    expect(screen.getByText("Audit Blockchain")).toBeInTheDocument();
    expect(screen.getByText("Paramètres")).toBeInTheDocument();
  });

  it("hides admin-only items for non-admin users", () => {
    mockUseAuth.mockReturnValue({
      user: { role: "user", fullName: "User", email: "u@b.com" },
    });
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.queryByText("Rapports BI")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit Blockchain")).not.toBeInTheDocument();
    expect(screen.getByText("Paramètres")).toBeInTheDocument();
  });

  it("highlights the active route", () => {
    render(<MemoryRouter initialEntries={["/moteurs"]}><Sidebar /></MemoryRouter>);
    const moteursLink = screen.getByText("Moteurs").closest("a");
    expect(moteursLink?.className).toContain("border-l-[3px]");
  });

  it("shows alert badge when alerts are unread", () => {
    mockUseAlerts.mockReturnValue({
      data: [
        { id: "1", status: "Unread", type: "ALERT" },
        { id: "2", status: "Read", type: "ALERT" },
      ],
      isLoading: false,
    });
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    const badgeElements = document.querySelectorAll("span");
    const badge = Array.from(badgeElements).find(el => el.textContent === "1");
    expect(badge).toBeInTheDocument();
  });

  it("calls onToggleCollapse when collapse button is clicked", () => {
    const onToggle = jest.fn();
    render(<MemoryRouter><Sidebar onToggleCollapse={onToggle} /></MemoryRouter>);
    const reduceButton = screen.getByText("Réduire le menu");
    fireEvent.click(reduceButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows tooltip for collapsed state", () => {
    render(<MemoryRouter><Sidebar isCollapsed={true} /></MemoryRouter>);
    expect(screen.queryByText("Réduire le menu")).not.toBeInTheDocument();
  });
});

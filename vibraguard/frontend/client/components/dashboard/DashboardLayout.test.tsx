import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardLayout } from "./DashboardLayout";
import { TestWrapper } from "../../test-utils";

jest.mock("@/hooks/use-alerts", () => ({
  useAlerts: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { fullName: "Test User", role: "admin", email: "a@b.com" },
    logout: jest.fn(),
  })),
}));

describe("DashboardLayout", () => {
  it("renders children", () => {
    render(
      <TestWrapper>
        <DashboardLayout><div>Child Content</div></DashboardLayout>
      </TestWrapper>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders the sidebar nav items", () => {
    render(
      <TestWrapper>
        <DashboardLayout><div>Content</div></DashboardLayout>
      </TestWrapper>
    );
    expect(screen.getByText("Moteurs")).toBeInTheDocument();
  });

  it("renders breadcrumb with default value", () => {
    render(
      <TestWrapper>
        <DashboardLayout><div>Content</div></DashboardLayout>
      </TestWrapper>
    );
    const breadcrumbs = screen.getAllByText("Tableau de bord");
    expect(breadcrumbs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders custom breadcrumb", () => {
    render(
      <TestWrapper>
        <DashboardLayout breadcrumb="Custom Page"><div>Content</div></DashboardLayout>
      </TestWrapper>
    );
    expect(screen.getByText("Custom Page")).toBeInTheDocument();
  });

  it("shows hamburger menu button on mobile", () => {
    render(
      <TestWrapper>
        <DashboardLayout><div>Content</div></DashboardLayout>
      </TestWrapper>
    );
    const menuButton = document.getElementById("menu-button");
    expect(menuButton).toBeInTheDocument();
  });

  it("toggles sidebar when menu button is clicked", () => {
    render(
      <TestWrapper>
        <DashboardLayout><div>Content</div></DashboardLayout>
      </TestWrapper>
    );
    const menuButton = document.getElementById("menu-button")!;
    fireEvent.click(menuButton);
    const sidebar = document.getElementById("mobile-sidebar");
    expect(sidebar?.className).toContain("translate-x-0");
  });
});

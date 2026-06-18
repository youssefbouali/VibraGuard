import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { TestWrapper } from "../test-utils";

jest.mock("@/hooks/use-kpis", () => ({
  useKPIs: jest.fn(() => ({
    data: { totalMotors: 42, criticalMotors: 5, uptime: "98.5%", alerts: 12 },
    isLoading: false,
  })),
}));

jest.mock("@/hooks/use-alerts", () => ({
  useAlerts: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/hooks/use-moteurs", () => ({
  useMoteurs: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/hooks/use-vibrations", () => ({
  useVibrations: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { fullName: "Admin", role: "admin", email: "a@b.com" },
    logout: jest.fn(),
  })),
}));

describe("Dashboard Page", () => {
  it("renders the KPICards section", () => {
    render(<TestWrapper><Dashboard /></TestWrapper>);
    expect(screen.getByText("Moteurs Totaux")).toBeInTheDocument();
    expect(screen.getByText("Moteurs Critiques")).toBeInTheDocument();
    expect(screen.getByText("Disponibilité")).toBeInTheDocument();
    expect(screen.getByText("Alertes Totales")).toBeInTheDocument();
  });

  it("renders the AlertesRecentes section", () => {
    render(<TestWrapper><Dashboard /></TestWrapper>);
    expect(screen.getByText("Alertes Récentes")).toBeInTheDocument();
  });

  it("renders the MoteursTable section", () => {
    render(<TestWrapper><Dashboard /></TestWrapper>);
    expect(screen.getByText("Moteurs Sous Surveillance")).toBeInTheDocument();
  });

  it("renders the sidebar", () => {
    render(<TestWrapper><Dashboard /></TestWrapper>);
    expect(screen.getByText("VibraGuard")).toBeInTheDocument();
  });
});

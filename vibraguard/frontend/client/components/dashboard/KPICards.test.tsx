import React from "react";
import { render, screen } from "@testing-library/react";
import { KPICards } from "./KPICards";
import { TestWrapper } from "../../test-utils";

const mockUseKPIs = jest.fn();
jest.mock("@/hooks/use-kpis", () => ({
  useKPIs: () => mockUseKPIs(),
}));

describe("KPICards", () => {
  beforeEach(() => {
    mockUseKPIs.mockReset();
  });

  it("shows loading state", () => {
    mockUseKPIs.mockReturnValue({ data: undefined, isLoading: true });
    render(<TestWrapper><KPICards /></TestWrapper>);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders all four KPI cards with data", () => {
    mockUseKPIs.mockReturnValue({
      data: {
        totalMotors: 42,
        criticalMotors: 5,
        uptime: "98.5%",
        alerts: 12,
      },
      isLoading: false,
    });
    render(<TestWrapper><KPICards /></TestWrapper>);

    expect(screen.getByText("Moteurs Totaux")).toBeInTheDocument();
    expect(screen.getByText("Moteurs Critiques")).toBeInTheDocument();
    expect(screen.getByText("Disponibilité")).toBeInTheDocument();
    expect(screen.getByText("Alertes Totales")).toBeInTheDocument();

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders empty values when KPI data is undefined", () => {
    mockUseKPIs.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    render(<TestWrapper><KPICards /></TestWrapper>);
    expect(screen.getByText("Moteurs Totaux")).toBeInTheDocument();
    expect(screen.getByText("Moteurs Critiques")).toBeInTheDocument();
    expect(screen.getByText("Disponibilité")).toBeInTheDocument();
    expect(screen.getByText("Alertes Totales")).toBeInTheDocument();
  });
});

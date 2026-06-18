import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AlertesRecentes } from "./AlertesRecentes";
import { TestWrapper } from "../../test-utils";

const mockUseAlerts = jest.fn();
jest.mock("@/hooks/use-alerts", () => ({
  useAlerts: () => mockUseAlerts(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("AlertesRecentes", () => {
  beforeEach(() => {
    mockUseAlerts.mockReset();
    mockNavigate.mockReset();
  });

  it("shows loading state", () => {
    mockUseAlerts.mockReturnValue({ data: undefined, isLoading: true });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    expect(screen.getByText("Chargement des alertes...")).toBeInTheDocument();
  });

  it("renders section title", () => {
    mockUseAlerts.mockReturnValue({ data: [], isLoading: false });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    expect(screen.getByText("Alertes Récentes")).toBeInTheDocument();
  });

  it("renders alerts from data", () => {
    mockUseAlerts.mockReturnValue({
      data: [
        {
          id: "ALT-001",
          title: "Moteur Principal",
          motorId: "MOT-001",
          time: "2026-06-18T10:30:00",
          description: "Vibration élevée détectée",
          priority: "high",
          message: "Anomalie sur MOT-001",
          level: "Critique",
          status: "Unread",
        },
        {
          id: "ALT-002",
          title: "Moteur Secondaire",
          motorId: "MOT-002",
          time: "2026-06-18T09:15:00",
          description: "Température anormale",
          priority: "medium",
          message: "Alerte sur MOT-002",
          level: "Alerte",
          status: "Read",
        },
      ],
      isLoading: false,
    });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    expect(screen.getByText("Moteur Principal")).toBeInTheDocument();
    expect(screen.getByText("Moteur Secondaire")).toBeInTheDocument();
  });

  it("limits to 5 alerts", () => {
    const manyAlerts = Array.from({ length: 7 }, (_, i) => ({
      id: `ALT-${i}`,
      title: `Alerte ${i}`,
      motorId: `MOT-${i}`,
      time: "2026-06-18T10:00:00",
      description: `Description ${i}`,
      priority: "low",
      message: `Message ${i}`,
      level: "Info",
      status: "Unread",
    }));
    mockUseAlerts.mockReturnValue({ data: manyAlerts, isLoading: false });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    expect(screen.getByText("Alerte 0")).toBeInTheDocument();
    expect(screen.getByText("Alerte 4")).toBeInTheDocument();
    expect(screen.queryByText("Alerte 5")).not.toBeInTheDocument();
  });

  it("navigates to motor detail when alert is clicked", () => {
    mockUseAlerts.mockReturnValue({
      data: [
        {
          id: "ALT-001",
          title: "Moteur Principal",
          motorId: "MOT-001",
          time: "2026-06-18T10:30:00",
          description: "Vibration élevée",
          priority: "high",
          message: "Anomalie sur MOT-001",
          level: "Critique",
          status: "Unread",
        },
      ],
      isLoading: false,
    });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    fireEvent.click(screen.getByText("Moteur Principal"));
    expect(mockNavigate).toHaveBeenCalledWith("/moteurs/MOT-001");
  });

  it('has a "Historique" link to /alertes', () => {
    mockUseAlerts.mockReturnValue({ data: [], isLoading: false });
    render(<TestWrapper><AlertesRecentes /></TestWrapper>);
    const historique = screen.getByText("Historique");
    expect(historique.closest("a")).toHaveAttribute("href", "/alertes");
  });
});

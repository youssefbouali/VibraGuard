import React from "react";
import { render, screen } from "@testing-library/react";
import { DernieresAlertes } from "./DernieresAlertes";

jest.mock("@/lib/utils", () => ({
  formatTime: () => "10:30:00",
}));

describe("DernieresAlertes", () => {
  it("renders title and voir tout button", () => {
    render(<DernieresAlertes alerts={[]} />);
    expect(screen.getByText("Dernières Alertes")).toBeInTheDocument();
    expect(screen.getByText("Voir tout")).toBeInTheDocument();
  });

  it("shows empty state when no alerts", () => {
    render(<DernieresAlertes alerts={[]} />);
    expect(screen.getByText("Aucune alerte récente")).toBeInTheDocument();
  });

  it("renders alert items", () => {
    const alerts = [
      { id: "ALT-001", message: "Vibration élevée", level: "Critique", time: "2026-06-18T10:30:00", color: "#EF4444", type: "ALERT" },
      { id: "ALT-002", message: "Température anormale", level: "Attention", time: "2026-06-18T09:15:00", color: "#F59E0B", type: "ALERT" },
    ];
    render(<DernieresAlertes alerts={alerts} />);
    expect(screen.getByText("Vibration élevée")).toBeInTheDocument();
    expect(screen.getByText("Température anormale")).toBeInTheDocument();
  });

  it("filters out non-ALERT type alerts", () => {
    const alerts = [
      { id: "ALT-001", message: "Vibration élevée", level: "Critique", time: "2026-06-18T10:30:00", color: "#EF4444", type: "ALERT" },
      { id: "ALT-002", message: "Info only", level: "Info", time: "2026-06-18T09:15:00", color: "#C9EDEB", type: "INFO" },
    ];
    render(<DernieresAlertes alerts={alerts} />);
    expect(screen.getByText("Vibration élevée")).toBeInTheDocument();
    expect(screen.queryByText("Info only")).not.toBeInTheDocument();
  });

  it("renders anomaly type with message", () => {
    const alerts = [
      { id: "ALT-001", message: "Vibration élevée", anomalyType: "Mécanique", level: "Critique", time: "2026-06-18T10:30:00", color: "#EF4444", type: "ALERT" },
    ];
    render(<DernieresAlertes alerts={alerts} />);
    expect(screen.getByText("Mécanique - Vibration élevée")).toBeInTheDocument();
  });

  it("renders alert with critique level icon", () => {
    const alerts = [
      { id: "ALT-001", message: "Critical failure", level: "Critique", time: "2026-06-18T10:30:00", color: "#EF4444", type: "ALERT" },
    ];
    render(<DernieresAlertes alerts={alerts} />);
    expect(screen.getByText("Critical failure")).toBeInTheDocument();
  });
});

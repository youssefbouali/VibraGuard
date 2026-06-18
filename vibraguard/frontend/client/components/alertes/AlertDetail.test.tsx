import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertDetail } from "./AlertDetail";
import { Alerte } from "./AlertesTable";

const mockAlerte: Alerte = {
  id: "ALT-001",
  moteur: "MOT-01",
  typeDefaut: "Balourd",
  severite: "Critique",
  confiance: 92,
  dateHeure: "2026-06-18 14:30",
  statut: "Nouveau",
  velociteRms: 12.5,
  accelerationPeak: 8.3,
  temperature: 78,
  scoreConfianceIA: 94,
  depassementSeuil: 35,
};

const mockAlertePartial: Alerte = {
  id: "ALT-002",
  moteur: "MOT-02",
  typeDefaut: "Désalignement",
  severite: "Majeur",
  confiance: 65,
  dateHeure: "2026-06-18 12:00",
  statut: "En cours",
};

describe("AlertDetail", () => {
  it("renders alert ID and type defaut", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("ALT-001")).toBeInTheDocument();
    expect(screen.getByText("Balourd")).toBeInTheDocument();
  });

  it("renders moteur name with location", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("MOT-01 (Zone 2)")).toBeInTheDocument();
  });

  it("renders vibration analysis section", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Analyse Vibratoire (Temps Réel)")).toBeInTheDocument();
  });

  it("renders depassement seuil badge when provided", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Dépassement Seuil: +35%")).toBeInTheDocument();
  });

  it("renders key metrics section with values", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Métriques Clés")).toBeInTheDocument();
    expect(screen.getByText("12.5 mm/s")).toBeInTheDocument();
    expect(screen.getByText("8.3 mm/s")).toBeInTheDocument();
    expect(screen.getByText("78 °C")).toBeInTheDocument();
    expect(screen.getByText("94 %")).toBeInTheDocument();
  });

  it("renders N/A for missing metrics", () => {
    render(
      <AlertDetail
        alerte={mockAlertePartial}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(2);
  });

  it("renders AI recommendation section", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Recommandation IA")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Escalader au Chef d'Équipe")).toBeInTheDocument();
    expect(screen.getByText("Acquitter l'Alerte")).toBeInTheDocument();
  });

  it("calls onEscalader when escalader button is clicked", () => {
    const onEscalader = jest.fn();
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={onEscalader}
      />
    );
    fireEvent.click(screen.getByText("Escalader au Chef d'Équipe"));
    expect(onEscalader).toHaveBeenCalledWith("ALT-001");
  });

  it("calls onAcquitter when acquitter button is clicked", () => {
    const onAcquitter = jest.fn();
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={jest.fn()}
        onAcquitter={onAcquitter}
        onEscalader={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Acquitter l'Alerte"));
    expect(onAcquitter).toHaveBeenCalledWith("ALT-001");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <AlertDetail
        alerte={mockAlerte}
        onClose={onClose}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});

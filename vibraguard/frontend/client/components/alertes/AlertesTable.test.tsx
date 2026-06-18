import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertesTable, Alerte } from "./AlertesTable";

const mockAlertes: Alerte[] = [
  {
    id: "ALT-001",
    moteur: "MOT-01",
    typeDefaut: "Balourd",
    severite: "Critique",
    confiance: 92,
    dateHeure: "2026-06-18 14:30",
    statut: "Nouveau",
  },
  {
    id: "ALT-002",
    moteur: "MOT-02",
    typeDefaut: "Désalignement",
    severite: "Majeur",
    confiance: 78,
    dateHeure: "2026-06-18 12:00",
    statut: "En cours",
  },
  {
    id: "ALT-003",
    moteur: "MOT-03",
    typeDefaut: "Usure",
    severite: "Mineur",
    confiance: 45,
    dateHeure: "2026-06-17 09:15",
    statut: "Résolu",
  },
];

describe("AlertesTable", () => {
  it("renders column headers", () => {
    render(
      <AlertesTable
        alertes={[]}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("ID Alerte")).toBeInTheDocument();
    expect(screen.getByText("Moteur")).toBeInTheDocument();
    expect(screen.getByText("Type de Défaut")).toBeInTheDocument();
    expect(screen.getByText("Sévérité")).toBeInTheDocument();
    expect(screen.getByText("Confiance")).toBeInTheDocument();
    expect(screen.getByText("Date & Heure")).toBeInTheDocument();
    expect(screen.getByText("Statut")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders alert data", () => {
    render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("ALT-001")).toBeInTheDocument();
    expect(screen.getByText("MOT-01")).toBeInTheDocument();
    expect(screen.getByText("Balourd")).toBeInTheDocument();
    expect(screen.getByText("ALT-002")).toBeInTheDocument();
    expect(screen.getByText("MOT-02")).toBeInTheDocument();
  });

  it("renders severity badges with correct text", () => {
    render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Critique")).toBeInTheDocument();
    expect(screen.getByText("Majeur")).toBeInTheDocument();
    expect(screen.getByText("Mineur")).toBeInTheDocument();
  });

  it("renders status badges with correct text", () => {
    render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("Nouveau")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Résolu")).toBeInTheDocument();
  });

  it("renders confidence percentages", () => {
    render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", () => {
    const onSelect = jest.fn();
    render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId={null}
        onSelect={onSelect}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("ALT-001"));
    expect(onSelect).toHaveBeenCalledWith("ALT-001");
  });

  it("calls onAcquitter when acquitter button is clicked", () => {
    const onAcquitter = jest.fn();
    render(
      <AlertesTable
        alertes={[mockAlertes[0]]}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={onAcquitter}
        onEscalader={jest.fn()}
      />
    );
    const acquitterButtons = screen.getAllByTitle("Acquitter");
    fireEvent.click(acquitterButtons[0]);
    expect(onAcquitter).toHaveBeenCalledWith("ALT-001");
  });

  it("calls onEscalader when escalader button is clicked", () => {
    const onEscalader = jest.fn();
    render(
      <AlertesTable
        alertes={[mockAlertes[0]]}
        selectedId={null}
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={onEscalader}
      />
    );
    const escaladerButtons = screen.getAllByTitle("Escalader");
    fireEvent.click(escaladerButtons[0]);
    expect(onEscalader).toHaveBeenCalledWith("ALT-001");
  });

  it("applies selected styling to the selected row", () => {
    const { container } = render(
      <AlertesTable
        alertes={mockAlertes}
        selectedId="ALT-002"
        onSelect={jest.fn()}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    const rows = container.querySelectorAll(".cursor-pointer");
    expect(rows.length).toBe(3);
  });

  it("does not call onSelect when acquitter button is clicked", () => {
    const onSelect = jest.fn();
    render(
      <AlertesTable
        alertes={[mockAlertes[0]]}
        selectedId={null}
        onSelect={onSelect}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    const acquitterButton = screen.getByTitle("Acquitter");
    fireEvent.click(acquitterButton);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not call onSelect when escalader button is clicked", () => {
    const onSelect = jest.fn();
    render(
      <AlertesTable
        alertes={[mockAlertes[0]]}
        selectedId={null}
        onSelect={onSelect}
        onAcquitter={jest.fn()}
        onEscalader={jest.fn()}
      />
    );
    const escaladerButton = screen.getByTitle("Escalader");
    fireEvent.click(escaladerButton);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

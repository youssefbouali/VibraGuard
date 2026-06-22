import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MoteursTable } from "./MoteursTable";

const mockUseMoteurs = jest.fn();
jest.mock("@/hooks/use-moteurs", () => ({
  useMoteurs: () => mockUseMoteurs(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("MoteursTable", () => {
  beforeEach(() => {
    mockUseMoteurs.mockReset();
    mockNavigate.mockReset();
  });

  it("shows loading state", () => {
    mockUseMoteurs.mockReturnValue({ data: undefined, isLoading: true });
    render(<MemoryRouter><MoteursTable /></MemoryRouter>);
    expect(screen.getByText("Chargement des données...")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    mockUseMoteurs.mockReturnValue({ data: [], isLoading: false });
    render(<MemoryRouter><MoteursTable /></MemoryRouter>);
    expect(screen.getByText("Moteur")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("État Santé")).toBeInTheDocument();
    expect(screen.getByText("Vibration Initiale")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders motor rows", () => {
    mockUseMoteurs.mockReturnValue({
      data: [
        {
          id: "MOT-001",
          type: "Asynchrone",
          etatLabel: "80% Normal",
          etatPct: 80,
          etatColor: "#10B981",
          vibration: "2.34 mm/s",
          vibrationColor: "#10B981",
          trendIcon: "up",
        },
        {
          id: "MOT-002",
          type: "Synchrone",
          etatLabel: "45% Critique",
          etatPct: 45,
          etatColor: "#EF4444",
          vibration: "8.91 mm/s",
          vibrationColor: "#EF4444",
          trendIcon: "down",
        },
      ],
      isLoading: false,
    });
    render(<MemoryRouter><MoteursTable /></MemoryRouter>);
    expect(screen.getByText("MOT-001")).toBeInTheDocument();
    expect(screen.getByText("MOT-002")).toBeInTheDocument();
    expect(screen.getByText("Asynchrone")).toBeInTheDocument();
    expect(screen.getByText("Synchrone")).toBeInTheDocument();
  });

  it("navigates to motor detail when id is clicked", () => {
    mockUseMoteurs.mockReturnValue({
      data: [
        {
          id: "MOT-001",
          type: "Asynchrone",
          etatLabel: "80% Normal",
          etatPct: 80,
          etatColor: "#10B981",
          vibration: "2.34 mm/s",
          vibrationColor: "#10B981",
          trendIcon: "up",
        },
      ],
      isLoading: false,
    });
    render(<MemoryRouter><MoteursTable /></MemoryRouter>);
    fireEvent.click(screen.getByText("MOT-001"));
    expect(mockNavigate).toHaveBeenCalledWith("/moteurs/MOT-001");
  });

  it('has a "Voir tout" link to /moteurs', () => {
    mockUseMoteurs.mockReturnValue({ data: [], isLoading: false });
    render(<MemoryRouter><MoteursTable /></MemoryRouter>);
    const voirTout = screen.getByText("Voir tout");
    expect(voirTout.closest("a")).toHaveAttribute("href", "/moteurs");
  });
});

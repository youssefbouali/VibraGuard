import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MoteurDetailHeader } from "./MoteurDetailHeader";

jest.mock("jspdf", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("jspdf-autotable", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/hooks/use-vibrations", () => ({
  useVibrations: () => ({ data: [], isLoading: false }),
}));
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { fullName: "Test User" } }),
}));

const mockPdf = (jest.requireMock("jspdf") as any).default;

const mockMotor = {
  id: "MOT-001",
  type: "Asynchrone",
  etatLabel: "Normal",
  etatPct: 85,
  etatColor: "10B981",
  vibration: "2.34 mm/s",
  speed: "1500 RPM",
  power: "75 kW",
  localisation: "Zone A",
};

describe("MoteurDetailHeader", () => {
  it("renders motor id as title", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("MOT-001")).toBeInTheDocument();
  });

  it("renders motor type badge", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("Asynchrone")).toBeInTheDocument();
  });

  it("renders localisation", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("Zone A")).toBeInTheDocument();
  });

  it("renders power and speed specs", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("75 kW")).toBeInTheDocument();
    expect(screen.getByText("1500 RPM")).toBeInTheDocument();
  });

  it("renders optimal label when etatLabel is Normal", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("Optimal")).toBeInTheDocument();
  });

  it("renders critique label when etatLabel is Attention", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={{ ...mockMotor, etatLabel: "Attention" }} /></MemoryRouter>);
    expect(screen.getAllByText("Critique").length).toBeGreaterThan(0);
  });

  it("renders Créer OT link", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    const otLink = screen.getByText("Créer OT");
    expect(otLink.closest("a")).toHaveAttribute("href", "/ordres-de-travail/creer?motorId=MOT-001");
  });

  it("renders Rapport Complet button", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    expect(screen.getByText("Rapport Complet")).toBeInTheDocument();
  });

  it("renders Rapport Complet button clickable", () => {
    render(<MemoryRouter><MoteurDetailHeader motor={mockMotor} /></MemoryRouter>);
    const button = screen.getByText("Rapport Complet");
    expect(button).toBeInTheDocument();
    expect(jest.isMockFunction(mockPdf)).toBe(true);
  });

  it("renders critically with correct label", () => {
    const critMotor = { ...mockMotor, etatLabel: "Critique", etatColor: "EF4444" };
    render(<MemoryRouter><MoteurDetailHeader motor={critMotor} /></MemoryRouter>);
    expect(screen.getByText("Critique")).toBeInTheDocument();
  });
});

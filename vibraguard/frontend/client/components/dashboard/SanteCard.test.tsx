import React from "react";
import { render, screen } from "@testing-library/react";
import { SanteCard } from "./SanteCard";

describe("SanteCard", () => {
  it("renders title", () => {
    render(<SanteCard motor={{ id: "MOT-001", etatPct: 85, etatColor: "10B981", etatLabel: "Normal" }} />);
    expect(screen.getByText("Santé Globale")).toBeInTheDocument();
  });

  it("renders health percentage", () => {
    render(<SanteCard motor={{ id: "MOT-001", etatPct: 85, etatColor: "10B981", etatLabel: "Normal" }} />);
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("renders optimal label when etatLabel is Normal", () => {
    render(<SanteCard motor={{ id: "MOT-001", etatPct: 85, etatColor: "10B981", etatLabel: "Normal" }} />);
    expect(screen.getByText("Optimal")).toBeInTheDocument();
  });

  it("renders alerte label when etatLabel is Attention", () => {
    render(<SanteCard motor={{ id: "MOT-001", etatPct: 60, etatColor: "F59E0B", etatLabel: "Attention" }} />);
    expect(screen.getByText("Alerte")).toBeInTheDocument();
  });

  it("renders critical label when etatLabel is Critique", () => {
    render(<SanteCard motor={{ id: "MOT-001", etatPct: 30, etatColor: "EF4444", etatLabel: "Critique" }} />);
    expect(screen.getByText("Critique")).toBeInTheDocument();
  });

  it("renders health percentage at different values", () => {
    render(<SanteCard motor={{ id: "MOT-002", etatPct: 45, etatColor: "EF4444", etatLabel: "Critique" }} />);
    expect(screen.getByText("45")).toBeInTheDocument();
  });
});

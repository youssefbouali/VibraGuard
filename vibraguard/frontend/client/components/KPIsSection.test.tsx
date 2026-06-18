import React from "react";
import { render, screen } from "@testing-library/react";
import KPIsSection from "./KPIsSection";

describe("KPIsSection", () => {
  it("renders all three KPI values", () => {
    render(<KPIsSection />);
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("+20%")).toBeInTheDocument();
    expect(screen.getByText("3.5x")).toBeInTheDocument();
  });

  it("renders KPI titles", () => {
    render(<KPIsSection />);
    expect(screen.getByText("Réduction des pannes inattendues")).toBeInTheDocument();
    expect(screen.getByText("Amélioration de la disponibilité")).toBeInTheDocument();
    expect(screen.getByText("ROI sur la maintenance")).toBeInTheDocument();
  });

  it("renders KPI descriptions", () => {
    render(<KPIsSection />);
    expect(screen.getByText(/Passez d'une maintenance réactive/)).toBeInTheDocument();
    expect(screen.getByText(/Maximisez le temps de fonctionnement/)).toBeInTheDocument();
    expect(screen.getByText(/Retour sur investissement moyen/)).toBeInTheDocument();
  });
});

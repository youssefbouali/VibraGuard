import React from "react";
import { render, screen } from "@testing-library/react";
import FeaturesSection from "./FeaturesSection";

describe("FeaturesSection", () => {
  it("renders section heading", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("La puissance de l'Intelligence Artificielle")).toBeInTheDocument();
  });

  it("renders section description", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Découvrez comment VibraGuard/)).toBeInTheDocument();
  });

  it("renders all feature cards", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("Surveillance temps réel")).toBeInTheDocument();
    expect(screen.getByText("Alertes intelligentes")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Collectez et visualisez/)).toBeInTheDocument();
    expect(screen.getByText(/Système de notification avec escalade/)).toBeInTheDocument();
  });
});

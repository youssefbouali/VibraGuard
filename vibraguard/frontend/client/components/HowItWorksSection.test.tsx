import React from "react";
import { render, screen } from "@testing-library/react";
import HowItWorksSection from "./HowItWorksSection";

describe("HowItWorksSection", () => {
  it("renders heading", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("Comment ça marche ?")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText(/Un flux de données continu/)).toBeInTheDocument();
  });

  it("renders all four steps", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("1. Capteurs")).toBeInTheDocument();
    expect(screen.getByText("2. Data")).toBeInTheDocument();
    expect(screen.getByText("3. IA")).toBeInTheDocument();
    expect(screen.getByText("4. Décision")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("Acquisition IoT haute fréquence")).toBeInTheDocument();
    expect(screen.getByText("Stockage cloud sécurisé")).toBeInTheDocument();
    expect(screen.getByText("Détection d'anomalies")).toBeInTheDocument();
    expect(screen.getByText("Création OT & Intervention")).toBeInTheDocument();
  });
});

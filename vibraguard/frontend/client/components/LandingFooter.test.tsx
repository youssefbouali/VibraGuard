import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingFooter from "./LandingFooter";

describe("LandingFooter", () => {
  it("renders brand name", () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);
    expect(screen.getByText(/VibraGuard/)).toBeInTheDocument();
  });

  it("renders footer description", () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);
    expect(screen.getByText(/La solution de référence/)).toBeInTheDocument();
  });

  it("renders link categories", () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);
    expect(screen.getByText("Produit")).toBeInTheDocument();
    expect(screen.getByText("Ressources")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders product links", () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);
    expect(screen.getByText("Fonctionnalités")).toBeInTheDocument();
    expect(screen.getByText("Tarifs")).toBeInTheDocument();
    expect(screen.getByText("Cas d'usage")).toBeInTheDocument();
  });

  it("renders copyright", () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);
    expect(screen.getByText(/© 2026 OCP Group/)).toBeInTheDocument();
  });
});

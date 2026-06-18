import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  it("renders the badge text", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    expect(screen.getByText("Nouveau : IA Prédictive V2.0")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    expect(screen.getByText("Surveillez vos moteurs industriels en temps réel grâce à l'IA")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    expect(screen.getByText(/La plateforme de maintenance prédictive ultime/)).toBeInTheDocument();
  });

  it("renders CTA link to /login", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    const cta = screen.getByText("Commencer");
    expect(cta.closest("a")).toHaveAttribute("href", "/login");
  });

  it("renders the motor image", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    const img = screen.getByAltText("VibraGuard AI Motor");
    expect(img).toBeInTheDocument();
  });

  it("renders health stat card", () => {
    render(<MemoryRouter><HeroSection /></MemoryRouter>);
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("État de santé")).toBeInTheDocument();
  });
});

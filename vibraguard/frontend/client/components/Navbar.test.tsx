import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders the logo with VibraGuard text", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByText("VibraGuard")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Fonctionnalités")).toBeInTheDocument();
    expect(screen.getByText("Solutions")).toBeInTheDocument();
    expect(screen.getByText("À propos")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
    expect(screen.getByText("Commencer")).toBeInTheDocument();
  });

  it("has CTA links to /login", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const loginLinks = screen.getAllByRole("link", { name: /se connecter|Commencer/i });
    loginLinks.forEach(link => {
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  it("has the logo link to home page", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const logoLink = screen.getByText("VibraGuard").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });
});

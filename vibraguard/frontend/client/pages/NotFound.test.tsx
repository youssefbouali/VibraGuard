import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

describe("NotFound", () => {
  it("renders 404 text", () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it('renders "Page non trouvée" heading', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText("Page non trouvée")).toBeInTheDocument();
  });

  it("renders a link back to dashboard", () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    const dashboardLink = screen.getByText("Retour au Dashboard");
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the VibraGuard logo in header", () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText("VibraGuard")).toBeInTheDocument();
  });

  it("renders copyright footer", () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText(/Tous droits réservés/)).toBeInTheDocument();
  });
});

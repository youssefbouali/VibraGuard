import React from "react";
import { render, screen } from "@testing-library/react";
import { CartographieSante } from "./CartographieSante";
import { TestWrapper } from "../../test-utils";

const mockUseMoteurs = jest.fn();
jest.mock("@/hooks/use-moteurs", () => ({
  useMoteurs: () => mockUseMoteurs(),
}));

describe("CartographieSante", () => {
  beforeEach(() => {
    mockUseMoteurs.mockReset();
  });

  it("shows loading state", () => {
    mockUseMoteurs.mockReturnValue({ data: undefined, isLoading: true });
    render(<TestWrapper><CartographieSante /></TestWrapper>);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders title and link", () => {
    mockUseMoteurs.mockReturnValue({ data: [], isLoading: false });
    render(<TestWrapper><CartographieSante /></TestWrapper>);
    expect(screen.getByText("Cartographie Santé")).toBeInTheDocument();
    const vueListe = screen.getByText("Vue liste");
    expect(vueListe.closest("a")).toHaveAttribute("href", "/moteurs");
  });

  it("renders motors with ok status", () => {
    mockUseMoteurs.mockReturnValue({
      data: [
        { id: "MOT-001", type: "Asynchrone", etatLabel: "Normal", vibration: "2.34" },
        { id: "MOT-002", type: "Synchrone", etatLabel: "Normal", vibration: "1.12" },
      ],
      isLoading: false,
    });
    render(<TestWrapper><CartographieSante /></TestWrapper>);
    expect(screen.getByText("MOT-001")).toBeInTheDocument();
    expect(screen.getByText("MOT-002")).toBeInTheDocument();
  });

  it("renders motors with critical status", () => {
    mockUseMoteurs.mockReturnValue({
      data: [
        { id: "MOT-001", type: "Asynchrone", etatLabel: "Critique", vibration: "8.91" },
      ],
      isLoading: false,
    });
    render(<TestWrapper><CartographieSante /></TestWrapper>);
    expect(screen.getByText("MOT-001")).toBeInTheDocument();
  });

  it("renders motors with warning status", () => {
    mockUseMoteurs.mockReturnValue({
      data: [
        { id: "MOT-001", type: "Asynchrone", etatLabel: "Attention", vibration: "5.0" },
        { id: "MOT-002", type: "Synchrone", etatLabel: "Alerte", vibration: "6.1" },
      ],
      isLoading: false,
    });
    render(<TestWrapper><CartographieSante /></TestWrapper>);
    expect(screen.getByText("MOT-001")).toBeInTheDocument();
    expect(screen.getByText("MOT-002")).toBeInTheDocument();
  });
});

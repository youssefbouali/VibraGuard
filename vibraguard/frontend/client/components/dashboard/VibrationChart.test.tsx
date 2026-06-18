import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VibrationChart } from "./VibrationChart";

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children }: any) => <div data-testid="select-item">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

const mockUseMoteurs = jest.fn();
jest.mock("@/hooks/use-moteurs", () => ({
  useMoteurs: () => mockUseMoteurs(),
}));

const mockUseVibrations = jest.fn();
jest.mock("@/hooks/use-vibrations", () => ({
  useVibrations: () => mockUseVibrations(),
}));

jest.mock("@/lib/utils", () => ({
  formatTime: () => "10:30:00",
}));

const sampleMoteurs = [
  { id: "MOT-001", type: "Asynchrone" },
  { id: "MOT-002", type: "Synchrone" },
];

const sampleVibrations = [
  { time: "2026-06-18T10:30:00", vibRms: 2.34, vibPeak: 5.67, vibKurtosis: 3.12, temperature: 75, currentRms: 45.2 },
  { time: "2026-06-18T10:35:00", vibRms: 2.45, vibPeak: 5.89, vibKurtosis: 3.45, temperature: 76, currentRms: 46.1 },
];

describe("VibrationChart", () => {
  beforeEach(() => {
    mockUseMoteurs.mockReset();
    mockUseVibrations.mockReset();
  });

  it("shows loading state", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: undefined, isLoading: true });
    render(<VibrationChart />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders title with metric name", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: sampleVibrations, isLoading: false });
    render(<VibrationChart />);
    expect(screen.getByText(/Analyse Vibration RMS/)).toBeInTheDocument();
  });

  it("renders metric select placeholder", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: sampleVibrations, isLoading: false });
    render(<VibrationChart />);
    expect(screen.getByText("Métrique")).toBeInTheDocument();
  });

  it("renders motor select placeholder", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: sampleVibrations, isLoading: false });
    render(<VibrationChart />);
    expect(screen.getByText("Moteur")).toBeInTheDocument();
  });

  it("renders legend with last value", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: sampleVibrations, isLoading: false });
    render(<VibrationChart />);
    expect(screen.getByText(/2.45 mm\/s/)).toBeInTheDocument();
  });

  it("handles empty vibrations data", () => {
    mockUseMoteurs.mockReturnValue({ data: sampleMoteurs, isLoading: false });
    mockUseVibrations.mockReturnValue({ data: [], isLoading: false });
    render(<VibrationChart />);
    const legends = screen.getAllByText(/0 mm\/s/);
    expect(legends.length).toBeGreaterThan(0);
  });

  it("handles single moteur and no initial selection", () => {
    mockUseMoteurs.mockReturnValue({ data: [{ id: "MOT-001", type: "Asynchrone" }], isLoading: false });
    mockUseVibrations.mockReturnValue({ data: sampleVibrations, isLoading: false });
    render(<VibrationChart />);
    expect(screen.getByText(/Analyse Vibration RMS/)).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TendanceVibratoire } from "./TendanceVibratoire";

jest.mock("@/lib/utils", () => ({
  formatTime: () => "10:30:00",
}));

const sampleVibrations = [
  { time: "2026-06-18T10:30:00", vibRms: 2.34, vibPeak: 5.67, vibKurtosis: 3.12, temperature: 75, currentRms: 45.2 },
  { time: "2026-06-18T10:35:00", vibRms: 2.45, vibPeak: 5.89, vibKurtosis: 3.45, temperature: 76, currentRms: 46.1 },
  { time: "2026-06-18T10:40:00", vibRms: 2.67, vibPeak: 6.12, vibKurtosis: 3.78, temperature: 77, currentRms: 47.0 },
];

describe("TendanceVibratoire", () => {
  it("renders title", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    expect(screen.getByText(/Analyse RMS/)).toBeInTheDocument();
  });

  it("renders metric selector buttons", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    expect(screen.getByText("RMS")).toBeInTheDocument();
    expect(screen.getByText("Peak")).toBeInTheDocument();
    expect(screen.getByText("Kurtosis")).toBeInTheDocument();
    expect(screen.getByText("Temp")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders last value text", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    expect(screen.getByText(/Dernière valeur/)).toBeInTheDocument();
  });

  it("renders last value for RMS metric by default", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    expect(screen.getByText("2.67 mm/s")).toBeInTheDocument();
  });

  it("switches metric when a different tab is clicked", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    fireEvent.click(screen.getByText("Temp"));
    expect(screen.getByText(/Analyse Temp/)).toBeInTheDocument();
  });

  it("shows 0.00 when vibrations array is empty", () => {
    render(<TendanceVibratoire vibrations={[]} />);
    expect(screen.getByText("0.00 mm/s")).toBeInTheDocument();
  });

  it("handles undefined vibrations prop gracefully", () => {
    render(<TendanceVibratoire />);
    expect(screen.getByText("0.00 mm/s")).toBeInTheDocument();
  });

  it("renders anomalous points", () => {
    const vibs = [
      { time: "2026-06-18T10:30:00", vibRms: 2.34, vibPeak: 5.67, vibKurtosis: 3.12, temperature: 75, currentRms: 45.2, isAnomalous: true },
      { time: "2026-06-18T10:35:00", vibRms: 2.45, vibPeak: 5.89, vibKurtosis: 3.45, temperature: 76, currentRms: 46.1 },
    ];
    render(<TendanceVibratoire vibrations={vibs} />);
    expect(screen.getByText(/Dernière valeur/)).toBeInTheDocument();
  });

  it("displays correct unit for temperature metric", () => {
    render(<TendanceVibratoire vibrations={sampleVibrations} />);
    fireEvent.click(screen.getByText("Temp"));
    const celsius = screen.getAllByText(/°C/);
    expect(celsius.length).toBeGreaterThan(0);
  });
});

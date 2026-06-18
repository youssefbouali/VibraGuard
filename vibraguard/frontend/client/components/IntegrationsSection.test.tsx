import React from "react";
import { render, screen } from "@testing-library/react";
import IntegrationsSection from "./IntegrationsSection";

describe("IntegrationsSection", () => {
  it("renders section heading", () => {
    render(<IntegrationsSection />);
    expect(screen.getByText("S'intègre parfaitement avec votre écosystème")).toBeInTheDocument();
  });

  it("renders all integration badges", () => {
    render(<IntegrationsSection />);
    expect(screen.getByText("IoT / Edge")).toBeInTheDocument();
    expect(screen.getByText("Cloud Azure / AWS")).toBeInTheDocument();
    expect(screen.getByText("API REST / GraphQL")).toBeInTheDocument();
    expect(screen.getByText("SCADA / ERP")).toBeInTheDocument();
  });
});

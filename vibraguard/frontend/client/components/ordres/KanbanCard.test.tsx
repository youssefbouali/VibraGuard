import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanCard, OT } from "./KanbanCard";

const mockOT: OT = {
  id: "OT-001",
  title: "Réparation pompe centrifuge",
  machine: "MOT-01",
  priority: "haute",
  date: "2026-06-20",
  assignee: "Karim",
  status: "todo",
  type: "Correctif",
  cost: 15000,
  duration: "4h",
  parts: ["Roulement", "Joint"],
};

const mockOTBasse: OT = {
  id: "OT-002",
  title: "Inspection routine",
  machine: "MOT-02",
  priority: "basse",
  date: "2026-06-25",
  assignee: "Sofia",
  status: "inprogress",
  type: "Préventif",
  duration: "2h",
};

const mockOTDone: OT = {
  id: "OT-003",
  title: "Remplacement filtre",
  machine: "MOT-03",
  priority: "moyenne",
  date: "2026-06-15",
  assignee: "Karim",
  status: "done",
};

const mockOTDeadline: OT = {
  id: "OT-004",
  title: "Urgent repair",
  machine: "MOT-04",
  priority: "haute",
  date: "2026-06-18",
  dateColor: "red",
  status: "todo",
};

const mockOTUnassigned: OT = {
  id: "OT-005",
  title: "Unassigned task",
  machine: "MOT-05",
  priority: "moyenne",
  date: "2026-06-30",
  unassigned: true,
  status: "todo",
};

const mockOTNoAssignee: OT = {
  id: "OT-006",
  title: "No assignee task",
  machine: "MOT-06",
  priority: "basse",
  date: "2026-07-01",
  status: "inprogress",
};

describe("KanbanCard", () => {
  it("renders task ID and title", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("OT-001")).toBeInTheDocument();
    expect(screen.getByText("Réparation pompe centrifuge")).toBeInTheDocument();
  });

  it("renders machine name", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("MOT-01")).toBeInTheDocument();
  });

  it("renders priority badge for haute", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("Haute")).toBeInTheDocument();
  });

  it("renders priority badge for basse", () => {
    render(<KanbanCard ot={mockOTBasse} />);
    expect(screen.getByText("Basse")).toBeInTheDocument();
  });

  it("renders type badge when provided", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("Correctif")).toBeInTheDocument();
  });

  it("renders duration when provided", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("4h")).toBeInTheDocument();
  });

  it("renders cost when provided and > 0", () => {
    const { container } = render(<KanbanCard ot={mockOT} />);
    expect(container.textContent).toContain("MAD");
    expect(container.textContent).toContain("15");
  });

  it("renders parts list when provided", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("Roulement")).toBeInTheDocument();
    expect(screen.getByText("Joint")).toBeInTheDocument();
  });

  it("renders assignee name", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("Karim")).toBeInTheDocument();
  });

  it("renders date", () => {
    render(<KanbanCard ot={mockOT} />);
    expect(screen.getByText("2026-06-20")).toBeInTheDocument();
  });

  it("renders deadline icon style when dateColor is red", () => {
    render(<KanbanCard ot={mockOTDeadline} />);
    expect(screen.getByText("2026-06-18")).toBeInTheDocument();
  });

  it("renders unassigned state", () => {
    render(<KanbanCard ot={mockOTUnassigned} />);
    expect(screen.getByText("Non assigné")).toBeInTheDocument();
  });

  it("does not render assignee section when no assignee and not unassigned", () => {
    const { container } = render(<KanbanCard ot={mockOTNoAssignee} />);
    const footer = container.querySelector(".flex.items-center.justify-between");
    expect(footer).toBeTruthy();
  });

  it("renders done state with line-through title and opacity", () => {
    render(<KanbanCard ot={mockOTDone} />);
    expect(screen.getByText("Remplacement filtre")).toBeInTheDocument();
  });

  it("renders done priority badge for done tasks", () => {
    render(<KanbanCard ot={mockOTDone} />);
    expect(screen.getByText("Moyenne")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = jest.fn();
    render(<KanbanCard ot={mockOT} onClick={onClick} />);
    fireEvent.click(screen.getByText("OT-001"));
    expect(onClick).toHaveBeenCalled();
  });

  it("sets drag data on drag start", () => {
    const { container } = render(<KanbanCard ot={mockOT} />);
    const draggableDiv = container.querySelector("[draggable=true]");
    expect(draggableDiv).toBeTruthy();
  });
});

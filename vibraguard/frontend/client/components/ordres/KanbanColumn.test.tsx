import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanColumn } from "./KanbanColumn";
import { OT } from "./KanbanCard";

const mockTasks: OT[] = [
  { id: "OT-001", title: "Task 1", machine: "MOT-01", priority: "haute", date: "2026-06-20", status: "todo" },
  { id: "OT-002", title: "Task 2", machine: "MOT-02", priority: "moyenne", date: "2026-06-21", status: "todo" },
  { id: "OT-003", title: "Task 3", machine: "MOT-03", priority: "basse", date: "2026-06-22", status: "todo" },
];

describe("KanbanColumn", () => {
  it("renders column title", () => {
    render(<KanbanColumn title="À faire" status="todo" tasks={[]} />);
    expect(screen.getByText("À faire")).toBeInTheDocument();
  });

  it("renders task count", () => {
    render(<KanbanColumn title="À faire" status="todo" tasks={mockTasks} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders task cards", () => {
    render(<KanbanColumn title="À faire" status="todo" tasks={mockTasks} />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("calls onCardClick when a card is clicked", () => {
    const onCardClick = jest.fn();
    render(
      <KanbanColumn
        title="À faire"
        status="todo"
        tasks={[mockTasks[0]]}
        onCardClick={onCardClick}
      />
    );
    fireEvent.click(screen.getByText("OT-001"));
    expect(onCardClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("calls onDrop when a card is dropped", () => {
    const onDrop = jest.fn();
    render(
      <KanbanColumn title="À faire" status="todo" tasks={[]} onDrop={onDrop} />
    );
    const column = screen.getByText("À faire").closest('[class*="flex"]')!;
    const dataTransfer = {
      getData: () => "OT-001",
      setData: jest.fn(),
      effectAllowed: "move",
    } as any;
    Object.defineProperty(dataTransfer, "dropEffect", { value: "move", writable: true });
    fireEvent.drop(column, { dataTransfer });
    expect(onDrop).toHaveBeenCalledWith("OT-001", "todo");
  });

  it("renders empty state when no tasks", () => {
    const { container } = render(<KanbanColumn title="Terminé" status="done" tasks={[]} />);
    const countBadge = screen.getByText("0");
    expect(countBadge).toBeInTheDocument();
  });

  it("shows correct dot color for each status", () => {
    const { container: todoCol } = render(<KanbanColumn title="Todo" status="todo" tasks={[]} />);
    const { container: inprogCol } = render(<KanbanColumn title="In Progress" status="inprogress" tasks={[]} />);
    const { container: doneCol } = render(<KanbanColumn title="Done" status="done" tasks={[]} />);

    const todoDot = todoCol.querySelector(".bg-\\[\\#98A6A8\\]");
    const inprogDot = inprogCol.querySelector(".bg-\\[\\#0C6CF2\\]");
    const doneDot = doneCol.querySelector(".bg-\\[\\#00924A\\]");

    expect(todoDot).toBeTruthy();
    expect(inprogDot).toBeTruthy();
    expect(doneDot).toBeTruthy();
  });
});

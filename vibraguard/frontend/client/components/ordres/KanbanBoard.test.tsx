import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { KanbanBoard } from "./KanbanBoard";

const mockUseWorkOrders = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("@/hooks/use-work-orders", () => ({
  useWorkOrders: (...args: any[]) => mockUseWorkOrders(...args),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}));

jest.mock("@/lib/api", () => ({
  api: { updateWorkOrder: jest.fn() },
}));

const mockApi = (jest.requireMock("@/lib/api") as any).api;

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn((promise: any) => promise),
  },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

const mockWorkOrders = [
  {
    id: "WO-001",
    title: "Réparation pompe",
    asset: "MOT-01",
    status: "Nouveau",
    assignedTo: { name: "Karim" },
    dueDate: "2026-06-20",
    priority: "Critique",
    type: "Correctif",
    cost: 15000,
    duration: "4h",
    parts: "Roulement,Joint",
  },
  {
    id: "WO-002",
    title: "Inspection routine",
    asset: "MOT-02",
    status: "En cours",
    assignedTo: { name: "Sofia" },
    dueDate: "2026-06-25",
    priority: "Basse",
    type: "Préventif",
    duration: "2h",
    parts: "",
  },
  {
    id: "WO-003",
    title: "Remplacement filtre",
    asset: "MOT-03",
    status: "Terminé",
    assignedTo: { name: "Karim" },
    dueDate: "2026-06-15",
    priority: "Moyenne",
    type: "Correctif",
    cost: 5000,
    duration: "1h",
    parts: "Filtre",
  },
];

const mockRefetch = jest.fn();

describe("KanbanBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkOrders.mockReturnValue({
      data: mockWorkOrders,
      isLoading: false,
      refetch: mockRefetch,
    });
    mockUseAuth.mockReturnValue({
      user: { fullName: "Admin User", role: "admin" },
    });
  });

  it("renders search input", () => {
    render(<KanbanBoard />);
    expect(screen.getByPlaceholderText("Rechercher un OT, Moteur...")).toBeInTheDocument();
  });

  it("renders kanban columns with titles", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("À faire")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Terminé")).toBeInTheDocument();
  });

  it("distributes tasks to correct columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Réparation pompe")).toBeInTheDocument();
    expect(screen.getByText("Inspection routine")).toBeInTheDocument();
    expect(screen.getByText("Remplacement filtre")).toBeInTheDocument();
  });

  it("renders task IDs in cards", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("WO-001")).toBeInTheDocument();
    expect(screen.getByText("WO-002")).toBeInTheDocument();
    expect(screen.getByText("WO-003")).toBeInTheDocument();
  });

  it("filters tasks by search query", () => {
    render(<KanbanBoard />);
    const searchInput = screen.getByPlaceholderText("Rechercher un OT, Moteur...");
    fireEvent.change(searchInput, { target: { value: "WO-001" } });
    expect(screen.getByText("WO-001")).toBeInTheDocument();
    expect(screen.queryByText("WO-002")).not.toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    mockUseWorkOrders.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch,
    });
    render(<KanbanBoard />);
    expect(screen.getByText("Chargement des ordres de travail...")).toBeInTheDocument();
  });

  it("filters by technician role", () => {
    mockUseAuth.mockReturnValueOnce({
      user: { fullName: "Karim", role: "technicien" },
    });
    render(<KanbanBoard />);
    expect(screen.getByText("Réparation pompe")).toBeInTheDocument();
    expect(screen.queryByText("Inspection routine")).not.toBeInTheDocument();
  });

  it("opens dialog when a card is clicked", () => {
    render(<KanbanBoard />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("WO-001"));
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("shows OT details in dialog", () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByText("WO-001"));
    const dialog = screen.getByTestId("dialog");
    expect(within(dialog).getByText("Mettre à jour l'Ordre de Travail")).toBeInTheDocument();
    expect(within(dialog).getByText("WO-001")).toBeInTheDocument();
    expect(within(dialog).getByText("Réparation pompe")).toBeInTheDocument();
  });

  it("shows status options in dialog", () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByText("WO-001"));
    const dialog = screen.getByTestId("dialog");
    expect(within(dialog).getByText("À faire")).toBeInTheDocument();
    expect(within(dialog).getByText("En cours")).toBeInTheDocument();
    expect(within(dialog).getByText("Terminé")).toBeInTheDocument();
  });

  it("has cancel button in dialog", () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByText("WO-001"));
    expect(screen.getByText("Annuler")).toBeInTheDocument();
  });

  it("has update button in dialog", () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByText("WO-001"));
    expect(screen.getByText("Mettre à jour")).toBeInTheDocument();
  });
});

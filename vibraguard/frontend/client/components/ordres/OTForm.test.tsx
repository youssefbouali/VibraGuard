import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OTForm } from "./OTForm";

jest.mock("@/lib/api", () => ({
  api: {
    getMotors: jest.fn(),
    getTechnicians: jest.fn(),
    getInventoryParts: jest.fn(),
    createWorkOrder: jest.fn(),
    createInventoryPart: jest.fn(),
  },
}));
jest.mock("@/lib/auth-context", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/blockchain", () => ({ submitWorkOrderToBlockchain: jest.fn() }));

import { api as mockApiModule } from "@/lib/api";
import { useAuth as useAuthMock } from "@/lib/auth-context";

const mockApi = mockApiModule as jest.Mocked<typeof mockApiModule>;
const mockUseAuth = useAuthMock as jest.MockedFunction<typeof useAuthMock>;

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
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
  User: () => <div data-testid="user-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

const mockMotors = [
  { id: "MOT-001", type: "Asynchrone", label: "Moteur Ligne 1" },
  { id: "MOT-002", type: "Synchrone", label: "Moteur Ligne 2" },
];

const mockTechnicians = [
  { id: "TECH-001", name: "Karim", specialization: "Mécanique" },
  { id: "TECH-002", name: "Sofia", specialization: "Électrique" },
];

const mockParts = [
  { id: "PART-001", name: "Roulement", stock: 10, stockColor: "green" },
  { id: "PART-002", name: "Joint", stock: 3, stockColor: "yellow" },
];

describe("OTForm", () => {
  const onCancel = jest.fn();

  beforeEach(() => {
    mockApi.getMotors.mockResolvedValue(mockMotors);
    mockApi.getTechnicians.mockResolvedValue(mockTechnicians);
    mockApi.getInventoryParts.mockResolvedValue(mockParts);
    mockApi.createWorkOrder.mockResolvedValue({ id: "WO-NEW-001" });
    mockApi.createInventoryPart.mockResolvedValue({ id: "PART-NEW", name: "Bearing", stock: 5 });
    mockUseAuth.mockReturnValue({
      user: { fullName: "Admin User", role: "admin" },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders form title and labels", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Moteur concerné")).toBeInTheDocument();
    });
    expect(screen.getByText("Type d'anomalie & Sévérité")).toBeInTheDocument();
  });

  it("loads motors into select", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      const option = screen.getByText("MOT-001 - Moteur Ligne 1");
      expect(option).toBeInTheDocument();
    });
  });

  it("renders severity button with default value", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Critique")).toBeInTheDocument();
    });
  });

  it("allows changing severity via dropdown", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Critique")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Critique"));
    fireEvent.click(screen.getByText("Élevée"));
    expect(screen.getByText("Élevée")).toBeInTheDocument();
  });

  it("renders maintenance type toggle", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Préventif")).toBeInTheDocument();
      expect(screen.getByText("Correctif")).toBeInTheDocument();
    });
  });

  it("renders date input", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      const dateInput = document.querySelector('input[type="datetime-local"]');
      expect(dateInput).toBeInTheDocument();
    });
  });

  it("renders hour and minute inputs", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      const hourInput = document.querySelector('input[placeholder="HH"]');
      expect(hourInput).toBeInTheDocument();
    });
    const minuteInput = document.querySelector('input[placeholder="MM"]');
    expect(minuteInput).toBeInTheDocument();
  });

  it("renders technician section", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Technicien assigné")).toBeInTheDocument();
    });
  });

  it("renders parts section", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Pièces nécessaires (Magasin)")).toBeInTheDocument();
    });
  });

  it("renders cost input", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Coût estimé")).toBeInTheDocument();
    });
  });

  it("renders description textarea", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Décrivez l'intervention et les instructions de travail...")).toBeInTheDocument();
    });
  });

  it("renders cancel and submit buttons", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Annuler")).toBeInTheDocument();
      expect(screen.getByText("Enregistrer l'Ordre")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Annuler")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Annuler"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls createWorkOrder on submit", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Enregistrer l'Ordre")).toBeInTheDocument();
    });
    const anomalieInput = document.querySelector('input[placeholder=""]');
    if (anomalieInput) {
      fireEvent.change(anomalieInput, { target: { value: "Test anomaly" } });
    }
    fireEvent.click(screen.getByText("Enregistrer l'Ordre"));
    await waitFor(() => {
      expect(mockApi.createWorkOrder).toHaveBeenCalled();
    });
  });

  it("shows severity dropdown options", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByText("Critique")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Critique"));
    expect(screen.getByText("Moyenne")).toBeInTheDocument();
    expect(screen.getByText("Faible")).toBeInTheDocument();
  });

  it("renders as select for admin users", async () => {
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      const selects = document.querySelectorAll("select");
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders as read-only input for technician users", async () => {
    mockUseAuth.mockReturnValue({
      user: { fullName: "Tech User", role: "technicien" },
    });
    render(<OTForm onCancel={onCancel} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Tech User")).toBeInTheDocument();
    });
    const inputs = document.querySelectorAll("input");
    const readOnlyInputs = Array.from(inputs).filter(i => i.readOnly);
    expect(readOnlyInputs.length).toBeGreaterThanOrEqual(1);
  });
});

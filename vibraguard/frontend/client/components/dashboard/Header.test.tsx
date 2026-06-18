import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";

jest.mock("@/hooks/use-alerts", () => ({
  useAlerts: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { fullName: "Test User", role: "admin", email: "a@b.com" },
    logout: jest.fn(),
  })),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/lib/api", () => ({
  api: {
    search: jest.fn(),
    markAllAlertsAsRead: jest.fn(),
    markAlertAsRead: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div data-testid="dropdown-item" onClick={onClick}>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));

describe("Header", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders default breadcrumb", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
  });

  it("renders custom breadcrumb", () => {
    render(<MemoryRouter><Header breadcrumb="Moteurs" /></MemoryRouter>);
    expect(screen.getByText("Moteurs")).toBeInTheDocument();
  });

  it("renders breadcrumb items", () => {
    const items = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Moteurs" },
    ];
    render(<MemoryRouter><Header breadcrumbItems={items} /></MemoryRouter>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Moteurs")).toBeInTheDocument();
  });

  it("renders user name from auth context", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const elements = screen.getAllByText("Test User");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders menu button for mobile", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const menuButton = document.getElementById("menu-button");
    expect(menuButton).toBeInTheDocument();
  });

  it("calls onMenuClick when menu button is clicked", () => {
    const onMenuClick = jest.fn();
    render(<MemoryRouter><Header onMenuClick={onMenuClick} /></MemoryRouter>);
    const menuButton = document.getElementById("menu-button")!;
    fireEvent.click(menuButton);
    expect(onMenuClick).toHaveBeenCalled();
  });

  it("renders search button", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const searchButton = screen.getByLabelText("Open search");
    expect(searchButton).toBeInTheDocument();
  });

  it("opens search input when search button is clicked", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByLabelText("Open search"));
    const searchInput = screen.getByPlaceholderText("Rechercher (Moteur, Alerte...)");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders notification button", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const notificationButton = document.querySelector("button.relative");
    expect(notificationButton).toBeInTheDocument();
  });

  it("renders user info from auth context", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const elements = screen.getAllByText("Test User");
    expect(elements.length).toBeGreaterThan(0);
  });
});

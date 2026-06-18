import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ login: mockLogin }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("Login Page", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    (globalThis as any).fetch = jest.fn();
  });

  it("renders the login form", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("votre@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders the OCP VibraGuard branding", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText("OCP")).toBeInTheDocument();
    expect(screen.getByText("VibraGuard")).toBeInTheDocument();
  });

  it("renders the register link", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const registerLink = screen.getByText("Créer un compte");
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  it("shows loading state on submit", async () => {
    (globalThis as any).fetch.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("votre@email.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("Se connecter"));

    expect(screen.getByText("Connexion...")).toBeInTheDocument();
  });

  it("calls login and navigates on successful submission", async () => {
    (globalThis as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "test-token",
        email: "a@b.com",
        fullName: "Test User",
        role: "admin",
      }),
    });

    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("votre@email.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "test-token",
        expect.objectContaining({ email: "a@b.com" }),
        true
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("shows error on failed login", async () => {
    (globalThis as any).fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Identifiants invalides" }),
    });

    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("votre@email.com"), {
      target: { value: "wrong@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(screen.getByText("Se connecter")).toBeInTheDocument();
    });
  });

  it("toggles remember me checkbox", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("toggles password visibility", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");
    const toggleButton = screen.getByLabelText("Afficher le mot de passe");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});

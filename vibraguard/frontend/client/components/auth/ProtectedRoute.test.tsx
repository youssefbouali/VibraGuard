import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = jest.fn();
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => null,
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows loading spinner when isLoading is true", () => {
    mockUseAuth.mockReturnValue({ isLoading: true, token: null, user: null });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects to /login when no token", () => {
    mockUseAuth.mockReturnValue({ isLoading: false, token: null, user: null });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      token: "valid-token",
      user: { role: "admin", email: "a@b.com" },
    });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /dashboard when role not in allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      token: "valid-token",
      user: { role: "user" },
    });
    render(
      <MemoryRouter initialEntries={["/admin-only"]}>
        <ProtectedRoute allowedRoles={["admin"]}><div>Admin Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("renders children when role matches allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      token: "valid-token",
      user: { role: "admin" },
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["admin"]}><div>Admin Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("allows technicien role when technician is in allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      token: "valid-token",
      user: { role: "technicien" },
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["technician"]}><div>Tech Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Tech Content")).toBeInTheDocument();
  });
});

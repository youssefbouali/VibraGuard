import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-context";

function Consumer() {
  const { user, token, login, logout, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="token">{token ?? ""}</div>
      <div data-testid="email">{user?.email ?? ""}</div>
      <button
        onClick={() =>
          login(
            "tkn",
            {
              email: "a@b.com",
              fullName: "A B",
              employeeId: "E-1",
              phoneNumber: "1",
              department: "D",
              role: "USER",
            },
            true,
          )
        }
      >
        login-remember
      </button>
      <button
        onClick={() =>
          login(
            "tkn2",
            {
              email: "c@d.com",
              fullName: "C D",
              employeeId: "E-2",
              phoneNumber: "2",
              department: "D2",
              role: "ADMIN",
            },
            false,
          )
        }
      >
        login-session
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("auth-context", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        email: "a@b.com",
        fullName: "A B",
        employeeId: "E-1",
        phoneNumber: "1",
        department: "D",
        role: "USER",
      }),
    });
  });

  it("stores token in localStorage when rememberMe is true", async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    act(() => {
      screen.getByText("login-remember").click();
    });

    expect(localStorage.getItem("token")).toBe("tkn");
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token").textContent).toBe("tkn");
    expect(screen.getByTestId("email").textContent).toBe("a@b.com");
  });

  it("stores token in sessionStorage when rememberMe is false", async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: "c@d.com",
        fullName: "C D",
        employeeId: "E-2",
        phoneNumber: "2",
        department: "D2",
        role: "ADMIN",
      }),
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    act(() => {
      screen.getByText("login-session").click();
    });

    expect(sessionStorage.getItem("token")).toBe("tkn2");
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token").textContent).toBe("tkn2");
    expect(screen.getByTestId("email").textContent).toBe("c@d.com");
  });

  it("clears user and token on logout", async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    act(() => {
      screen.getByText("login-remember").click();
    });

    act(() => {
      screen.getByText("logout").click();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token").textContent).toBe("");
    expect(screen.getByTestId("email").textContent).toBe("");
  });

  it("fetches user on mount when token exists", async () => {
    localStorage.setItem("token", "tkn");
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        email: "x@y.com",
        fullName: "X Y",
        employeeId: "E-3",
        phoneNumber: "3",
        department: "D3",
        role: "USER",
      }),
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("email").textContent).toBe("x@y.com");
  });
});

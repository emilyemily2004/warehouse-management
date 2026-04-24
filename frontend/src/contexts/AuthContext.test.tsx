import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const mockUser = {
  id: 1,
  username: "admin",
  email: "admin@test.com",
  role: "admin",
  created_at: "2026-01-01",
};

const TestComponent = () => {
  const { user, token, login, register, logout, isAuthenticated, isAdmin } =
    useAuth();

  return (
    <div>
      <p>User: {user ? user.username : "No user"}</p>
      <p>Token: {token || "No token"}</p>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>Admin: {isAdmin ? "Yes" : "No"}</p>

      <button onClick={() => login("admin", "admin123")}>Login</button>
      <button
        onClick={() => register("newuser", "new@test.com", "password123")}
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("loads with no user by default", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("User: No user")).toBeInTheDocument();
      expect(screen.getByText("Authenticated: No")).toBeInTheDocument();
      expect(screen.getByText("Admin: No")).toBeInTheDocument();
    });
  });

  test("loads saved user and token from localStorage", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("User: admin")).toBeInTheDocument();
      expect(screen.getByText("Token: saved-token")).toBeInTheDocument();
      expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
      expect(screen.getByText("Admin: Yes")).toBeInTheDocument();
    });
  });

  test("login stores user and token when successful", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        user: mockUser,
        token: "test-token",
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("User: admin")).toBeInTheDocument();
      expect(screen.getByText("Token: test-token")).toBeInTheDocument();
      expect(localStorage.getItem("token")).toBe("test-token");
    });
  });

  test("login returns false when credentials are invalid", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("User: No user")).toBeInTheDocument();
      expect(screen.getByText("Authenticated: No")).toBeInTheDocument();
    });
  });

  test("register sends request and succeeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/register",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  test("logout clears user, token and localStorage", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("User: admin")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("User: No user")).toBeInTheDocument();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  test("throws error when useAuth is used outside AuthProvider", () => {
    const BrokenComponent = () => {
      useAuth();
      return <div>Broken</div>;
    };

    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<BrokenComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    (console.error as jest.Mock).mockRestore();
  });
});

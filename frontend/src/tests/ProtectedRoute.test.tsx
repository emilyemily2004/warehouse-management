import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

jest.mock("../contexts/AuthContext");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { username: "user", role: "user" },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("shows access denied when admin access is required but user is not admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { username: "user", role: "user" },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Access denied. Admin privileges required."),
    ).toBeInTheDocument();
  });

  test("renders admin content when user is admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      user: { username: "admin", role: "admin" },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});

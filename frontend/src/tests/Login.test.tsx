import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../components/Login";
import { useAuth } from "../contexts/AuthContext";

const mockNavigate = jest.fn();

jest.mock("../contexts/AuthContext");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Login Component", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      logout: jest.fn(),
      register: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
    } as any);
  });

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Login to Warehouse Management"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username:")).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("calls login and navigates to dashboard when login is successful", async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Username:"), {
      target: { value: "admin" },
    });

    fireEvent.change(screen.getByLabelText("Password:"), {
      target: { value: "admin123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin", "admin123");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error message when login fails", async () => {
    mockLogin.mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Username:"), {
      target: { value: "wrong" },
    });

    fireEvent.change(screen.getByLabelText("Password:"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password"),
      ).toBeInTheDocument();
    });
  });
});

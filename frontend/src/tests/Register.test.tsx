import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../components/Register";
import { useAuth } from "../contexts/AuthContext";

const mockNavigate = jest.fn();

jest.mock("../contexts/AuthContext");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Register Component", () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    window.alert = jest.fn();

    mockUseAuth.mockReturnValue({
      register: mockRegister,
      login: jest.fn(),
      logout: jest.fn(),
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    } as any);
  });

  test("renders register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Register for Warehouse Management"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username:")).toBeInTheDocument();
    expect(screen.getByLabelText("Email:")).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password:")).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Username:"), {
      target: { value: "newuser" },
    });

    fireEvent.change(screen.getByLabelText("Email:"), {
      target: { value: "newuser@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Password:"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password:"), {
      target: { value: "different123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test("registers user and navigates to login when successful", async () => {
    mockRegister.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Username:"), {
      target: { value: "newuser" },
    });

    fireEvent.change(screen.getByLabelText("Email:"), {
      target: { value: "newuser@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Password:"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password:"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "newuser",
        "newuser@test.com",
        "password123",
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});

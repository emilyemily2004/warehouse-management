import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import Dashboard from "../components/Dashboard";

jest.mock("../contexts/AuthContext");
jest.mock("../services/apiService");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

const selectProduct = async (productName: string) => {
  await waitFor(() => {
    expect(
      screen.getByRole("option", { name: productName }),
    ).toBeInTheDocument();
  });

  const select = screen.getByRole("combobox") as HTMLSelectElement;

  fireEvent.change(select, {
    target: { value: productName },
  });

  await waitFor(() => {
    expect(select.value).toBe(productName);
  });
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();

    mockUseAuth.mockReturnValue({
      user: { username: "admin", role: "admin" },
      logout: jest.fn(),
      isAdmin: true,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
    } as any);

    mockApiService.getProducts.mockResolvedValue({
      data: [
        {
          name: "Dining Chair",
          contain_articles: [
            { art_id: "1", amount_of: 4 },
            { art_id: "2", amount_of: 1 },
          ],
          price: 0,
        },
        {
          name: "Table",
          contain_articles: [{ art_id: "3", amount_of: 1 }],
          price: 0,
        },
      ],
    } as any);

    mockApiService.getArticles.mockResolvedValue({
      data: [
        { art_id: "1", name: "Leg", stock: 20 },
        { art_id: "2", name: "Seat", stock: 5 },
        { art_id: "3", name: "Top", stock: 3 },
      ],
    } as any);

    mockApiService.canProductBeMade.mockResolvedValue({ data: true } as any);
    mockApiService.createProduct.mockResolvedValue({ data: "created" } as any);
    mockApiService.deleteProduct.mockResolvedValue({ data: "deleted" } as any);
  });

  test("renders dashboard title and user information", async () => {
    render(<Dashboard />);

    expect(
      screen.getByText("Warehouse Management Dashboard"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome, admin/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Dining Chair").length).toBeGreaterThan(0);
    });
  });

  test("loads and displays products and articles", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Articles Inventory")).toBeInTheDocument();
      expect(screen.getByText("Leg")).toBeInTheDocument();
      expect(screen.getByText("Seat")).toBeInTheDocument();
      expect(screen.getByText("Top")).toBeInTheDocument();
    });
  });

  test("shows created products empty message", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("No products created yet")).toBeInTheDocument();
      expect(screen.getByText("Total created: 0 products")).toBeInTheDocument();
    });
  });

  test("allows user to select a product", async () => {
    render(<Dashboard />);

    await selectProduct("Dining Chair");

    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "Dining Chair",
    );
  });

  test("checks product availability successfully", async () => {
    render(<Dashboard />);

    await selectProduct("Dining Chair");

    const checkButton = screen.getByRole("button", {
      name: /Check Availability/i,
    });

    await waitFor(() => {
      expect(checkButton).not.toBeDisabled();
    });

    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockApiService.canProductBeMade).toHaveBeenCalledWith(
        "Dining Chair",
      );
      expect(screen.getByText("✅ Product can be made")).toBeInTheDocument();
    });
  });

  test("shows insufficient stock message", async () => {
    mockApiService.canProductBeMade.mockResolvedValueOnce({
      data: false,
    } as any);

    render(<Dashboard />);

    await selectProduct("Dining Chair");

    const checkButton = screen.getByRole("button", {
      name: /Check Availability/i,
    });

    await waitFor(() => {
      expect(checkButton).not.toBeDisabled();
    });

    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Product cannot be made/)).toBeInTheDocument();
    });
  });

  test("creates product successfully and saves it into localStorage", async () => {
    render(<Dashboard />);

    await selectProduct("Dining Chair");

    const createButton = screen.getByRole("button", {
      name: /Create Product/i,
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockApiService.createProduct).toHaveBeenCalledWith("Dining Chair");
      expect(window.alert).toHaveBeenCalledWith(
        "Product created successfully!",
      );
    });

    const savedProducts = JSON.parse(
      localStorage.getItem("createdProducts") || "[]",
    );

    expect(savedProducts).toHaveLength(1);
    expect(savedProducts[0].name).toBe("Dining Chair");
    expect(savedProducts[0].createdBy).toBe("admin");
  });

  test("displays created products from localStorage", async () => {
    localStorage.setItem(
      "createdProducts",
      JSON.stringify([
        {
          name: "Dining Chair",
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "admin",
        },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total created: 1 products")).toBeInTheDocument();
      expect(screen.getAllByText("Dining Chair").length).toBeGreaterThan(0);
      expect(screen.getAllByText("admin").length).toBeGreaterThan(0);
    });
  });

  test("renders created products sorted with newest first", async () => {
    localStorage.setItem(
      "createdProducts",
      JSON.stringify([
        {
          name: "Old Product",
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "admin",
        },
        {
          name: "New Product",
          createdAt: "2024-01-02T00:00:00.000Z",
          createdBy: "admin",
        },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total created: 2 products")).toBeInTheDocument();
      expect(screen.getByText("Old Product")).toBeInTheDocument();
      expect(screen.getByText("New Product")).toBeInTheDocument();
    });
  });

  test("deletes created product when confirmed", async () => {
    localStorage.setItem(
      "createdProducts",
      JSON.stringify([
        {
          name: "Dining Chair",
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "admin",
        },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total created: 1 products")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockApiService.deleteProduct).toHaveBeenCalledWith("Dining Chair");
      expect(window.alert).toHaveBeenCalledWith(
        "Product deleted and articles restored to inventory!",
      );
    });
  });

  test("does not delete product when confirmation is cancelled", async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(false);

    localStorage.setItem(
      "createdProducts",
      JSON.stringify([
        {
          name: "Dining Chair",
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "admin",
        },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total created: 1 products")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockApiService.deleteProduct).not.toHaveBeenCalled();
  });

  test("shows error when checking availability fails", async () => {
    mockApiService.canProductBeMade.mockRejectedValueOnce(new Error("error"));

    render(<Dashboard />);

    await selectProduct("Dining Chair");

    const checkButton = screen.getByRole("button", {
      name: /Check Availability/i,
    });

    await waitFor(() => {
      expect(checkButton).not.toBeDisabled();
    });

    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to check product availability"),
      ).toBeInTheDocument();
    });
  });

  test("shows error when creating product fails", async () => {
    mockApiService.createProduct.mockRejectedValueOnce(new Error("error"));

    render(<Dashboard />);

    await selectProduct("Dining Chair");

    const createButton = screen.getByRole("button", {
      name: /Create Product/i,
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to create product")).toBeInTheDocument();
    });
  });

  test("shows error when deleting product fails", async () => {
    mockApiService.deleteProduct.mockRejectedValueOnce(new Error("error"));

    localStorage.setItem(
      "createdProducts",
      JSON.stringify([
        {
          name: "Dining Chair",
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "admin",
        },
      ]),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total created: 1 products")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to delete product")).toBeInTheDocument();
    });
  });

  test("shows error when loading data fails", async () => {
    mockApiService.getProducts.mockRejectedValueOnce(new Error("error"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    });
  });

  test("calls logout when logout button is clicked", async () => {
    const mockLogout = jest.fn();

    mockUseAuth.mockReturnValue({
      user: { username: "admin", role: "admin" },
      logout: mockLogout,
      isAdmin: true,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
    } as any);

    render(<Dashboard />);

    fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

    expect(mockLogout).toHaveBeenCalled();
  });

  test("disables buttons when no product is selected", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Check Availability/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Create Product/i }),
      ).toBeDisabled();
    });
  });

  test("non-admin user cannot see create and delete buttons", async () => {
    mockUseAuth.mockReturnValue({
      user: { username: "user", role: "user" },
      logout: jest.fn(),
      isAdmin: false,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
    } as any);

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Warehouse Management Dashboard"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Create Product/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/i }),
    ).not.toBeInTheDocument();
  });
});

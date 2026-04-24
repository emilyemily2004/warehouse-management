export {};
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockRequestInterceptorUse = jest.fn();
const mockResponseInterceptorUse = jest.fn();

jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    interceptors: {
      request: {
        use: mockRequestInterceptorUse,
      },
      response: {
        use: mockResponseInterceptorUse,
      },
    },
  })),
}));

describe("apiService", () => {
  let apiService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    jest.isolateModules(() => {
      apiService = require("./apiService").apiService;
    });
  });

  test("adds Authorization header when token exists", () => {
    localStorage.setItem("token", "test-token");

    const requestInterceptor = mockRequestInterceptorUse.mock.calls[0][0];

    const config = {
      headers: {},
    };

    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  test("does not add Authorization header when token does not exist", () => {
    const requestInterceptor = mockRequestInterceptorUse.mock.calls[0][0];

    const config = {
      headers: {},
    };

    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test("returns response successfully in response interceptor", () => {
    const successInterceptor = mockResponseInterceptorUse.mock.calls[0][0];

    const response = { data: "success" };

    expect(successInterceptor(response)).toEqual(response);
  });

  test("removes token and redirects to login when response status is 401", async () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ username: "admin" }));

    delete (window as any).location;
    (window as any).location = { href: "" };

    const errorInterceptor = mockResponseInterceptorUse.mock.calls[0][1];

    const error = {
      response: {
        status: 401,
      },
    };

    await expect(errorInterceptor(error)).rejects.toEqual(error);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  test("rejects error without redirect when response status is not 401", async () => {
    const errorInterceptor = mockResponseInterceptorUse.mock.calls[0][1];

    const error = {
      response: {
        status: 500,
      },
    };

    await expect(errorInterceptor(error)).rejects.toEqual(error);
  });

  test("getProducts calls products endpoint", async () => {
    mockGet.mockResolvedValue({ data: [] });

    await apiService.getProducts();

    expect(mockGet).toHaveBeenCalledWith("/products");
  });

  test("canProductBeMade calls encoded endpoint", async () => {
    mockGet.mockResolvedValue({ data: true });

    await apiService.canProductBeMade("Dining Chair");

    expect(mockGet).toHaveBeenCalledWith("/products/Dining%20Chair/canBeMade");
  });

  test("createProduct calls create endpoint", async () => {
    mockPost.mockResolvedValue({ data: "created" });

    await apiService.createProduct("Dining Chair");

    expect(mockPost).toHaveBeenCalledWith("/products/Dining%20Chair/create");
  });

  test("deleteProduct calls delete endpoint", async () => {
    mockPost.mockResolvedValue({ data: "deleted" });

    await apiService.deleteProduct("Dining Chair");

    expect(mockPost).toHaveBeenCalledWith("/products/Dining%20Chair/delete");
  });

  test("getArticles calls articles endpoint", async () => {
    mockGet.mockResolvedValue({ data: [] });

    await apiService.getArticles();

    expect(mockGet).toHaveBeenCalledWith("/articles");
  });

  test("login calls auth login endpoint", async () => {
    mockPost.mockResolvedValue({ data: {} });

    await apiService.login("admin", "admin123");

    expect(mockPost).toHaveBeenCalledWith("/auth/login", {
      username: "admin",
      password: "admin123",
    });
  });

  test("register calls auth register endpoint", async () => {
    mockPost.mockResolvedValue({ data: {} });

    await apiService.register("user", "user@test.com", "password123");

    expect(mockPost).toHaveBeenCalledWith("/auth/register", {
      username: "user",
      email: "user@test.com",
      password: "password123",
    });
  });

  test("getProfile calls profile endpoint", async () => {
    mockGet.mockResolvedValue({ data: {} });

    await apiService.getProfile();

    expect(mockGet).toHaveBeenCalledWith("/auth/profile");
  });
});

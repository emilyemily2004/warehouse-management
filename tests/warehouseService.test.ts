import { WarehouseService } from "../src/services/warehouseService";

describe("WarehouseService", () => {
  let warehouseService: WarehouseService;

  beforeEach(() => {
    warehouseService = new WarehouseService();
    warehouseService.loadArticlesFromFile("./inventory.json");
    warehouseService.loadProductsFromFile("./products.json");
  });

  test("should load articles correctly", () => {
    expect(warehouseService.getArticles().length).toBeGreaterThan(0);
  });

  test("should load products correctly", () => {
    expect(warehouseService.getProducts().length).toBeGreaterThan(0);
  });

  test("should find an existing article", () => {
    const article = warehouseService.getArticles().find(a => a.art_id === "1");
    expect(article).toBeDefined();
  });

  test("should find an existing product", () => {
    const product = warehouseService.getProducts().find(p => p.name === "Dinning Chair");
    expect(product).toBeDefined();
  });

  test("should verify if product can be made", () => {
    expect(warehouseService.canProductBeMade("Dinning Chair")).toBe(true);
  });

  test("should return null for non-existing product", () => {
    expect(warehouseService.canProductBeMade("Unknown Product")).toBeNull();
  });

  test("should reduce stock correctly", () => {
    const result = warehouseService.reduceStockForProduct("Dinning Chair");

    const leg = warehouseService.getArticles().find(a => a.art_id === "1");

    expect(result).toBe(true);
    expect(leg?.stock).toBe(8);
  });

  test("should throw error when product does not exist", () => {
    expect(() => {
      warehouseService.reduceStockForProduct("Invalid Product");
    }).toThrow();
  });

  test("should return false when stock is insufficient (canProductBeMade)", () => {
    warehouseService.reduceStockForProduct("Dinning Chair");
    warehouseService.reduceStockForProduct("Dinning Chair");
    warehouseService.reduceStockForProduct("Dinning Chair");

    expect(warehouseService.canProductBeMade("Dinning Chair")).toBe(false);
  });

  test("should return false when reducing stock after stock becomes insufficient", () => {
    warehouseService.reduceStockForProduct("Dinning Chair");
    warehouseService.reduceStockForProduct("Dinning Chair");
    warehouseService.reduceStockForProduct("Dinning Chair");

    const result = warehouseService.reduceStockForProduct("Dinning Chair");

    expect(result).toBe(false);
  });

  test("articles should remain array", () => {
    expect(Array.isArray(warehouseService.getArticles())).toBe(true);
  });

  test("products should remain array", () => {
    expect(Array.isArray(warehouseService.getProducts())).toBe(true);
  });

  test("should return false if required article does not exist", () => {
    const products = warehouseService.getProducts();

    products.push({
      name: "Fake Product",
      contain_articles: [{ art_id: "999", amount_of: 2 }],
      price: 0
    } as any);

    expect(warehouseService.canProductBeMade("Fake Product")).toBe(false);
  });

  test("should return false if one article has insufficient stock", () => {
    const article = warehouseService.getArticles().find(a => a.art_id === "1");

    if (article) article.stock = 0;

    expect(warehouseService.canProductBeMade("Dinning Chair")).toBe(false);
  });

  test("should not throw but return false for broken product reduction", () => {
    const products = warehouseService.getProducts();

    products.push({
      name: "Broken Product",
      contain_articles: [{ art_id: "999", amount_of: 1 }],
      price: 0
    } as any);

    expect(warehouseService.reduceStockForProduct("Broken Product")).toBe(false);
  });

  test("should reduce multiple related article stocks correctly", () => {
    warehouseService.reduceStockForProduct("Dinning Chair");

    const articles = warehouseService.getArticles();

    expect(articles.find(a => a.art_id === "1")?.stock).toBeLessThan(12);
    expect(articles.find(a => a.art_id === "2")?.stock).toBeLessThanOrEqual(17);
    expect(articles.find(a => a.art_id === "3")?.stock).toBeLessThanOrEqual(2);
  });

  test("should restore stock correctly", () => {
    warehouseService.reduceStockForProduct("Dinning Chair");

    const reduced = warehouseService.getArticles().find(a => a.art_id === "1")?.stock;
    expect(reduced).toBe(8);

    const result = warehouseService.restoreStockForProduct("Dinning Chair");

    const restored = warehouseService.getArticles().find(a => a.art_id === "1")?.stock;

    expect(result).toBe(true);
    expect(restored).toBe(12);
  });

  test("should return false when restoring non-existing product", () => {
    expect(warehouseService.restoreStockForProduct("Unknown Product")).toBe(false);
  });

  test("should restore multiple articles correctly", () => {
    warehouseService.reduceStockForProduct("Dinning Chair");
    warehouseService.restoreStockForProduct("Dinning Chair");

    const articles = warehouseService.getArticles();

    expect(articles.find(a => a.art_id === "1")?.stock).toBe(12);
    expect(articles.find(a => a.art_id === "2")?.stock).toBe(17);
    expect(articles.find(a => a.art_id === "3")?.stock).toBe(2);
  });
});

import { WarehouseService } from "../src/services/warehouseService";
  
describe("WarehouseService", () => {
  let warehouseService: WarehouseService;

  beforeEach(() => {
    warehouseService = new WarehouseService();
    warehouseService.loadArticlesFromFile("./inventory.json");
    warehouseService.loadProductsFromFile("./products.json");
  });

  it("should load articles and products correctly", () => {
    expect(warehouseService.getArticles().length).toBeGreaterThan(0);
    expect(warehouseService.getProducts().length).toBeGreaterThan(0);
  });

  it("should verify if a product can be made", () => {
    expect(warehouseService.canProductBeMade("Dining Chair")).toBe(true);
  });

  it("should reduce stock when a product is made", () => {
    warehouseService.reduceStockForProduct("Dining Chair");
    const articles = warehouseService.getArticles();
    const leg = articles.find((a) => a.art_id === "1");
    expect(leg?.stock).toBe(8); // Assuming initial stock of 12
  });

  it("should throw an error if product cannot be made", () => {
    expect(() => warehouseService.reduceStockForProduct("Nonexistent Product")).toThrowError();
  });
});
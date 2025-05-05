"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const warehouseService_1 = require("./services/warehouseService");
const warehouseService = new warehouseService_1.WarehouseService();
// Load data
warehouseService.loadArticlesFromFile("./inventory.json");
warehouseService.loadProductsFromFile("./products.json");
// Display initial data
console.log("Articles:", warehouseService.getArticles());
console.log("Products:", warehouseService.getProducts());
/**
 * Attempts to create a product and logs the result.
 * @param productName - The name of the product to create.
 */
function createProduct(productName) {
    if (warehouseService.canProductBeMade(productName)) {
        console.log(`'${productName}' can be made.`);
        warehouseService.reduceStockForProduct(productName);
        console.log(`Stock updated after creating: '${productName}'.`);
    }
    else {
        console.log(`'${productName}' cannot be made due to insufficient stock.`);
    }
}
// Process products
["Dining Chair", "Dinning Table", "Dinning Table"].forEach(createProduct);
// Display updated data
console.log("Updated Articles:", warehouseService.getArticles());

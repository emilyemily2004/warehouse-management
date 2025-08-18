"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const fs_1 = __importDefault(require("fs"));
class WarehouseService {
    constructor() {
        this.articles = [];
        this.products = [];
    }
    loadArticlesFromFile(filePath) {
        const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
        this.articles = data.inventory.map((item) => ({
            art_id: item.art_id,
            name: item.name,
            stock: parseInt(item.stock, 10),
        }));
    }
    loadProductsFromFile(filePath) {
        const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
        this.products = data.products.map((product) => ({
            name: product.name,
            contain_articles: product.contain_articles.map((article) => ({
                art_id: article.art_id,
                amount_of: parseInt(article.amount_of, 10),
            })),
            price: 0,
        }));
    }
    getArticles() {
        return this.articles;
    }
    getProducts() {
        return this.products;
    }
    canProductBeMade(productName) {
        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (!product)
            return null; // Product not found
        return product.contain_articles.every((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            return article && article.stock >= pa.amount_of;
        });
    }
    reduceStockForProduct(productName) {
        const canMake = this.canProductBeMade(productName);
        if (canMake === null)
            return false; // Product not found
        if (!canMake)
            return false; // Insufficient stock
        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        product === null || product === void 0 ? void 0 : product.contain_articles.forEach((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            if (article)
                article.stock -= pa.amount_of;
        });
        return true;
    }
    restoreStockForProduct(productName) {
        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (!product)
            return false; // Product not found
        product.contain_articles.forEach((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            if (article)
                article.stock += pa.amount_of;
        });
        return true;
    }
}
exports.WarehouseService = WarehouseService;

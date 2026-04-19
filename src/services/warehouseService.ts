import { Article } from "../models/article";
import { Product } from "../models/product";
import fs from "fs";

export class WarehouseService {
    private articles: Article[] = [];
    private products: Product[] = [];

    loadArticlesFromFile(filePath: string): void {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        this.articles = data.inventory.map((item: any) => ({
            art_id: item.art_id,
            name: item.name,
            stock: parseInt(item.stock, 10),
        }));
    }

    loadProductsFromFile(filePath: string): void {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        this.products = data.products.map((product: any) => ({
            name: product.name,
            contain_articles: product.contain_articles.map((article: any) => ({
                art_id: article.art_id,
                amount_of: parseInt(article.amount_of, 10),
            })),
            price: 0,
        }));
    }

    getArticles(): Article[] {
        return this.articles;
    }

    getProducts(): Product[] {
        return this.products;
    }

    canProductBeMade(productName: string): boolean | null {
        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) return null; // Product not found

        return product.contain_articles.every((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            return article && article.stock >= pa.amount_of;
        });
    }

    reduceStockForProduct(productName: string): boolean {
        const canMake = this.canProductBeMade(productName);
        if (canMake === null) throw new Error(`Product "${productName}" not found`); // Product not found
        if (!canMake) return false; // Insufficient stock

        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        product?.contain_articles.forEach((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            if (article) article.stock -= pa.amount_of;
        });
        return true;
    }

    restoreStockForProduct(productName: string): boolean {
        const product = this.products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) return false; // Product not found

        product.contain_articles.forEach((pa) => {
            const article = this.articles.find((a) => a.art_id === pa.art_id);
            if (article) article.stock += pa.amount_of;
        });
        return true;
    }
}
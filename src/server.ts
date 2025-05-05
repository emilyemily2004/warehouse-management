import express from "express";
import dotenv from "dotenv"; // Import dotenv
import createProductRouter from "./routes/productRoutes";
import createArticleRouter from "./routes/articleRoutes";
import { WarehouseService } from "./services/warehouseService";
import { setupSwagger } from "./swaggerConfig"; // Import Swagger setup
import { connect } from "http2";
import { connectDB } from "./database";

// Load environment variables
dotenv.config();

// Connect to MongoDB
// connectDB();

const app = express();
const port = process.env.PORT || 3000;
const warehouseService = new WarehouseService();

app.use(express.json());

// Disable caching globally
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});

// Load warehouse data using environment variables
const inventoryFile = process.env.INVENTORY_FILE || "./inventory.json";
const productsFile = process.env.PRODUCTS_FILE || "./products.json";

warehouseService.loadArticlesFromFile(inventoryFile);
warehouseService.loadProductsFromFile(productsFile);

// Pass the same instance to routers
app.use("/products", createProductRouter(warehouseService));
app.use("/articles", createArticleRouter(warehouseService));

// Setup Swagger
setupSwagger(app);

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server started at http://localhost:${port}
        Swagger => http://localhost:${port}/api-docs`);
});

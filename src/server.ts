import express from "express";
import dotenv from "dotenv"; // Import dotenv
import cors from "cors";
import createProductRouter from "./routes/productRoutes";
import createArticleRouter from "./routes/articleRoutes";
import createAuthRouter from "./routes/authRoutes";
import { WarehouseService } from "./services/warehouseService";
import { setupSwagger } from "./swaggerConfig"; // Import Swagger setup
import { db } from "./database/dbService";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const warehouseService = new WarehouseService();

// Middleware
app.use(cors());
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

// Routes
app.use("/auth", createAuthRouter());
app.use("/products", createProductRouter(warehouseService));
app.use("/articles", createArticleRouter(warehouseService));

// Setup Swagger
setupSwagger(app);

// Test database connection and start server
const startServer = async () => {
    try {
        // Test database connection
        await db.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        
        // Start the server
        app.listen(port, () => {
            console.log(`🚀 Server started at http://localhost:${port}`);
            console.log(`📄 Swagger => http://localhost:${port}/api-docs`);
            console.log(`🎨 Frontend => http://localhost:3001 (after running 'cd frontend && npm start')`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('Make sure PostgreSQL is running via docker-compose up postgres');
        process.exit(1);
    }
};

startServer();

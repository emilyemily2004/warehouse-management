"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv")); // Import dotenv
const cors_1 = __importDefault(require("cors"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const warehouseService_1 = require("./services/warehouseService");
const swaggerConfig_1 = require("./swaggerConfig"); // Import Swagger setup
const dbService_1 = require("./database/dbService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const warehouseService = new warehouseService_1.WarehouseService();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use("/auth", (0, authRoutes_1.default)());
app.use("/products", (0, productRoutes_1.default)(warehouseService));
app.use("/articles", (0, articleRoutes_1.default)(warehouseService));
// Setup Swagger
(0, swaggerConfig_1.setupSwagger)(app);
// Test database connection and start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield dbService_1.db.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        // Start the server
        app.listen(port, () => {
            console.log(`🚀 Server started at http://localhost:${port}`);
            console.log(`📄 Swagger => http://localhost:${port}/api-docs`);
            console.log(`🎨 Frontend => http://localhost:3001 (after running 'cd frontend && npm start')`);
        });
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('Make sure PostgreSQL is running via docker-compose up postgres');
        process.exit(1);
    }
});
startServer();

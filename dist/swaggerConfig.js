"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Swagger Definition
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Warehouse Management API",
            version: "1.0.0",
            description: "API documentation for Warehouse Management System with Authentication",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        tags: [
            {
                name: "Authentication",
                description: "User authentication and authorization",
            },
            {
                name: "Products",
                description: "Product management operations",
            },
            {
                name: "Articles",
                description: "Article inventory operations",
            },
        ],
    },
    apis: ["./src/routes/*.ts"], // Path to the API docs
};
// Initialize swagger-jsdoc
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Function to setup Swagger
function setupSwagger(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customSiteTitle: "Warehouse Management API",
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
        },
    }));
    console.log("📄 Swagger documentation available at http://localhost:3000/api-docs");
}

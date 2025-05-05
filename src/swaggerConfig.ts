import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Swagger Definition
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Warehouse Management API",
            version: "1.0.0",
            description: "API documentation for Warehouse Management System",
        },
    },
    apis: ["./src/routes/*.ts"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Function to setup Swagger
export function setupSwagger(app: Express) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📄 Swagger documentation available at http://localhost:3000/api-docs");
}

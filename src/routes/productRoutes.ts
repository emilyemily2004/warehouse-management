import express from "express";
import { WarehouseService } from "../services/warehouseService";

export default function createProductRouter(warehouseService: WarehouseService) {
    const router = express.Router();

    // Disable caching
    router.use((req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        next();
    });

    /**
     * @swagger
     * /products:
     *   get:
     *     summary: Get all products
     *     description: Returns a list of all available products
     *     responses:
     *       200:
     *         description: A list of products
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    router.get("/", (req, res) => {
        res.json(warehouseService.getProducts());
    });

    /**
     * @swagger
     * /products/{productName}/canBeMade:
     *   get:
     *     summary: Check if a product can be made
     *     description: Returns `true` if the product can be made, `false` otherwise.
     *     parameters:
     *       - in: path
     *         name: productName
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the product to check
     *     responses:
     *       200:
     *         description: True if product can be made, false otherwise
     *         content:
     *           application/json:
     *             schema:
     *               type: boolean
     */
    router.get("/:productName/canBeMade", (req, res) => {
        try {
            const productName = req.params.productName;
            res.json(warehouseService.canProductBeMade(productName));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            res.status(404).send(errorMessage);
        }
    });

    /**
     * @swagger
     * /products/{productName}/create:
     *   post:
     *     summary: Create a product and reduce stock
     *     description: Attempts to create a product and updates stock accordingly.
     *     parameters:
     *       - in: path
     *         name: productName
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the product to create
     *     responses:
     *       200:
     *         description: Stock updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *       400:
     *         description: Product cannot be made due to insufficient stock
     *       500:
     *         description: Internal server error
     */
    router.post("/:productName/create", (req, res) => {
        try {
            const productName = req.params.productName;
            
            if (warehouseService.canProductBeMade(productName)) {
                console.log(`'${productName}' can be made.`);
                warehouseService.reduceStockForProduct(productName);
                res.status(200).send(`Stock updated after creating: '${productName}'`);
            } else {
                res.status(400).send(`'${productName}' cannot be made due to insufficient stock.`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            res.status(500).send(errorMessage);
        }
    });

    return router;
}

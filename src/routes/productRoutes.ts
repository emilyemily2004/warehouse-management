import express, { Request, Response } from "express";
import { WarehouseService } from "../services/warehouseService";
import { AuthMiddleware } from "../middleware/authMiddleware";

export default function createProductRouter(warehouseService: WarehouseService) {
    const router = express.Router();
    const authMiddleware = new AuthMiddleware();

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
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of products
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *       401:
     *         description: Unauthorized
     */
    router.get("/", authMiddleware.authenticateToken, authMiddleware.requireUser, (req: Request, res: Response) => {
        res.json(warehouseService.getProducts());
    });

    /**
     * @swagger
     * /products/{productName}/canBeMade:
     *   get:
     *     summary: Check if a product can be made
     *     description: Returns `true` if the product can be made, `false` otherwise.
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: productName
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the product to check (e.g., Dinning Chair or Dinning Table)
     *     responses:
     *       200:
     *         description: True if product can be made, false otherwise
     *         content:
     *           application/json:
     *             schema:
     *               type: boolean
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Product not found
     */
    router.get("/:productName/canBeMade", authMiddleware.authenticateToken, authMiddleware.requireUser, (req: Request, res: Response) => {
        try {
            const productName = req.params.productName;
            console.log("Received productName:", productName);
            
            const canBeMade = warehouseService.canProductBeMade(productName);
            if (canBeMade === null) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            
            res.json(canBeMade);
        } catch (error) {
            console.error('Can be made route error:', error);
            res.status(500).json({ error: "Failed to check product availability" });
        }
    });

    /**
     * @swagger
     * /products/{productName}/create:
     *   post:
     *     summary: Create a product and reduce stock
     *     description: Attempts to create a product and updates stock accordingly.
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: productName
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the product to create (e.g., Dinning Chair or Dinning Table)
     *     responses:
     *       200:
     *         description: Stock updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *       400:
     *         description: Product cannot be made due to insufficient stock
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    router.post("/:productName/create", authMiddleware.authenticateToken, authMiddleware.requireAdmin, (req: Request, res: Response) => {
        try {
            const productName = req.params.productName;
            
            const canBeMade = warehouseService.canProductBeMade(productName);
            if (canBeMade === null) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            
            if (canBeMade) {
                console.log(`'${productName}' can be made.`);
                const success = warehouseService.reduceStockForProduct(productName);
                if (success) {
                    res.status(200).json({ message: `Stock updated after creating: '${productName}'` });
                } else {
                    res.status(500).json({ error: "Failed to update stock" });
                }
            } else {
                res.status(400).json({ error: `'${productName}' cannot be made due to insufficient stock.` });
            }
        } catch (error) {
            console.error('Create product route error:', error);
            res.status(500).json({ error: "Failed to create product" });
        }
    });

    /**
     * @swagger
     * /products/{productName}/delete:
     *   post:
     *     summary: Delete a product and restore stock
     *     description: Restores the articles back to inventory when a product is deleted.
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: productName
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the product to delete (e.g., Dinning Chair or Dinning Table)
     *     responses:
     *       200:
     *         description: Stock restored successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Product not found
     *       500:
     *         description: Internal server error
     */
    router.post("/:productName/delete", authMiddleware.authenticateToken, authMiddleware.requireAdmin, (req: Request, res: Response) => {
        try {
            const productName = req.params.productName;
            
            const success = warehouseService.restoreStockForProduct(productName);
            if (success) {
                res.status(200).json({ message: `Stock restored after deleting: '${productName}'` });
            } else {
                res.status(404).json({ error: "Product not found" });
            }
        } catch (error) {
            console.error('Delete product route error:', error);
            res.status(500).json({ error: "Failed to delete product" });
        }
    });

    return router;
}

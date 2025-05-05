import express from "express";
import { WarehouseService } from "../services/warehouseService";

export default function createArticleRouter(warehouseService: WarehouseService) {
    const router = express.Router();

    // Disable caching
    router.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });

    /**
     * @swagger
     * /articles:
     *   get:
     *     summary: Get all articles
     *     description: Returns a list of all available articles
     *     responses:
     *       200:
     *         description: A list of articles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    router.get("/", (req, res) => {
        res.json(warehouseService.getArticles());
    });

    return router;
}

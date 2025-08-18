"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createArticleRouter;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
function createArticleRouter(warehouseService) {
    const router = express_1.default.Router();
    const authMiddleware = new authMiddleware_1.AuthMiddleware();
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
     *     description: Returns a list of all available articles in the warehouse
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of articles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   art_id:
     *                     type: string
     *                   name:
     *                     type: string
     *                   stock:
     *                     type: integer
     *       401:
     *         description: Unauthorized
     */
    router.get("/", authMiddleware.authenticateToken, authMiddleware.requireUser, (req, res) => {
        res.json(warehouseService.getArticles());
    });
    return router;
}

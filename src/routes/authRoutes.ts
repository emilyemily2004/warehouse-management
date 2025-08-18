import express, { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthMiddleware } from "../middleware/authMiddleware";

export default function createAuthRouter() {
    const router = express.Router();
    const authService = new AuthService();
    const authMiddleware = new AuthMiddleware();

    /**
     * @swagger
     * components:
     *   securitySchemes:
     *     bearerAuth:
     *       type: http
     *       scheme: bearer
     *       bearerFormat: JWT
     *   schemas:
     *     UserRegistration:
     *       type: object
     *       required:
     *         - username
     *         - email
     *         - password
     *       properties:
     *         username:
     *           type: string
     *           description: Unique username
     *         email:
     *           type: string
     *           format: email
     *           description: User email address
     *         password:
     *           type: string
     *           minLength: 6
     *           description: User password
     *     UserLogin:
     *       type: object
     *       required:
     *         - username
     *         - password
     *       properties:
     *         username:
     *           type: string
     *           description: Username
     *         password:
     *           type: string
     *           description: User password
     *     UserResponse:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *         username:
     *           type: string
     *         email:
     *           type: string
     *         role:
     *           type: string
     *         created_at:
     *           type: string
     *           format: date-time
     *     AuthResponse:
     *       type: object
     *       properties:
     *         user:
     *           $ref: '#/components/schemas/UserResponse'
     *         token:
     *           type: string
     *           description: JWT token
     */

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserRegistration'
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       400:
     *         description: Registration failed
     */
    router.post("/register", async (req: Request, res: Response) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                res.status(400).json({ error: "Username, email, and password are required" });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({ error: "Password must be at least 6 characters long" });
                return;
            }

            const result = await authService.register({ username, email, password });
            if (!result.success) {
                res.status(400).json({ error: result.error });
                return;
            }

            res.status(201).json(result.data);
        } catch (error) {
            console.error('Registration route error:', error);
            res.status(500).json({ error: "Registration failed" });
        }
    });

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserLogin'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       401:
     *         description: Invalid credentials
     */
    router.post("/login", async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({ error: "Username and password are required" });
                return;
            }

            const result = await authService.login({ username, password });
            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }

            res.json(result.data);
        } catch (error) {
            console.error('Login route error:', error);
            res.status(500).json({ error: "Login failed" });
        }
    });

    /**
     * @swagger
     * /auth/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       401:
     *         description: Unauthorized
     */
    router.get("/profile", authMiddleware.authenticateToken, async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "User not found" });
                return;
            }

            const user = await authService.findUserById(userId);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            };

            res.json(userResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to get profile";
            res.status(500).json({ error: errorMessage });
        }
    });

    return router;
}

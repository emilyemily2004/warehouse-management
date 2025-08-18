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
exports.default = createAuthRouter;
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const authMiddleware_1 = require("../middleware/authMiddleware");
function createAuthRouter() {
    const router = express_1.default.Router();
    const authService = new authService_1.AuthService();
    const authMiddleware = new authMiddleware_1.AuthMiddleware();
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
    router.post("/register", (req, res) => __awaiter(this, void 0, void 0, function* () {
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
            const user = yield authService.register({ username, email, password });
            res.status(201).json(user);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Registration failed";
            res.status(400).json({ error: errorMessage });
        }
    }));
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
    router.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: "Username and password are required" });
                return;
            }
            const result = yield authService.login({ username, password });
            res.json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Login failed";
            res.status(401).json({ error: errorMessage });
        }
    }));
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
    router.get("/profile", authMiddleware.authenticateToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                res.status(401).json({ error: "User not found" });
                return;
            }
            const user = yield authService.findUserById(userId);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to get profile";
            res.status(500).json({ error: errorMessage });
        }
    }));
    return router;
}

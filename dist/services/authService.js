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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbService_1 = require("../database/dbService");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = userData;
            try {
                // Check if user already exists
                const existingUser = yield this.findUserByUsername(username);
                if (existingUser) {
                    return { success: false, error: 'Username already exists' };
                }
                const existingEmail = yield this.findUserByEmail(email);
                if (existingEmail) {
                    return { success: false, error: 'Email already exists' };
                }
                // Hash password
                const saltRounds = 10;
                const passwordHash = yield bcryptjs_1.default.hash(password, saltRounds);
                // Insert user
                const query = `
                INSERT INTO users (username, email, password_hash, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email, role, created_at
            `;
                const result = yield dbService_1.db.query(query, [username, email, passwordHash, 'user']);
                return { success: true, data: result.rows[0] };
            }
            catch (error) {
                console.error('Registration error:', error);
                return { success: false, error: 'Registration failed' };
            }
        });
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = credentials;
            try {
                // Find user
                const user = yield this.findUserByUsername(username);
                if (!user) {
                    return { success: false, error: 'Invalid credentials' };
                }
                // Verify password
                const isValidPassword = yield bcryptjs_1.default.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return { success: false, error: 'Invalid credentials' };
                }
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
                const userResponse = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at
                };
                return {
                    success: true,
                    data: { user: userResponse, token }
                };
            }
            catch (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Login failed' };
            }
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT * FROM users WHERE username = $1';
                const result = yield dbService_1.db.query(query, [username]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Find user by username error:', error);
                return null;
            }
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT * FROM users WHERE email = $1';
                const result = yield dbService_1.db.query(query, [email]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Find user by email error:', error);
                return null;
            }
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT * FROM users WHERE id = $1';
                const result = yield dbService_1.db.query(query, [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                console.error('Find user by id error:', error);
                return null;
            }
        });
    }
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                return { success: true, data: decoded };
            }
            catch (error) {
                console.error('Token verification error:', error);
                return { success: false, error: 'Invalid token' };
            }
        });
    }
}
exports.AuthService = AuthService;

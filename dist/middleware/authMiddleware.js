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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const authService_1 = require("../services/authService");
class AuthMiddleware {
    constructor() {
        // Middleware to verify JWT token
        this.authenticateToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
            if (!token) {
                res.status(401).json({ error: 'Access token required' });
                return;
            }
            try {
                const decoded = this.authService.verifyToken(token);
                req.user = {
                    userId: decoded.userId,
                    username: decoded.username,
                    role: decoded.role
                };
                next();
            }
            catch (error) {
                res.status(403).json({ error: 'Invalid or expired token' });
                return;
            }
        });
        // Middleware to check if user has admin role
        this.requireAdmin = (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            if (req.user.role !== 'admin') {
                res.status(403).json({ error: 'Admin access required' });
                return;
            }
            next();
        };
        // Middleware to check if user has user or admin role
        this.requireUser = (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            if (!['user', 'admin'].includes(req.user.role)) {
                res.status(403).json({ error: 'User access required' });
                return;
            }
            next();
        };
        this.authService = new authService_1.AuthService();
    }
}
exports.AuthMiddleware = AuthMiddleware;

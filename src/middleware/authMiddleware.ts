import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                username: string;
                role: string;
            };
        }
    }
}

export class AuthMiddleware {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Middleware to verify JWT token
    authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        } catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
    };

    // Middleware to check if user has admin role
    requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
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
    requireUser = (req: Request, res: Response, next: NextFunction): void => {
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
}

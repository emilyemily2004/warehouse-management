import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/dbService';
import { User, UserRegistration, UserLogin, UserResponse } from '../models/user';

export class AuthService {
    private jwtSecret: string;
    private jwtExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    async register(userData: UserRegistration): Promise<UserResponse> {
        const { username, email, password } = userData;

        // Check if user already exists
        const existingUser = await this.findUserByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const existingEmail = await this.findUserByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user
        const query = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at
        `;
        const result = await db.query(query, [username, email, passwordHash, 'user']);
        
        return result.rows[0];
    }

    async login(credentials: UserLogin): Promise<{ user: UserResponse; token: string }> {
        const { username, password } = credentials;

        // Find user
        const user = await this.findUserByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
        );

        const userResponse: UserResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };

        return { user: userResponse, token };
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0] || null;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    }

    async findUserById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

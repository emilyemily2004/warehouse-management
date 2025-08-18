import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/dbService';
import { User, UserRegistration, UserLogin, UserResponse, AuthResult, LoginResult } from '../models/user';

export class AuthService {
    private jwtSecret: string;
    private jwtExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    async register(userData: UserRegistration): Promise<AuthResult<UserResponse>> {
        const { username, email, password } = userData;

        try {
            // Check if user already exists
            const existingUser = await this.findUserByUsername(username);
            if (existingUser) {
                return { success: false, error: 'Username already exists' };
            }

            const existingEmail = await this.findUserByEmail(email);
            if (existingEmail) {
                return { success: false, error: 'Email already exists' };
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
            
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed' };
        }
    }

    async login(credentials: UserLogin): Promise<AuthResult<LoginResult>> {
        const { username, password } = credentials;

        try {
            // Find user
            const user = await this.findUserByUsername(username);
            if (!user) {
                return { success: false, error: 'Invalid credentials' };
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return { success: false, error: 'Invalid credentials' };
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

            return { 
                success: true, 
                data: { user: userResponse, token } 
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    async findUserByUsername(username: string): Promise<User | null> {
        try {
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await db.query(query, [username]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Find user by username error:', error);
            return null;
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [email]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Find user by email error:', error);
            return null;
        }
    }

    async findUserById(id: number): Promise<User | null> {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Find user by id error:', error);
            return null;
        }
    }

    async verifyToken(token: string): Promise<AuthResult<any>> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return { success: true, data: decoded };
        } catch (error) {
            console.error('Token verification error:', error);
            return { success: false, error: 'Invalid token' };
        }
    }
}

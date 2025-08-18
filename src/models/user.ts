export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'user';
    created_at: Date;
    updated_at: Date;
}

export interface UserRegistration {
    username: string;
    email: string;
    password: string;
}

export interface UserLogin {
    username: string;
    password: string;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: Date;
}

export interface AuthResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface LoginResult {
    user: UserResponse;
    token: string;
}

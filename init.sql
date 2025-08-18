-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@warehouse.com', '$2b$10$GTkFXXk7whyq.4R38KaJ6.vzx8Cy0wot9xktbWZFMn8evv0K38dF2', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default regular user (password: user123)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('user', 'user@warehouse.com', '$2b$10$Irolblidgk5m0uyh6RWLyeID5wih/1heaPogNJuEIlwhN7m52DaJe', 'user')
ON CONFLICT (username) DO NOTHING;

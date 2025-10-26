-- User Service Database Initialization

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (email, username, password_hash, first_name, last_name)
VALUES
    ('john.doe@example.com', 'johndoe', '$2b$10$hash1', 'John', 'Doe'),
    ('jane.smith@example.com', 'janesmith', '$2b$10$hash2', 'Jane', 'Smith'),
    ('bob.wilson@example.com', 'bobwilson', '$2b$10$hash3', 'Bob', 'Wilson')
ON CONFLICT (email) DO NOTHING;

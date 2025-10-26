-- Product Service Database Initialization

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO products (name, description, price, stock_quantity, category)
VALUES
    ('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 50, 'Electronics'),
    ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200, 'Accessories'),
    ('USB-C Hub', '7-in-1 USB-C hub adapter', 49.99, 150, 'Accessories'),
    ('Monitor 27"', '4K Ultra HD monitor', 399.99, 75, 'Electronics')
ON CONFLICT DO NOTHING;

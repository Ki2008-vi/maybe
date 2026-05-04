-- SQL Schema for SNSB World Admin & User Management

-- Create Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('user') ON DUPLICATE KEY UPDATE name=name;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Matches Firebase UID
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    photo_url TEXT,
    role_id INT DEFAULT 2, -- Default to 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('In Stock', 'Sold Out') DEFAULT 'In Stock',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_price DECIMAL(15, 2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    size VARCHAR(20),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Example Query to get all orders for Admin
-- SELECT o.*, u.display_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC;

-- Railway database schema for prodX

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  lowStockThreshold DECIMAL(10,2) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  materialId INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (materialId) REFERENCES materials(id) ON DELETE CASCADE
);

-- Production logs table
CREATE TABLE IF NOT EXISTS production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  quantityProduced DECIMAL(10,2) NOT NULL,
  materialCost DECIMAL(10,2) NOT NULL,
  additionalExpense DECIMAL(10,2) NOT NULL DEFAULT 0,
  totalCost DECIMAL(10,2) GENERATED ALWAYS AS (materialCost + additionalExpense) STORED,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

-- Unit of Measures table
CREATE TABLE IF NOT EXISTS unit_of_measures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber VARCHAR(50) NOT NULL UNIQUE,
  supplierId INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchaseOrderId INT NOT NULL,
  materialId INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  totalPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (materialId) REFERENCES materials(id)
);

-- Add columns to materials table
ALTER TABLE materials ADD COLUMN categoryId INT;
ALTER TABLE materials ADD COLUMN uomId INT;
ALTER TABLE materials ADD FOREIGN KEY (categoryId) REFERENCES categories(id);
ALTER TABLE materials ADD FOREIGN KEY (uomId) REFERENCES unit_of_measures(id);

-- Add columns to recipes table
ALTER TABLE recipes ADD COLUMN categoryId INT;
ALTER TABLE recipes ADD FOREIGN KEY (categoryId) REFERENCES categories(id);

-- Add columns to production_logs table
ALTER TABLE production_logs ADD COLUMN customerId INT;
ALTER TABLE production_logs ADD COLUMN batchNumber VARCHAR(50);
ALTER TABLE production_logs ADD COLUMN status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE production_logs ADD FOREIGN KEY (customerId) REFERENCES customers(id);

-- Insert a default admin user (password: admin123) - plain text for testing
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Insert some sample materials
INSERT INTO materials (name, unit, quantity, unitPrice, lowStockThreshold) VALUES
('Flour', 'kg', 200, 120, 50),
('Sugar', 'kg', 100, 140, 30),
('Salt', 'kg', 50, 20, 10),
('Oil', 'l', 30, 150, 5),
('Yeast', 'g', 500, 0.5, 100)
ON DUPLICATE KEY UPDATE name = name;

-- Insert a sample recipe
INSERT INTO recipes (name, category) VALUES
('Bread', 'Bakery')
ON DUPLICATE KEY UPDATE name = name;
-- Create database
CREATE DATABASE IF NOT EXISTS admin_pims;

-- Use the database
USE admin_pims;

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
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unitPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
  lowStockThreshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  costPerUnit DECIMAL(10, 2) GENERATED ALWAYS AS ((
    SELECT SUM(ri.quantity * m.unitPrice)
    FROM recipe_ingredients ri
    JOIN materials m ON ri.materialId = m.id
    WHERE ri.recipeId = recipes.id
  )) STORED,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  materialId INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (materialId) REFERENCES materials(id) ON DELETE CASCADE
);

-- Production logs table
CREATE TABLE IF NOT EXISTS production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  quantityProduced DECIMAL(10, 2) NOT NULL,
  materialCost DECIMAL(10, 2) NOT NULL,
  additionalExpense DECIMAL(10, 2) NOT NULL DEFAULT 0,
  totalCost DECIMAL(10, 2) GENERATED ALWAYS AS (materialCost + additionalExpense) STORED,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

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

-- Get the recipe ID
SET @recipe_id = (SELECT id FROM recipes WHERE name = 'Bread' LIMIT 1);

-- Insert ingredients for the recipe
INSERT INTO recipe_ingredients (recipeId, materialId, quantity) VALUES
(@recipe_id, (SELECT id FROM materials WHERE name = 'Flour'), 1),
(@recipe_id, (SELECT id FROM materials WHERE name = 'Sugar'), 0.1),
(@recipe_id, (SELECT id FROM materials WHERE name = 'Salt'), 0.02),
(@recipe_id, (SELECT id FROM materials WHERE name = 'Oil'), 0.1),
(@recipe_id, (SELECT id FROM materials WHERE name = 'Yeast'), 10)
ON DUPLICATE KEY UPDATE recipeId = recipeId;
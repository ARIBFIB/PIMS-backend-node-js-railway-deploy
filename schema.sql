-- Create database
CREATE DATABASE IF NOT EXISTS prodx;
USE prodx;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'viewer') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  min_stock_level INT DEFAULT 10,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Work orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  assigned_to INT,
  due_date DATE NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Work order items table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS work_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_order_id INT NOT NULL,
  inventory_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: Admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@prodx.com', '$2a$10$eUWnZx8Xz6wDQDPJ.8hWP.QxZFxKGN5KvBXCqRqTqXKl3Y0PZJp0C', 'admin');

-- Insert sample staff user (password: Staff123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Staff User', 'staff@prodx.com', '$2a$10$J5mJl5f8K8K5K5K5K5K5KuqYnQJ5mJl5f8K8K5K5K5K5K5Ke', 'staff');


-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  prep_time INT NOT NULL DEFAULT 15,
  cook_time INT NOT NULL DEFAULT 30,
  servings INT NOT NULL DEFAULT 4,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  instructions JSON,
  ingredients JSON NOT NULL,
  additional_costs JSON,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_ingredient_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cost_per_serving DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  inventory_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Additional costs table
CREATE TABLE IF NOT EXISTS recipe_additional_costs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'fixed',
  applies_to ENUM('total', 'per_item') NOT NULL DEFAULT 'total',
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Recipe views for common queries
CREATE OR REPLACE VIEW recipe_details AS
SELECT 
  r.*,
  u.name as created_by_name,
  u.email as created_by_email,
  u2.name as updated_by_name,
  u2.email as updated_by_email
FROM recipes r
LEFT JOIN users u ON r.created_by = u.id
LEFT JOIN users u2 ON r.updated_by = u2.id;

CREATE OR REPLACE VIEW recipe_with_costs AS
SELECT 
  r.*,
  (r.total_cost / r.servings) as calculated_cost_per_serving,
  (SELECT COALESCE(SUM(ac.amount), 0) FROM recipe_additional_costs ac WHERE ac.recipe_id = r.id AND ac.applies_to = 'total') as additional_fixed_costs,
  (SELECT COALESCE(SUM(ac.amount * r.total_ingredient_cost / 100), 0) FROM recipe_additional_costs ac WHERE ac.recipe_id = r.id AND ac.type = 'percentage') as additional_percentage_costs
FROM recipes r;
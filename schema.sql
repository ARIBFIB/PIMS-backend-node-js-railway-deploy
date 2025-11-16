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
  role ENUM('admin', 'manager', 'operator') NOT NULL DEFAULT 'operator',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Role-Permission mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roleId INT NOT NULL,
  permissionId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (roleId, permissionId)
);

-- User-Role mapping table (for multiple roles per user)
CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  roleId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (userId, roleId)
);

-- User-Permission mapping table (for custom permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  permissionId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (userId, permissionId)
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemCode VARCHAR(100) NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
  unitPrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
  lowStockThreshold DECIMAL(10, 3) NOT NULL DEFAULT 0,
  categoryId INT,
  uomId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Unit of Measures table
CREATE TABLE IF NOT EXISTS unit_of_measures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255),
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
  contactPerson VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  recipeUnit VARCHAR(50) DEFAULT 'unit',
  categoryId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Recipe Ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  materialId INT NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  uomId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (materialId) REFERENCES materials(id),
  FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplierId INT NOT NULL,
  orderDate DATE NOT NULL,
  expectedDeliveryDate DATE,
  status ENUM('pending', 'received', 'cancelled') NOT NULL DEFAULT 'pending',
  totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchaseOrderId INT NOT NULL,
  materialId INT NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  unitPrice DECIMAL(10, 2) NOT NULL,
  uomId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (materialId) REFERENCES materials(id),
  FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
);

-- Production Logs table
CREATE TABLE IF NOT EXISTS production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipeId INT NOT NULL,
  quantityProduced DECIMAL(10, 3) NOT NULL,
  materialCost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  additionalExpense DECIMAL(10, 2) NOT NULL DEFAULT 0,
  totalCost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  customerId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id),
  FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES 
('admin', 'Administrator with full access'),
('manager', 'Manager with operational access'),
('operator', 'Operator with limited access');

-- Insert default permissions
INSERT IGNORE INTO permissions (name, description) VALUES 
('view_materials', 'View materials'),
('create_materials', 'Create materials'),
('edit_materials', 'Edit materials'),
('delete_materials', 'Delete materials'),
('view_recipes', 'View recipes'),
('create_recipes', 'Create recipes'),
('edit_recipes', 'Edit recipes'),
('delete_recipes', 'Delete recipes'),
('view_production', 'View production logs'),
('create_production', 'Create production logs'),
('approve_production', 'Approve production logs'),
('view_purchase_orders', 'View purchase orders'),
('create_purchase_orders', 'Create purchase orders'),
('edit_purchase_orders', 'Edit purchase orders'),
('delete_purchase_orders', 'Delete purchase orders'),
('view_reports', 'View reports'),
('view_users', 'View users'),
('create_users', 'Create users'),
('edit_users', 'Edit users'),
('delete_users', 'Delete users'),
('manage_roles', 'Manage roles and permissions');

-- Assign all permissions to admin role
INSERT IGNORE INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin';

-- Assign operational permissions to manager role
INSERT IGNORE INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'manager' 
AND p.name IN ('view_materials', 'create_materials', 'edit_materials', 'view_recipes', 'create_recipes', 'edit_recipes', 'view_production', 'create_production', 'view_purchase_orders', 'create_purchase_orders', 'edit_purchase_orders', 'view_reports');

-- Assign basic permissions to operator role
INSERT IGNORE INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'operator' 
AND p.name IN ('view_materials', 'view_recipes', 'view_production', 'view_purchase_orders', 'view_reports');
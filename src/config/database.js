// Script to initialize admin_pims database and tables
const mysql = require("mysql2/promise");

// Database config
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 3306,
  database: "admin_pims",
  multipleStatements: true,
};

async function initDatabase() {
  let connection;

  try {
    console.log("🚀 Connecting to MySQL server...");
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined,
    });

    console.log("✅ Connected");

    // Create DB
    await connection.query(`CREATE DATABASE IF NOT EXISTS admin_pims;`);
    await connection.query(`USE admin_pims;`);

    console.log("🧱 Creating tables...");

    // Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'operator') NOT NULL DEFAULT 'operator',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Permissions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Role-Permissions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roleId INT NOT NULL,
        permissionId INT NOT NULL,
        UNIQUE KEY unique_role_permission (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `);

    // User-Roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        roleId INT NOT NULL,
        UNIQUE KEY unique_user_role (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
      );
    `);

    // User-Permissions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        permissionId INT NOT NULL,
        UNIQUE KEY unique_user_permission (userId, permissionId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `);

    // Categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // UOM
    await connection.query(`
      CREATE TABLE IF NOT EXISTS unit_of_measures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Materials
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10,3) NOT NULL DEFAULT 0,
        categoryId INT,
        uomId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      );
    `);

    // Suppliers
    await connection.query(`
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
    `);

    // Customers
    await connection.query(`
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
    `);

    // Recipes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        categoryId INT,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Recipe ingredients
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        uomId INT,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Purchase orders
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplierId INT NOT NULL,
        orderDate DATE NOT NULL,
        expectedDeliveryDate DATE,
        status ENUM('pending', 'received', 'cancelled') DEFAULT 'pending',
        totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
        FOREIGN KEY (supplierId) REFERENCES suppliers(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Purchase order items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchaseOrderId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        unitPrice DECIMAL(10,2) NOT NULL,
        uomId INT,
        FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Production logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS production_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        quantityProduced DECIMAL(10,3) NOT NULL,
        materialCost DECIMAL(10,2) NOT NULL DEFAULT 0,
        additionalExpense DECIMAL(10,2) NOT NULL DEFAULT 0,
        totalCost DECIMAL(10,2) NOT NULL DEFAULT 0,
        customerId INT,
        FOREIGN KEY (recipeId) REFERENCES recipes(id),
        FOREIGN KEY (customerId) REFERENCES customers(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    console.log("🌱 Seeding data...");

    // Insert default roles
    await connection.query(`
      INSERT IGNORE INTO roles (name, description) VALUES
      ('admin', 'Administrator with full access'),
      ('manager', 'Manager with operational access'),
      ('operator', 'Operator with limited access');
    `);

    // Insert permissions
    await connection.query(`
      INSERT IGNORE INTO permissions (name, description) VALUES
      ('view_materials',''),
      ('create_materials',''),
      ('edit_materials',''),
      ('delete_materials',''),
      ('view_recipes',''),
      ('create_recipes',''),
      ('edit_recipes',''),
      ('delete_recipes',''),
      ('view_production',''),
      ('create_production',''),
      ('approve_production',''),
      ('view_purchase_orders',''),
      ('create_purchase_orders',''),
      ('edit_purchase_orders',''),
      ('delete_purchase_orders',''),
      ('view_reports',''),
      ('view_users',''),
      ('create_users',''),
      ('edit_users',''),
      ('delete_users',''),
      ('manage_roles','');
    `);

    // Assign admin all permissions
    await connection.query(`
      INSERT IGNORE INTO role_permissions (roleId, permissionId)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name = 'admin';
    `);

    // Create default admin user
    const hashed = "$2b$10$YY4e9jaUpAi57wXCWnH5GerRToWPvtBA8EgoqOoX00L94LC6oBCiO"; // your existing bcrypt hash
    
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@example.com', '${hashed}', 'admin');
    `);

    console.log("🎉 Database setup completed!");
    await connection.end();

  } catch (err) {
    console.error("❌ DB Setup Failed:", err);
    if (connection) connection.end();
    process.exit(1);
  }
}

module.exports = { initDatabase };

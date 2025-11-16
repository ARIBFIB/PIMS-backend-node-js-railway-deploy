// Script to initialize the admin_pims database and tables
const mysql = require("mysql2/promise");

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "admin_pims",
  multipleStatements: true,
  connectTimeout: 20000,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

async function initDatabase() {
  let connection;

  try {
    console.log("🚀 Connecting to MySQL server...");
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined, // connect without database first
    });

    console.log("✅ Connected to MySQL");

    // Create database if not exists (only for local development)
    // For Railway, the database is already provided
    if (!process.env.MYSQLDATABASE) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS admin_pims;`);
      await connection.query(`USE admin_pims;`);
      console.log("✅ Database 'admin_pims' created/selected");
    } else {
      // For Railway, we need to select the database explicitly
      await connection.query(`USE ${process.env.MYSQLDATABASE};`);
      console.log("✅ Using Railway provided database");
    }

    console.log("🧱 Creating tables...");

    // ROLES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // PERMISSIONS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // ROLE-PERMISSION mapping table
    await connection.query(`
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
    `);

    // USER-ROLE mapping table (for multiple roles per user)
    await connection.query(`
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
    `);

    // USER-PERMISSION mapping table (for custom permissions)
    await connection.query(`
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
    `);

    // CATEGORIES (Create before materials that reference it)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // UNIT OF MEASURES (Create before materials that reference it)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS unit_of_measures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // USERS (Modified to include roleId)
    await connection.query(` 
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // MATERIALS (Now we can include the foreign key columns directly)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        itemCode VARCHAR(100) NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10,2) NOT NULL DEFAULT 0,
        categoryId INT,
        uomId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      );
    `);

    // RECIPES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        categoryId INT,
        recipeUnit VARCHAR(50) DEFAULT 'unit',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);
    

    // RECIPE INGREDIENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id) ON DELETE CASCADE
      );
    `);

    // PRODUCTION LOGS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS production_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        quantityProduced DECIMAL(10,2) NOT NULL,
        materialCost DECIMAL(10,2) NOT NULL,
        additionalExpense DECIMAL(10,2) NOT NULL DEFAULT 0,
        totalCost DECIMAL(10,2) GENERATED ALWAYS AS (materialCost + additionalExpense) STORED,
        customerId INT,
        batchNumber VARCHAR(50),
        status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipeId) REFERENCES recipes(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );
    `);

    // SUPPLIERS
    await connection.query(`
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
    `);

    // CUSTOMERS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // PURCHASE ORDERS
    await connection.query(`
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
    `);

    // PURCHASE ORDER ITEMS
    await connection.query(`
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
    `);

    console.log("✅ All tables and relationships created successfully.");

    // Check if tables exist
    console.log("🔍 Checking if tables exist...");
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables in database:", tables);

    // Seed data
    console.log("🌱 Inserting initial data...");

    try {
      // Insert default roles
      await connection.query(`
        INSERT IGNORE INTO roles (name, description) VALUES 
        ('admin', 'Administrator with full access'),
        ('operator', 'Operator with limited access');
      `);

      // Insert default permissions
      await connection.query(`
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
        ('manage_roles', 'Manage roles and permissions'),
        ('view_permissions', 'View permissions');
      `);

      // Assign all permissions to admin role
      await connection.query(`
        INSERT IGNORE INTO role_permissions (roleId, permissionId)
        SELECT r.id, p.id 
        FROM roles r, permissions p 
        WHERE r.name = 'admin';
      `);

      await connection.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ('Admin User', 'admin@example.com', '$2b$10$IxhgKfJq1yb900HvtYpmqOj95kl2HidCDdkWQSHI8m5Efkpqbfa22', 'admin')
        ON DUPLICATE KEY UPDATE email = email;
      `);

      // Insert default categories
      await connection.query(`
        INSERT IGNORE INTO categories (code, name) VALUES 
        ('001', 'Raw Materials'),
        ('002', 'Packaging'),
        ('003', 'Finished Goods');
      `);

      // Insert default unit of measures
      await connection.query(`
        INSERT IGNORE INTO unit_of_measures (name, symbol) VALUES 
        ('Kilogram', 'kg'),
        ('Gram', 'g'),
        ('Liter', 'l'),
        ('Milliliter', 'ml'),
        ('Piece', 'pc'),
        ('Box', 'box');
      `);

      await connection.query(`
        INSERT INTO materials (itemCode, name, unit, quantity, unitPrice, lowStockThreshold, categoryId, uomId) VALUES
        ('F001', 'Flour', 'kg', 200, 120, 50, (SELECT id FROM categories WHERE code = '001'), (SELECT id FROM unit_of_measures WHERE symbol = 'kg')),
        ('S001', 'Sugar', 'kg', 100, 140, 30, (SELECT id FROM categories WHERE code = '001'), (SELECT id FROM unit_of_measures WHERE symbol = 'kg')),
        ('SL01', 'Salt', 'kg', 50, 20, 10, (SELECT id FROM categories WHERE code = '001'), (SELECT id FROM unit_of_measures WHERE symbol = 'kg')),
        ('O001', 'Oil', 'l', 30, 150, 5, (SELECT id FROM categories WHERE code = '001'), (SELECT id FROM unit_of_measures WHERE symbol = 'l')),
        ('Y001', 'Yeast', 'g', 500, 0.5, 100, (SELECT id FROM categories WHERE code = '001'), (SELECT id FROM unit_of_measures WHERE symbol = 'g'))
        ON DUPLICATE KEY UPDATE name = name;
      `);

      await connection.query(`
        INSERT INTO recipes (name, category, categoryId)
        VALUES ('Bread', 'Bakery', (SELECT id FROM categories WHERE code = '003'))
        ON DUPLICATE KEY UPDATE name = name;
      `);

      const [rows] = await connection.query(`SELECT id FROM recipes WHERE name='Bread' LIMIT 1;`);
      const recipeId = rows[0]?.id;

      if (recipeId) {
        await connection.query(`
          INSERT INTO recipe_ingredients (recipeId, materialId, quantity)
          VALUES
          (${recipeId}, (SELECT id FROM materials WHERE name='Flour' LIMIT 1), 1),
          (${recipeId}, (SELECT id FROM materials WHERE name='Sugar' LIMIT 1), 0.1),
          (${recipeId}, (SELECT id FROM materials WHERE name='Salt' LIMIT 1), 0.02),
          (${recipeId}, (SELECT id FROM materials WHERE name='Oil' LIMIT 1), 0.1),
          (${recipeId}, (SELECT id FROM materials WHERE name='Yeast' LIMIT 1), 10)
          ON DUPLICATE KEY UPDATE recipeId = recipeId;
        `);
      }

      console.log("✅ Sample data inserted successfully!");
    } catch (err) {
      console.log(`⚠️  Warning: Failed to insert sample data: ${err.message}`);
      console.log("ℹ️  Continuing with database initialization...");
    }

    console.log("🎉 Database setup completed successfully!");

    await connection.end();
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Test database connection function with retry
async function testConnection() {
  let connection;
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log("🚀 Testing database connection...");
      connection = await mysql.createConnection(dbConfig);
      console.log("✅ Database connection successful");
      await connection.end();
      return true;
    } catch (err) {
      console.error(`❌ Database connection failed: ${err.message}`);
      if (connection) await connection.end();
      retries--;
      if (retries > 0) {
        console.log(`Retrying in 3 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  return false;
}

module.exports = { initDatabase, testConnection, pool };
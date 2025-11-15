const mysql = require("mysql2");

// ---- 1. Create pool (Railway OR Local) ----
const pool = mysql
  .createPool({
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "admin_pims",
    port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
    connectionLimit: 10,
  })
  .promise();

// ---- 2. Initialize Database ----
async function initDatabase() {
  try {
    console.log("🚀 Initializing Database...");

    // ---- Create Users table ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'operator') NOT NULL DEFAULT 'operator',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Roles table ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Permissions table ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create role_permissions ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roleId INT NOT NULL,
        permissionId INT NOT NULL,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (roleId, permissionId)
      )
    `);

    // ---- Create user_roles ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        roleId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (userId, roleId)
      )
    `);

    // ---- Create user_permissions ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        permissionId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_permission (userId, permissionId)
      )
    `);

    // ---- Create Categories ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Unit of Measures ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS unit_of_measures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Materials ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10,3) NOT NULL DEFAULT 0,
        categoryId INT,
        uomId INT,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      )
    `);

    // ---- Create Suppliers ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Customers ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ---- Create Recipes ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        categoryId INT,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    // ---- Create Recipe Ingredients ----
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipeId INT NOT NULL,
        materialId INT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        uomId INT,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (materialId) REFERENCES materials(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      )
    `);

    // ---- Insert admin user (FIXED) ----
    await pool.query(`
      INSERT IGNORE INTO users (id, name, email, password, role)
      VALUES (1, 'Admin User', 'admin@example.com', '\$2a\$10\$xYzhashedAdminPasswordHere', 'admin')
    `);

    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ DB Initialization Error:", err);
  }
}

module.exports = { pool, initDatabase };

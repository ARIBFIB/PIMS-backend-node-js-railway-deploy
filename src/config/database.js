// db.js — FINAL VERSION (Supports Railway + Localhost)

// -----------------------------
//  IMPORTS
// -----------------------------
const mysql = require("mysql2/promise");

// -----------------------------
//  DATABASE CONFIG
// -----------------------------
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_pims",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Detect if running on Railway
const isRailway =
  process.env.MYSQLHOST ||
  process.env.MYSQLPUBLICURL ||
  process.env.RAILWAY_ENVIRONMENT;

// Create pool
const pool = mysql.createPool(dbConfig);

// -----------------------------
//  INIT DATABASE
// -----------------------------
async function initDatabase() {
  try {
    console.log("🚀 Initializing Database...");

    // If local, create DB first
    if (!isRailway) {
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
      });

      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`
      );
      await connection.end();
      console.log("📦 Database created (Local Mode)");
    }

    // Now proceed with pool connection
    const conn = await pool.getConnection();

    console.log("📁 Creating Tables...");

    // -----------------------------
    //  TABLES (ORDER FIXED)
    // -----------------------------

    // 1. users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. roles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // 3. permissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // 4. role_permissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        roleId CHAR(36),
        permissionId CHAR(36),
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(id),
        FOREIGN KEY (permissionId) REFERENCES permissions(id)
      );
    `);

    // 5. user_roles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        userId CHAR(36),
        roleId CHAR(36),
        PRIMARY KEY (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (roleId) REFERENCES roles(id)
      );
    `);

    // 6. user_permissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        userId CHAR(36),
        permissionId CHAR(36),
        PRIMARY KEY (userId, permissionId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (permissionId) REFERENCES permissions(id)
      );
    `);

    // 7. categories
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // 8. unit_of_measures
    await conn.query(`
      CREATE TABLE IF NOT EXISTS unit_of_measures (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50)
      );
    `);

    // 9. materials
    await conn.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        categoryId CHAR(36),
        uomId CHAR(36),
        quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
        unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        lowStockThreshold DECIMAL(10,3) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      );
    `);

    // 10. suppliers
    await conn.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        contactPerson VARCHAR(255)
      );
    `);

    // 11. customers
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        contactPerson VARCHAR(255)
      );
    `);

    // 12. recipes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 13. recipe_ingredients
    await conn.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id CHAR(36) PRIMARY KEY,
        recipeId CHAR(36),
        materialId CHAR(36),
        uomId CHAR(36),
        quantity DECIMAL(10,3) NOT NULL,
        FOREIGN KEY (recipeId) REFERENCES recipes(id),
        FOREIGN KEY (materialId) REFERENCES materials(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      );
    `);

    // 14. purchase_orders
    await conn.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id CHAR(36) PRIMARY KEY,
        supplierId CHAR(36),
        orderDate DATE,
        expectedDeliveryDate DATE,
        totalAmount DECIMAL(10,2),
        status VARCHAR(50),
        FOREIGN KEY (supplierId) REFERENCES suppliers(id)
      );
    `);

    // 15. purchase_order_items
    await conn.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id CHAR(36) PRIMARY KEY,
        purchaseOrderId CHAR(36),
        materialId CHAR(36),
        uomId CHAR(36),
        quantity DECIMAL(10,3),
        unitPrice DECIMAL(10,2),
        FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id),
        FOREIGN KEY (materialId) REFERENCES materials(id),
        FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)
      );
    `);

    // 16. production_logs
    await conn.query(`
      CREATE TABLE IF NOT EXISTS production_logs (
        id CHAR(36) PRIMARY KEY,
        recipeId CHAR(36),
        customerId CHAR(36),
        quantityProduced DECIMAL(10,3),
        productionDate DATE,
        FOREIGN KEY (recipeId) REFERENCES recipes(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );
    `);

    console.log("✅ All tables created successfully!");

    // -----------------------------
    //  INSERT SAMPLE DATA
    // -----------------------------
    console.log("📥 Inserting sample admin user & roles...");

    const adminId = "00000000-0000-0000-0000-000000000001";
    const adminRole = "00000000-0000-0000-0000-000000000010";

    await conn.query(`
      INSERT IGNORE INTO users (id, firstName, lastName, email, password)
      VALUES ('${adminId}', 'Admin', 'User', 'admin@example.com', 'admin123');
    `);

    await conn.query(`
      INSERT IGNORE INTO roles (id, name)
      VALUES ('${adminRole}', 'admin');
    `);

    await conn.query(`
      INSERT IGNORE INTO user_roles (userId, roleId)
      VALUES ('${adminId}', '${adminRole}');
    `);

    console.log("✨ Sample admin user inserted!");

    conn.release();
  } catch (error) {
    console.error("❌ DB Initialization Error:", error);
  }
}

// -----------------------------
//  TEST CONNECTION
// -----------------------------
async function testConnection() {
  try {
    await pool.getConnection();
    console.log("✅ Database connected successfully!");
  } catch (err) {
    console.error("❌ Database connection failed!", err);
  }
}

// -----------------------------
//  EXPORTS
// -----------------------------
module.exports = {
  pool,
  initDatabase,
  testConnection,
};

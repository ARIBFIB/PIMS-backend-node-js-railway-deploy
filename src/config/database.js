// Script to initialize the admin_pims database and tables
const mysql = require("mysql2/promise");

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_pims",
  multipleStatements: true,
  connectTimeout: 20000,
};

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

    // USERS
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

    // MATERIALS
    await connection.query(`
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
    `);

    // RECIPES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipeId) REFERENCES recipes(id)
      );
    `);

    // UNIT OF MEASURES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS unit_of_measures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // CATEGORIES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

    // ALTER MATERIALS TABLE - Check if columns exist before adding them
    try {
      const [materialColumns] = await connection.query(`SHOW COLUMNS FROM materials LIKE 'categoryId'`);
      if (materialColumns.length === 0) {
        await connection.query(`ALTER TABLE materials ADD COLUMN categoryId INT`);
        await connection.query(`ALTER TABLE materials ADD FOREIGN KEY (categoryId) REFERENCES categories(id)`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }
    
    try {
      const [uomColumns] = await connection.query(`SHOW COLUMNS FROM materials LIKE 'uomId'`);
      if (uomColumns.length === 0) {
        await connection.query(`ALTER TABLE materials ADD COLUMN uomId INT`);
        await connection.query(`ALTER TABLE materials ADD FOREIGN KEY (uomId) REFERENCES unit_of_measures(id)`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }

    // ALTER RECIPES TABLE - Check if column exists before adding it
    try {
      const [recipeColumns] = await connection.query(`SHOW COLUMNS FROM recipes LIKE 'categoryId'`);
      if (recipeColumns.length === 0) {
        await connection.query(`ALTER TABLE recipes ADD COLUMN categoryId INT`);
        await connection.query(`ALTER TABLE recipes ADD FOREIGN KEY (categoryId) REFERENCES categories(id)`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }

    // ALTER PRODUCTION_LOGS TABLE - Check if columns exist before adding them
    try {
      const [prodLogColumns1] = await connection.query(`SHOW COLUMNS FROM production_logs LIKE 'customerId'`);
      if (prodLogColumns1.length === 0) {
        await connection.query(`ALTER TABLE production_logs ADD COLUMN customerId INT`);
        await connection.query(`ALTER TABLE production_logs ADD FOREIGN KEY (customerId) REFERENCES customers(id)`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }
    
    try {
      const [prodLogColumns2] = await connection.query(`SHOW COLUMNS FROM production_logs LIKE 'batchNumber'`);
      if (prodLogColumns2.length === 0) {
        await connection.query(`ALTER TABLE production_logs ADD COLUMN batchNumber VARCHAR(50)`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }
    
    try {
      const [prodLogColumns3] = await connection.query(`SHOW COLUMNS FROM production_logs LIKE 'status'`);
      if (prodLogColumns3.length === 0) {
        await connection.query(`ALTER TABLE production_logs ADD COLUMN status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING'`);
      }
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        throw err;
      }
    }

    console.log("✅ All tables and relationships created successfully.");

    // Seed data
    console.log("🌱 Inserting initial data...");

    await connection.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@example.com', 'admin123', 'admin')
      ON DUPLICATE KEY UPDATE email = email;
    `);

    await connection.query(`
      INSERT INTO materials (name, unit, quantity, unitPrice, lowStockThreshold) VALUES
      ('Flour', 'kg', 200, 120, 50),
      ('Sugar', 'kg', 100, 140, 30),
      ('Salt', 'kg', 50, 20, 10),
      ('Oil', 'l', 30, 150, 5),
      ('Yeast', 'g', 500, 0.5, 100)
      ON DUPLICATE KEY UPDATE name = name;
    `);

    await connection.query(`
      INSERT INTO recipes (name, category)
      VALUES ('Bread', 'Bakery')
      ON DUPLICATE KEY UPDATE name = name;
    `);

    const [rows] = await connection.query(`SELECT id FROM recipes WHERE name='Bread' LIMIT 1;`);
    const recipeId = rows[0]?.id;

    if (recipeId) {
      await connection.query(`
        INSERT INTO recipe_ingredients (recipeId, materialId, quantity)
        VALUES
        (${recipeId}, (SELECT id FROM materials WHERE name='Flour'), 1),
        (${recipeId}, (SELECT id FROM materials WHERE name='Sugar'), 0.1),
        (${recipeId}, (SELECT id FROM materials WHERE name='Salt'), 0.02),
        (${recipeId}, (SELECT id FROM materials WHERE name='Oil'), 0.1),
        (${recipeId}, (SELECT id FROM materials WHERE name='Yeast'), 10)
        ON DUPLICATE KEY UPDATE recipeId = recipeId;
      `);
    }

    console.log("✅ Sample data inserted successfully!");
    console.log("🎉 Database setup completed successfully!");

    await connection.end();
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();

require('dotenv').config({ path: '../.env.local' });

const mysql = require('mysql2/promise');

// Database configuration (supports Railway & local)
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || "3306"),
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "admin_pims",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 20000
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

const createSubCategoriesTable = async () => {
  let pool;
  try {
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    // Create sub_categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        categoryId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Sub-categories table created successfully');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Database connection refused. Please make sure MySQL is running locally.');
      console.error('You can start MySQL service or use Railway database for development.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database does not exist. Please create the database first.');
    } else {
      console.error('Error creating sub-categories table:', error);
    }
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

// Run the migration
createSubCategoriesTable().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
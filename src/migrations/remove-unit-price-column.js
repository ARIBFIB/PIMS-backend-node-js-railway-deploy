// Migration script to remove the unitPrice column from materials table
const mysql = require("mysql2/promise");
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "admin_pims",
  multipleStatements: true,
  connectTimeout: 20000,
};

async function removeUnitPriceColumn() {
  let connection;

  try {
    console.log("🚀 Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL");

    console.log("🔍 Checking if unitPrice column exists...");
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM materials LIKE 'unitPrice'"
    );

    if (columns.length > 0) {
      console.log("🗑️  Removing unitPrice column from materials table...");
      await connection.query(
        "ALTER TABLE materials DROP COLUMN unitPrice"
      );
      console.log("✅ unitPrice column removed successfully");
    } else {
      console.log("ℹ️  unitPrice column does not exist, nothing to remove");
    }

    await connection.end();
    console.log("🎉 Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  removeUnitPriceColumn();
}

module.exports = { removeUnitPriceColumn };
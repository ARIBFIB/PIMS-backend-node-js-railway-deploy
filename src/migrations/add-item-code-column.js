// Migration script to add itemCode column to materials table
const pool = require('../config/dbPool');

async function addItemCodeColumn() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Add itemCode column to materials table
    await connection.execute(`
      ALTER TABLE materials 
      ADD COLUMN itemCode VARCHAR(100) NULL UNIQUE AFTER id
    `);
    
    await connection.commit();
    console.log('Successfully added itemCode column to materials table');
  } catch (error) {
    await connection.rollback();
    console.error('Error adding itemCode column:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addItemCodeColumn()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addItemCodeColumn;
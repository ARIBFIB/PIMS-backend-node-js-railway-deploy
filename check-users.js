const { pool } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('Connecting to database...');
    const [rows] = await pool.execute('SELECT * FROM users');
    console.log('Users in database:');
    console.log(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('Connecting to database...');
    
    // Hash the password
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Hashed password:', hashedPassword);
    
    // Update the admin user's password
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@example.com']
    );
    
    console.log('Updated user password, affected rows:', result.affectedRows);
    console.log('Admin user password has been fixed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminPassword();
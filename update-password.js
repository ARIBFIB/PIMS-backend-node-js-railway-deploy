require('dotenv').config({ path: __dirname + '/.env' });
const pool = require('./src/config/database');

async function updateAdminPassword() {
  try {
    const result = await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      ['$2a$10$AOFR0ye7QCLHObkX.AfbHOsJbyzRjTH5XSiKtlUEmgwbpA8WLHyGK', 'admin@prodx.com']
    );
    
    console.log('Admin password updated successfully');
    console.log('Affected rows:', result.affectedRows);
  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

async function updateStaffPassword() {
  try {
    const result = await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      ['$2a$10$cf71lxqXTkkhSa8UAF.nTe2.ibpDFQrkrv3HSV/5dspvDGHOIeHta', 'staff@prodx.com']
    );
    
    console.log('Staff password updated successfully');
    console.log('Affected rows:', result.affectedRows);
  } catch (error) {
    console.error('Error updating staff password:', error);
  }
}

async function updatePasswords() {
  await updateAdminPassword();
  await updateStaffPassword();
}

updatePasswords();
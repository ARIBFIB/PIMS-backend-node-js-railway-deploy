const bcrypt = require('bcryptjs');

async function generateHash() {
  const adminHash = await bcrypt.hash('Admin123', 10);
  console.log('Hash for Admin123:', adminHash);
  
  const staffHash = await bcrypt.hash('Staff123', 10);
  console.log('Hash for Staff123:', staffHash);
}

generateHash();
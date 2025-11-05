// Environment variable test
require('dotenv').config({ path: __dirname + '/.env' });

console.log('Environment Variables Test:');
console.log('========================');
console.log('PORT:', process.env.PORT || 'Not set (default: 8080)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set (default: development)');
console.log('MYSQLHOST:', process.env.MYSQLHOST || 'Not set');
console.log('MYSQLUSER:', process.env.MYSQLUSER || 'Not set');
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '****' : 'Not set');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'Not set');
console.log('MYSQLPORT:', process.env.MYSQLPORT || 'Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('DB_USER:', process.env.DB_USER || 'Not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('DB_PORT:', process.env.DB_PORT || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '****' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

// Test if required variables are set (either Railway or local format)
const railwayVars = ['MYSQLHOST', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];
const localVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

const railwayMissing = railwayVars.filter(varName => !process.env[varName]);
const localMissing = localVars.filter(varName => !process.env[varName]);

if (railwayMissing.length > 0 && localMissing.length > 0) {
  console.log('\n❌ Missing required database environment variables:');
  console.log('  Railway format missing:', railwayMissing);
  console.log('  Local format missing:', localMissing);
} else if (railwayMissing.length === 0) {
  console.log('\n✅ All required Railway database environment variables are set');
} else if (localMissing.length === 0) {
  console.log('\n✅ All required local database environment variables are set');
} else {
  console.log('\n✅ Database environment variables are set (using fallback values)');
}
// Simulate Railway deployment environment
console.log('Simulating Railway environment...');

// Clear any existing environment variables that might conflict
delete process.env.MYSQLHOST;
delete process.env.MYSQLUSER;
delete process.env.MYSQLPASSWORD;
delete process.env.MYSQLDATABASE;
delete process.env.MYSQLPORT;

// Set Railway-style environment variables (as shown in your Railway dashboard)
process.env.MYSQLHOST = 'mysql.railway.internal';
process.env.MYSQLUSER = 'root';
process.env.MYSQLPASSWORD = 'zdXObLEjXJnhPdVtXpxMKmIbLkvZZvoR';
process.env.MYSQLDATABASE = 'railway';
process.env.MYSQLPORT = '3306';
process.env.PORT = '8080';
process.env.NODE_ENV = 'production';

console.log('Railway environment variables set:');
console.log('- MYSQLHOST:', process.env.MYSQLHOST);
console.log('- MYSQLUSER:', process.env.MYSQLUSER);
console.log('- MYSQLPASSWORD: ****');
console.log('- MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('- MYSQLPORT:', process.env.MYSQLPORT);
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Now test the startup process
console.log('\nTesting startup process...');

require('./startup-test.js');
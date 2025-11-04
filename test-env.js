require('dotenv').config({ path: __dirname + '/.env' });

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DB_NAME:', process.env.DB_NAME);
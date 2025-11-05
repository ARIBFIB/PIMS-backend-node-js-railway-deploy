require('dotenv').config({ path: __dirname + '/.env' });
const initDatabase = require('./src/utils/initDatabase');
const app = require('./src/app');
const PORT = process.env.PORT || 4000;

// Initialize database tables
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
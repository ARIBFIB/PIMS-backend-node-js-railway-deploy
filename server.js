require('dotenv').config();
console.log('🚀 Application starting...');

const app = require('./src/app');
const { initDatabase, testConnection } = require('./src/config/database');
const pool = require('./src/config/dbPool');
const bcrypt = require('bcryptjs');

// Import the Railway post-deploy script
const runRailwayPostDeploy = require('./scripts/railway-post-deploy');

const PORT = parseInt(process.env.PORT) || 4000;

// Add a flag to track if the server is ready
let isServerReady = false;

console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- Parsed PORT:', PORT);
console.log('- MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('- MYSQLHOST:', process.env.MYSQLHOST);
console.log('- MYSQLUSER:', process.env.MYSQLUSER);

// Add a readiness check endpoint to the app
app.get('/ready', (req, res) => {
  console.log('Readiness check called');
  if (isServerReady) {
    res.status(200).json({ 
      status: 'READY', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } else {
    res.status(503).json({ 
      status: 'NOT READY', 
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize database after starting server
async function initializeDatabaseAsync() {
  console.log('🚀 Starting async database initialization...');
  
  try {
    // Test database connection first
    const isConnected = await testConnection();
    console.log('Database connection test result:', isConnected);
    
    if (isConnected) {
      console.log('Initializing database...');
      await initDatabase();
      console.log('Database initialized successfully');
      
      // Fix admin password if it's plain text
      await fixAdminPasswordIfNecessary();
      
      // Run Railway post-deploy script (for Railway deployments)
      if (process.env.MYSQLDATABASE) {
        try {
          await runRailwayPostDeploy();
        } catch (err) {
          console.error('⚠️  Railway post-deploy script failed:', err.message);
        }
      }
    } else {
      console.warn('⚠️  Database connection failed. Will retry in background.');
      console.warn('This is normal for Railway deployments where the database may not be ready yet.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }
}

// Function to fix admin password if it's plain text
async function fixAdminPasswordIfNecessary() {
  try {
    console.log('Checking if admin password needs to be fixed...');
    
    // Get the admin user
    const [rows] = await pool.execute(
      'SELECT id, password FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    if (rows.length > 0) {
      const user = rows[0];
      // Check if password is plain text (not a bcrypt hash)
      if (!user.password.startsWith('$2b$')) {
        console.log('Admin user has plain text password. Fixing...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Update the admin user's password
        const [result] = await pool.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        
        console.log('✅ Admin user password has been fixed!');
      } else {
        console.log('Admin user password is already properly hashed.');
      }
    } else {
      console.log('No admin user found.');
    }
  } catch (error) {
    console.error('Error fixing admin password:', error.message);
  }
}

// Add a simple startup message
console.log(`🚀 Attempting to start server on port ${PORT}...`);

// Try different binding approaches for better compatibility
const server = app.listen(PORT, () => {
  console.log(`🚀 Server successfully running on port ${PORT}`);
  console.log(`CORS enabled for all origins`);
  
  // Mark server as ready immediately
  isServerReady = true;
  console.log(`✅ Server is ready to accept requests`);
  
  // Initialize database asynchronously after server starts
  setTimeout(async () => {
    await initializeDatabaseAsync();
  }, 1000);
});

// Add error handler for the server
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

console.log('✅ Server startup process initiated');
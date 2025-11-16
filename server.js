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

// Initialize database before starting server
async function startServer() {
  console.log('🚀 Starting server initialization...');
  
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
      console.warn('⚠️  Database connection failed. Starting server without database initialization.');
      console.warn('This is normal for Railway deployments where the database may not be ready yet.');
    }
    
    console.log(`🚀 Starting server on port ${PORT}...`);
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`CORS enabled for all origins`);
      
      // Mark server as ready
      isServerReady = true;
      console.log(`✅ Server is ready to accept requests`);
      
      // For Railway deployments, try to initialize database after server starts
      if (process.env.MYSQLDATABASE && !isConnected) {
        console.log('🔄 Retrying database initialization in background...');
        setTimeout(async () => {
          try {
            await initDatabase();
            console.log('✅ Database initialized successfully on retry');
            
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
          } catch (err) {
            console.error('❌ Database initialization failed on retry:', err.message);
          }
        }, 5000);
      }
    });

    // Add a small delay to ensure the server is fully ready
    setTimeout(() => {
      console.log('✅ Server startup delay completed - fully ready');
    }, 1000);

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
    
    console.log('✅ Server startup process completed');
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
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

// Add a readiness check endpoint to the app
const express = require('express');
app.get('/ready', (req, res) => {
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

startServer();
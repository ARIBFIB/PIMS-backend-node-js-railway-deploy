require('dotenv').config();
const app = require('./src/app');
const { initDatabase, testConnection } = require('./src/config/database');
const { pool } = require('./src/config/dbPool');
const bcrypt = require('bcryptjs');

// Import the Railway post-deploy script
const runRailwayPostDeploy = require('./scripts/railway-post-deploy');

const PORT = process.env.PORT || 4000;

// Initialize database before starting server
async function startServer() {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    
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
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`CORS enabled for all origins`);
      
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

    // Handle server errors
    server.on('error', (error) => {
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
        await pool.execute(
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

startServer();
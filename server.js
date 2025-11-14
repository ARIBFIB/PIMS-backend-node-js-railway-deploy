require('dotenv').config();
const app = require('./src/app');
const { initDatabase, testConnection } = require('./src/config/database');

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

startServer();
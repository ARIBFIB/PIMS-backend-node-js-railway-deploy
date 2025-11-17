const express = require('express');
const app = express();

// Add a simple ping endpoint for Railway health checks (must be at the top)
app.get('/ping', (req, res) => res.send('pong'));

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const pool = require('./config/dbPool');

const uomRoutes = require('./routes/uom');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const customerRoutes = require('./routes/customers');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');

// Import routes
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const recipeRoutes = require('./routes/recipes');
const productionRoutes = require('./routes/production');
const reportRoutes = require('./routes/reports');

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Configure CORS with specific options
const corsOptions = {
  origin: [
    // 'https://pims-project-214e1e.netlify.app',
    'https://pims-project-61fb3d.netlify.app',
    'https://6919f5629afbf6133ebe90d7--pims-project-61fb3d.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'] // Expose Authorization header for frontend access
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add a middleware to ensure CORS headers are always set
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});


// Separate rate limiter for auth endpoints (login, register, etc.) to prevent abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // More restrictive limit for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}); 

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter rate limiting to auth routes
app.use('/api/materials', materialRoutes);
app.use('/api/recipes', recipeRoutes);

app.use('/api/production-logs', productionRoutes);

app.use('/api/reports', reportRoutes);

app.use('/api/uom', uomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

// Simple test endpoint to verify server is working
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.status(200).json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Simple health check endpoint for Railway (fast response)
app.get('/health', (req, res) => {
  console.log('Simple health check endpoint called');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check endpoint (for manual checking)
app.get('/health/detailed', async (req, res) => {
  console.log('Detailed health check endpoint called');
  
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown'
  };

  try {
    // Test database connection without failing the health check
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    healthCheck.database = 'connected';
    console.log('Detailed health check - database connected');
  } catch (error) {
    console.warn('Detailed health check - database connection failed:', error.message);
    healthCheck.database = 'disconnected';
    // Don't fail the health check if database is temporarily unavailable
    // This is common during startup or when database is restarting
  }

  // If we can respond to HTTP requests, the service is healthy enough
  console.log('Detailed health check response:', healthCheck);
  res.status(200).json(healthCheck);
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;
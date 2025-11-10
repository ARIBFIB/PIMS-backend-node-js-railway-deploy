const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const recipeRoutes = require('./routes/recipes');
const productionRoutes = require('./routes/production');
const reportRoutes = require('./routes/reports');

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Configure CORS with specific options
const corsOptions = {
  origin: [
    'https://funny-melba-61fb3d.netlify.app', // Your new Netlify frontend
    'https://691183f3945a3cd249e73409--funny-melba-61fb3d.netlify.app', // Deployed Netlify frontend
    'https://inquisitive-cannoli-1a02dc.netlify.app',
    'https://69103f69dcfd481c4c5af487--inquisitive-cannoli-1a02dc.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.header('origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// Rate limiting with proper configuration for proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/production-logs', productionRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;
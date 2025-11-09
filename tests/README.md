# API Testing Guide for PIMS Backend

## Prerequisites

Before running the API tests, you need to have:

1. **MySQL Server** installed and running
2. **Node.js** installed (version 14 or higher)

## Database Setup

1. Make sure MySQL is running on your system:
   - On Windows: Start the MySQL service from Services
   - On macOS: `brew services start mysql`
   - On Linux: `sudo systemctl start mysql`

2. Update the database configuration in the [.env](file:///d%3A/Rozmarrah-CUST/All%20Qoder%20Projects/Projects_qode/ReactCode/React/D5_IMS/pims-backend/.env) file if needed:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=pims
   ```

3. Run the database setup script:
   ```bash
   npm run setup-db
   ```

## Running the Server

1. Start the backend server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Running API Tests

Once the server is running and the database is set up, you can run the API tests:

```bash
npm test
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/low-stock` - Get low stock materials
- `GET /api/materials/:id` - Get material by ID
- `POST /api/materials` - Create new material
- `PUT /api/materials/:id` - Update material

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/recipes/:id/calc` - Calculate recipe materials cost
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Production Logs
- `GET /api/production-logs` - Get all production logs
- `POST /api/production-logs` - Create new production log

### Reports
- `GET /api/reports/production` - Get production report
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/export` - Export report

## Test Results Interpretation

The test script will output results in the following format:
- ✓ (Green checkmark) - Test passed
- ✗ (Red X) - Test failed

If you see database connection errors, make sure:
1. MySQL server is running
2. Database credentials in [.env](file:///d%3A/Rozmarrah-CUST/All%20Qoder%20Projects/Projects_qode/ReactCode/React/D5_IMS/pims-backend/.env) are correct
3. The database user has proper permissions

## Manual Testing

You can also test the APIs manually using tools like:
- Postman
- curl
- HTTPie

Example curl commands:
```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get materials (requires authentication token)
curl http://localhost:4000/api/materials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
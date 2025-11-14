# Railway Deployment Guide

## Prerequisites
1. Railway account (https://railway.app)
2. GitHub account with this repository forked/cloned

## Deployment Steps

### 1. Create a New Project on Railway
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose this repository
4. Select the branch you want to deploy (usually `main` or `master`)

### 2. Configure Environment Variables
Railway will automatically detect and use the following environment variables:

- `PORT` - Provided by Railway (default: 8080)
- `MYSQLHOST` - Provided by Railway MySQL plugin
- `MYSQLPORT` - Provided by Railway MySQL plugin
- `MYSQLUSER` - Provided by Railway MySQL plugin
- `MYSQLPASSWORD` - Provided by Railway MySQL plugin
- `MYSQLDATABASE` - Provided by Railway MySQL plugin
- `JWT_SECRET` - Custom JWT secret key (set in Railway dashboard)

### 3. Add MySQL Database
1. In your Railway project, click "+ New"
2. Select "Database"
3. Choose "MySQL"
4. Railway will automatically set the database connection variables

### 4. Configure MySQL User Permissions
To ensure your application can connect to the Railway MySQL database:

1. Go to your MySQL database in Railway
2. Click on "Connect"
3. Use the "MySQL Client" connection method
4. Connect using a MySQL client (like MySQL Workbench or command line)
5. Run the following SQL command to grant permissions:
   ```sql
   ALTER USER 'your_mysql_user'@'%' IDENTIFIED WITH mysql_native_password BY 'your_mysql_password';
   FLUSH PRIVILEGES;
   ```

### 5. Set Custom Environment Variables
1. Go to your Railway project
2. Click on your service (not the database)
3. Go to "Settings" tab
4. Click "Variables"
5. Add the following variable:
   - `JWT_SECRET` - Set to a strong secret key for JWT token generation

### 6. Deploy
1. Railway will automatically deploy when you push to your GitHub repository
2. You can also manually trigger a deployment from the Railway dashboard

## Troubleshooting

### Database Connection Issues
If you see database connection errors:
1. Ensure your MySQL user has the correct permissions
2. Check that all environment variables are correctly set
3. Verify the database is properly linked to your service

### Authentication Issues
If login is not working:
1. Check that `JWT_SECRET` is set in Railway environment variables
2. Verify that the admin user exists in the database with a properly hashed password

### First-time Setup
On first deployment, the application will automatically:
1. Create all necessary database tables
2. Insert the default admin user (admin@example.com / admin123)

## Default Admin Credentials
- Email: admin@example.com
- Password: admin123

**Important**: Change the default admin password after first login for security.
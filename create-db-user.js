// Script to create a dedicated database user with proper permissions
// Run this script after connecting to your Railway MySQL database

console.log(`
=== Database User Setup Script ===

To fix the "Access denied" error, you need to create a dedicated database user with proper permissions.

Follow these steps:

1. Connect to your Railway MySQL database using the Railway CLI:
   railway connect MySQL-odu5

2. Once connected to the MySQL console, run these commands:

   CREATE USER 'appuser'@'%' IDENTIFIED BY 'your_secure_password_here';
   GRANT ALL PRIVILEGES ON railway.* TO 'appuser'@'%';
   FLUSH PRIVILEGES;

3. Exit the MySQL console:
   exit

4. Update your Railway environment variables:
   - MYSQLUSER=appuser
   - MYSQLPASSWORD=your_secure_password_here

5. Redeploy your application

Alternative solution if you can't create a new user:

1. Grant permissions to the existing root user:
   GRANT ALL PRIVILEGES ON railway.* TO 'root'@'%';
   FLUSH PRIVILEGES;

Note: Using 'root'@'%' is less secure than creating a dedicated user with limited permissions.

For security reasons, choose a strong password for your database user.
`);

process.exit(0);
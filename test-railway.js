// Simulate Railway environment
process.env.MYSQLHOST = 'mysql.railway.internal';
process.env.MYSQLPORT = '3306';
process.env.MYSQLUSER = 'root';
process.env.MYSQLDATABASE = 'railway';

console.log('🔧 Simulating Railway environment...');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Test if the app can be imported without errors
try {
  console.log('🔍 Testing app import...');
  const app = require('./src/app');
  console.log('✅ App imported successfully');
  
  // Test if the ping endpoint is available
  console.log('🔍 Testing ping endpoint setup...');
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  
  const pingRoute = routes.find(route => route.path === '/ping');
  if (pingRoute) {
    console.log('✅ Ping endpoint is available at /ping');
  } else {
    console.log('❌ Ping endpoint is not available');
    console.log('Available routes:', routes);
  }
} catch (error) {
  console.error('❌ Error importing app:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('🎉 Railway simulation test completed');
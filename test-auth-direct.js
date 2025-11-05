// Direct test of auth functionality
const User = require('./src/models/User');

async function testAuth() {
  try {
    console.log('Testing direct database connection and auth...');
    
    // Test finding a user
    const user = await User.findByEmail('admin@prodx.com');
    console.log('User found:', user);
    
    if (user) {
      // Test password comparison
      const isMatch = await User.comparePassword('Admin123', user.password);
      console.log('Password match:', isMatch);
    }
    
    console.log('✅ Direct auth test completed successfully');
  } catch (error) {
    console.log('❌ Direct auth test failed');
    console.log('Error:', error.message);
  }
}

testAuth();
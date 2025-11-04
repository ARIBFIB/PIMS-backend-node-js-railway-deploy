require('dotenv').config({ path: __dirname + '/.env' });
const User = require('./src/models/User');

async function testUserModel() {
  try {
    console.log('Testing User.findByEmail...');
    const user = await User.findByEmail('admin@prodx.com');
    console.log('User found:', user);
    
    if (user) {
      console.log('Testing password comparison...');
      const isMatch = await User.comparePassword('Admin123', user.password);
      console.log('Password match:', isMatch);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserModel();
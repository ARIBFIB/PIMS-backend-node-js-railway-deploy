// const User = require('./src/models/User');

// async function testUser() {
//   try {
//     console.log('Testing user lookup...');
//     const user = await User.findByEmail('testadmin@test.com');
//     console.log('User found:', user);
    
//     if (user) {
//       console.log('Testing password comparison...');
//       const isMatch = await User.comparePassword('Admin123', user.password);
//       console.log('Password match:', isMatch);
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// testUser();
const jwt = require('jsonwebtoken');

const generate = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
};

const verify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

module.exports = {
  generate,
  verify
};
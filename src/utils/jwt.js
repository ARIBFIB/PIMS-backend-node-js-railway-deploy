const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/auth');

const sign = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });
};

const verify = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  sign,
  verify
};
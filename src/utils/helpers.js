const validator = require('validator');

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Format response
const formatResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return response;
};

// Pagination helper
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// Get pagination data
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 0;
  // Convert BigInt to Number for MariaDB compatibility
  const totalItemsNum = typeof totalItems === 'bigint' ? Number(totalItems) : totalItems;
  const totalPages = Math.ceil(totalItemsNum / limit);
  
  return { totalItems: totalItemsNum, items, totalPages, currentPage };
};

// Convert BigInt values to Number in objects
const convertBigIntToNumber = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  } else if (obj !== null && typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (typeof obj[key] === 'bigint') {
        converted[key] = Number(obj[key]);
      } else if (obj[key] !== null && typeof obj[key] === 'object') {
        converted[key] = convertBigIntToNumber(obj[key]);
      } else {
        converted[key] = obj[key];
      }
    }
    return converted;
  }
  return obj;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  formatResponse,
  getPagination,
  getPagingData,
  convertBigIntToNumber
};
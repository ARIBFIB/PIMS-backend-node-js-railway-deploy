const pool = require('../config/database');
// Removed bcrypt import since we're removing password hashing

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, password, role = 'operator' } = userData;
    // Store password as plain text for testing purposes
    const plainPassword = password;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, plainPassword, role]
      );
      return { id: result.insertId, name, email, role };
    } catch (error) {
      throw error;
    }
  }

  // Simple string comparison instead of bcrypt comparison
  static async verifyPassword(plainPassword, storedPassword) {
    return plainPassword === storedPassword;
  }
}

module.exports = User;
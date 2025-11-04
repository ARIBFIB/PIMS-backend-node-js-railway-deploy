const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { formatResponse } = require('../utils/helpers');

class User {
  static async create(userData) {
    const { name, email, password, role = 'staff' } = userData;
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      // Get created user
      const newUser = await this.findById(result.insertId);
      
      return formatResponse(true, 'User created successfully', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return formatResponse(false, 'Email already exists');
      }
      throw error;
    }
  }
  
  static async findByEmail(email) {
    try {
      const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const rows = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  
  static async getAll(page = 0, size = 10) {
    try {
      const { limit, offset } = require('../utils/helpers').getPagination(page, size);
      
      const rows = await pool.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
      const totalItems = countResult[0].total;
      
      return require('../utils/helpers').getPagingData(
        { count: totalItems, rows },
        page,
        limit
      );
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, userData) {
    const { name, email, role } = userData;
    
    try {
      await pool.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
      
      const updatedUser = await this.findById(id);
      return formatResponse(true, 'User updated successfully', updatedUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return formatResponse(false, 'Email already exists');
      }
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return formatResponse(false, 'User not found');
      }
      
      return formatResponse(true, 'User deleted successfully');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
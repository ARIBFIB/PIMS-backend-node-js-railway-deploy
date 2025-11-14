const { pool } = require('../config/database');

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

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, password, role = 'operator' } = userData;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      return { id: result.insertId, name, email, role };
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT id, name, email, role, createdAt, updatedAt FROM users ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, userData) {
    const { name, email, password, role } = userData;
    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    const params = [name, email, role];
    
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    try {
      await pool.execute(query, params);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getRoles(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT r.* 
        FROM roles r
        JOIN user_roles ur ON r.id = ur.roleId
        WHERE ur.userId = ?
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getPermissions(userId) {
    try {
      // First, get the user to check if they're an admin
      const user = await this.findById(userId);
      if (!user) {
        return [];
      }
      
      // If user is admin, they have all permissions
      if (user.role === 'admin') {
        const [allPermissions] = await pool.execute('SELECT name FROM permissions');
        return allPermissions.map(p => p.name);
      }
      
      // Get permissions from roles
      const [rolePermissions] = await pool.execute(`
        SELECT DISTINCT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permissionId
        JOIN user_roles ur ON rp.roleId = ur.roleId
        WHERE ur.userId = ?
      `, [userId]);
      
      // Get custom user permissions
      const [userPermissions] = await pool.execute(`
        SELECT p.name
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permissionId
        WHERE up.userId = ?
      `, [userId]);
      
      // Combine and deduplicate permissions
      const allPermissions = [...rolePermissions, ...userPermissions];
      const uniquePermissions = [...new Set(allPermissions.map(p => p.name))];
      
      return uniquePermissions;
    } catch (error) {
      throw error;
    }
  }

  // Verify password (in a real app, this would hash and compare)
  static async verifyPassword(inputPassword, storedPassword) {
    // For this simple implementation, we're just comparing plain text passwords
    // In a real application, you would hash the input password and compare it to the stored hash
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(inputPassword, storedPassword);
  }

  // Assign a permission to a user
  static async assignPermission(userId, permissionId) {
    try {
      // Check if the assignment already exists
      const [existing] = await pool.execute(
        'SELECT id FROM user_permissions WHERE userId = ? AND permissionId = ?',
        [userId, permissionId]
      );
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // Create the assignment
      const [result] = await pool.execute(
        'INSERT INTO user_permissions (userId, permissionId) VALUES (?, ?)',
        [userId, permissionId]
      );
      
      return { id: result.insertId, userId, permissionId };
    } catch (error) {
      throw error;
    }
  }

  // Remove a permission from a user
  static async removePermission(userId, permissionId) {
    try {
      await pool.execute(
        'DELETE FROM user_permissions WHERE userId = ? AND permissionId = ?',
        [userId, permissionId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get user's custom permissions (not from roles)
  static async getCustomPermissions(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permissionId
        WHERE up.userId = ?
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
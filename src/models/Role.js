const pool = require('../config/database');

class Role {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM roles ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.execute('SELECT * FROM roles WHERE name = ?', [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(roleData) {
    const { name, description } = roleData;
    try {
      const [result] = await pool.execute(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description]
      );
      return { id: result.insertId, name, description };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, roleData) {
    const { name, description } = roleData;
    try {
      await pool.execute(
        'UPDATE roles SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      );
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getPermissions(roleId) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.* 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permissionId
        WHERE rp.roleId = ?
      `, [roleId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async assignPermission(roleId, permissionId) {
    try {
      await pool.execute(
        'INSERT IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)',
        [roleId, permissionId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async removePermission(roleId, permissionId) {
    try {
      await pool.execute(
        'DELETE FROM role_permissions WHERE roleId = ? AND permissionId = ?',
        [roleId, permissionId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Role;
// const pool = require('../config/database');
const pool = require('../config/dbPool'); // Instead of database

class Permission {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM permissions ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM permissions WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.execute('SELECT * FROM permissions WHERE name = ?', [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(permissionData) {
    const { name, description } = permissionData;
    try {
      const [result] = await pool.execute(
        'INSERT INTO permissions (name, description) VALUES (?, ?)',
        [name, description]
      );
      return { id: result.insertId, name, description };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, permissionData) {
    const { name, description } = permissionData;
    try {
      await pool.execute(
        'UPDATE permissions SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      );
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM permissions WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Permission;
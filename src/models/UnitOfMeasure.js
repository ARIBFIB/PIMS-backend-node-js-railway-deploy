const pool = require('../config/dbPool'); 

class UnitOfMeasure {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM unit_of_measures ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM unit_of_measures WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(uomData) {
    const { name, symbol } = uomData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO unit_of_measures (name, symbol) VALUES (?, ?)',
        [name, symbol]
      );
      return { id: result.insertId, ...uomData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, uomData) {
    const { name, symbol } = uomData;
    
    try {
      await pool.execute(
        'UPDATE unit_of_measures SET name = ?, symbol = ? WHERE id = ?',
        [name, symbol, id]
      );
      return { id, ...uomData };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM unit_of_measures WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UnitOfMeasure;
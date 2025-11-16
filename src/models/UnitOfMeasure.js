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
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete related records first to avoid foreign key constraint violations
      await connection.execute('DELETE FROM recipe_ingredients WHERE uomId = ?', [id]);
      await connection.execute('DELETE FROM purchase_order_items WHERE uomId = ?', [id]);
      await connection.execute('DELETE FROM materials WHERE uomId = ?', [id]);
      
      // Now delete the unit_of_measures
      const [result] = await connection.execute(
        'DELETE FROM unit_of_measures WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Delete UOM error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async deleteAll() {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete related records first to avoid foreign key constraint violations
      await connection.execute('DELETE FROM recipe_ingredients WHERE uomId IS NOT NULL');
      await connection.execute('DELETE FROM purchase_order_items WHERE uomId IS NOT NULL');
      await connection.execute('DELETE FROM materials WHERE uomId IS NOT NULL');
      
      // Now delete all unit_of_measures
      const [result] = await connection.execute('DELETE FROM unit_of_measures');
      
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = UnitOfMeasure;
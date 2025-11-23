const pool = require('../config/dbPool');
const SubCategory = require('./SubCategory');

class Material {
  static async getAll() {
    try {
      const query = `
        SELECT m.*, c.name as categoryName, sc.name as subCategoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN sub_categories sc ON m.subCategoryId = sc.id
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        ORDER BY m.name
      `;
      console.log('Executing Material.getAll query:', query);
      const [rows] = await pool.execute(query);
      console.log('Material.getAll query returned', rows.length, 'rows');
      
      // For now, return the data as is since we're not actually storing multiple sub-categories
      // The frontend will handle the UI for multiple selection but we'll only store one in the DB
      return rows.map(material => ({
        ...material,
        subCategoryNames: material.subCategoryName ? material.subCategoryName : null
      }));
    } catch (error) {
      console.error('Error in Material.getAll:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('Executing Material.findById for ID:', id);
      const [rows] = await pool.execute(
        'SELECT m.*, c.name as categoryName, sc.name as subCategoryName, u.name as uomName, u.symbol as uomSymbol FROM materials m LEFT JOIN categories c ON m.categoryId = c.id LEFT JOIN sub_categories sc ON m.subCategoryId = sc.id LEFT JOIN unit_of_measures u ON m.uomId = u.id WHERE m.id = ?',
        [id]
      );
      console.log('Material.findById query returned', rows.length, 'rows');
      
      if (rows.length > 0) {
        const material = rows[0];
        // For now, return the data as is since we're not actually storing multiple sub-categories
        // The frontend will handle the UI for multiple selection but we'll only store one in the DB
        return {
          ...material,
          subCategoryNames: material.subCategoryName ? material.subCategoryName : null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in Material.findById:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async create(materialData) {
    const { name, unit, categoryId, subCategoryId, uomId, quantity, lowStockThreshold } = materialData;
    try {
      console.log('Executing Material.create with data:', materialData);
      console.log('Sub-category ID being stored:', subCategoryId);
      
      const [result] = await pool.execute(
        'INSERT INTO materials (name, unit, categoryId, subCategoryId, uomId, quantity, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, unit || 'N/A', categoryId || null, subCategoryId || null, uomId || null, quantity || 0, lowStockThreshold]
      );
      console.log('Material.create inserted with ID:', result.insertId);
      return { id: result.insertId, ...materialData };
    } catch (error) {
      console.error('Error in Material.create:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async update(id, materialData) {
    const { name, categoryId, subCategoryId, uomId, lowStockThreshold } = materialData;
    
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    
    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (categoryId !== undefined) {
      fields.push('categoryId = ?');
      values.push(categoryId || null);
    }
    if (subCategoryId !== undefined) {
      fields.push('subCategoryId = ?');
      values.push(subCategoryId || null);
      console.log('Sub-category ID being updated:', subCategoryId);
    }
    if (uomId !== undefined) {
      fields.push('uomId = ?');
      values.push(uomId || null);
    }
    if (lowStockThreshold !== undefined) {
      fields.push('lowStockThreshold = ?');
      values.push(lowStockThreshold);
    }
    
    // If no fields to update, return early
    if (fields.length === 0) {
      return { id };
    }
    
    values.push(id); // Add id for WHERE clause
    
    try {
      console.log('Executing Material.update for ID:', id, 'with fields:', fields, 'and values:', values);
      await pool.execute(
        `UPDATE materials SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      console.log('Material.update completed for ID:', id);
      return { id, ...materialData };
    } catch (error) {
      console.error('Error in Material.update:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async updateQuantity(id, quantity) {
    try {
      // Validate and sanitize the quantity value
      let sanitizedQuantity;
      if (typeof quantity === 'string') {
        // Remove any non-numeric characters except decimal point and minus sign
        sanitizedQuantity = parseFloat(quantity.replace(/[^0-9.-]+/g, ''));
      } else {
        sanitizedQuantity = Number(quantity);
      }
      
      // Check if the sanitized quantity is a valid number
      if (isNaN(sanitizedQuantity)) {
        throw new Error(`Invalid quantity value: ${quantity}`);
      }
      
      console.log('Executing Material.updateQuantity for ID:', id, 'with quantity:', sanitizedQuantity);
      await pool.execute(
        'UPDATE materials SET quantity = ? WHERE id = ?',
        [sanitizedQuantity, id]
      );
      console.log('Material.updateQuantity completed for ID:', id);
      return { id, quantity: sanitizedQuantity };
    } catch (error) {
      console.error('Error in Material.updateQuantity:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async getLowStockItems() {
    try {
      console.log('Executing Material.getLowStockItems query...');
      const query = `
        SELECT m.*, c.name as categoryName, sc.name as subCategoryName, u.name as uomName, u.symbol as uomSymbol 
        FROM materials m 
        LEFT JOIN categories c ON m.categoryId = c.id 
        LEFT JOIN sub_categories sc ON m.subCategoryId = sc.id
        LEFT JOIN unit_of_measures u ON m.uomId = u.id 
        WHERE CAST(m.quantity AS DECIMAL(10,2)) <= CAST(m.lowStockThreshold AS DECIMAL(10,2))
      `;
      console.log('Query:', query);
      const [rows] = await pool.execute(query);
      console.log('Material.getLowStockItems query returned', rows.length, 'rows');
      
      // Log the first few rows to debug sub-category information
      if (rows.length > 0) {
        console.log('First few low stock items:', rows.slice(0, 3));
      }
      
      // For now, return the data as is since we're not actually storing multiple sub-categories
      // The frontend will handle the UI for multiple selection but we'll only store one in the DB
      return rows.map(material => ({
        ...material,
        categoryName: material.categoryName || null,
        uomName: material.uomName || null,
        uomSymbol: material.uomSymbol || null,
        subCategoryNames: material.subCategoryName || null
      }));
    } catch (error) {
      console.error('Error in Material.getLowStockItems:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      
      // Try a simpler query as fallback
      try {
        console.log('Trying fallback query without joins...');
        const [rows] = await pool.execute('SELECT * FROM materials WHERE CAST(quantity AS DECIMAL(10,2)) <= CAST(lowStockThreshold AS DECIMAL(10,2))');
        console.log('Fallback query returned', rows.length, 'rows');
        
        // For the fallback, we need to get sub-category names separately
        const materialsWithSubCategories = await Promise.all(rows.map(async (row) => {
          let subCategoryName = null;
          if (row.subCategoryId) {
            try {
              const [subCatRows] = await pool.execute('SELECT name FROM sub_categories WHERE id = ?', [row.subCategoryId]);
              if (subCatRows.length > 0) {
                subCategoryName = subCatRows[0].name;
              }
            } catch (subCatError) {
              console.error('Error fetching sub-category name for fallback:', subCatError);
            }
          }
          
          return {
            ...row,
            categoryName: null,
            uomName: null,
            uomSymbol: null,
            subCategoryNames: subCategoryName
          };
        }));
        
        return materialsWithSubCategories;
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  static async delete(id) {
    try {
      console.log('Executing Material.delete for ID:', id);
      const [result] = await pool.execute(
        'DELETE FROM materials WHERE id = ?',
        [id]
      );
      console.log('Material.delete affected', result.affectedRows, 'rows');
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Material.delete:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    }
  }

  static async deleteAll() {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete related records first to avoid foreign key constraint violations
      await connection.execute('DELETE FROM recipe_ingredients');
      await connection.execute('DELETE FROM purchase_order_items');
      
      // Now delete all materials
      const [result] = await connection.execute('DELETE FROM materials');
      
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      console.error('Error in Material.deleteAll:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error sqlState:', error.sqlState);
      console.error('Error sqlMessage:', error.sqlMessage);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Material;
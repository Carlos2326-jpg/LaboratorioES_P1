const db = require('../Config/DataBase');

class BaseModel {
  constructor(tableName) {
    this.table = tableName;
    this.db = db;
  }

  async all() {
    return await this.db.query(`SELECT * FROM ${this.table}`);
  }

  async find(id, idField = 'id') {
    const rows = await this.db.query(`SELECT * FROM ${this.table} WHERE ${idField} = ?`, [id]);
    return rows[0];
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');

    const result = await this.db.query(
      `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${placeholders})`,
      values
    );
    return { id: result.insertId, ...data };
  }

  async update(id, data, idField = 'id') {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(',');
    const values = [...Object.values(data), id];

    const result = await this.db.query(
      `UPDATE ${this.table} SET ${sets} WHERE ${idField} = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id, idField = 'id') {
    const result = await this.db.query(`DELETE FROM ${this.table} WHERE ${idField} = ?`, [id]);
    return result.affectedRows > 0;
  }

  async count() {
    const rows = await this.db.query(`SELECT COUNT(*) as total FROM ${this.table}`);
    return rows[0].total;
  }
}

module.exports = BaseModel;
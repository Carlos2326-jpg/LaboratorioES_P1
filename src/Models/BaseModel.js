// src/Models/BaseModel.js
const db = require('../Config/DataBase');

class BaseModel {
    constructor(tableName, idField = 'id') {
        this.table = tableName;
        this.idField = idField;
        this.db = db;
    }

    async all(fields = '*') {
        return await this.db.query(`SELECT ${fields} FROM ${this.table}`);
    }

    async find(id, fields = '*') {
        const rows = await this.db.query(
            `SELECT ${fields} FROM ${this.table} WHERE ${this.idField} = ? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }

    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const result = await this.db.query(
            `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`,
            values
        );
        return { [this.idField]: result.insertId, ...data };
    }

    // FIX: o parâmetro `fields` causava bug — sets era baseado em `fields`
    // mas `values` era baseado em Object.values(data). Removido o param `fields`
    // para manter consistência: sempre usa as chaves do próprio `data`.
    async update(id, data) {
        const keys = Object.keys(data);
        if (keys.length === 0) return false;

        const sets = keys.map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const result = await this.db.query(
            `UPDATE ${this.table} SET ${sets} WHERE ${this.idField} = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    async delete(id) {
        const result = await this.db.query(
            `DELETE FROM ${this.table} WHERE ${this.idField} = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    async count(whereClause = '1=1') {
        const rows = await this.db.query(
            `SELECT COUNT(*) as total FROM ${this.table} WHERE ${whereClause}`
        );
        return rows[0].total;
    }
}

module.exports = BaseModel;
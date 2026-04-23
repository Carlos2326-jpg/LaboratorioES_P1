const mysql = require("mysql2/promise");

class Cliente {
    constructor(dbConfig) {
        this.pool = mysql.createPool(dbConfig);
        this.table = "Usuario";
    }

    async all() {
        const query = `SELECT * FROM ${this.table}`;
        const [rows] = await this.pool.query(query);
        return rows;
    }

    async find(id) {
        const query = `SELECT * FROM ${this.table} WHERE idUsuario = ?`;
        const [rows] = await this.pool.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const query = `INSERT INTO ${this.table} (nomeCompleto, email, senha, nivelAcesso) 
                    VALUES (?, ?, ?, ?)`;
        const [result] = await this.pool.query(query, [
            dados.nomeCompleto,
            dados.email,
            dados.senha,
            dados.nivelAcesso
        ]);
        return { idUsuario: result.insertId, ...dados };
    }

    async update(id, dados) {
        const query = `UPDATE ${this.table} 
                SET nomeCompleto = ?,
                    email = ?,
                    senha = ?,
                    nivelAcesso = ?
                WHERE idUsuario = ?`;
        const [result] = await this.pool.query(query, [
            dados.nomeCompleto,
            dados.email,
            dados.senha,
            dados.nivelAcesso,
            id  // Corrigido: antes estava 'idUsuario' que não existia
        ]);
        return result.affectedRows > 0;
    }

    async delete(id) {
        const query = `DELETE FROM ${this.table} WHERE idUsuario = ?`;
        const [result] = await this.pool.query(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Cliente;
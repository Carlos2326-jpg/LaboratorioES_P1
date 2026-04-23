const mysql = require("mysql2/promise");

class Categorias {
    constructor(dbConfig) {
        this.pool = mysql.createPool(dbConfig);
        this.table = "Categorias";
    }

    async all() {
        const query = `SELECT * FROM ${this.table}`;
        const [rows] = await this.pool.query(query);
        return rows;
    }

    async find(id) {
        const query = `SELECT * FROM ${this.table} WHERE idCategoria = ?`;
        const [rows] = await this.pool.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const query = `INSERT INTO ${this.table} (nome, slug, Descricao, imagemURL) 
                    VALUES (?, ?, ?, ?)`;
        const [result] = await this.pool.query(query, [
            dados.nome,
            dados.slug,
            dados.Descricao,
            dados.imagemURL
        ]);
        return { idUsuario: result.insertId, ...dados };
    }

    async update(id, dados) {
        const query = `UPDATE ${this.table} 
                SET nome = ?, 
                slug = ?, 
                Descricao = ?, 
                imagemURL = ?
                WHERE idCategoria = ?`;
        const [result] = await this.pool.query(query, [
            dados.nome,
            dados.slug,
            dados.Descricao,
            dados.imagemURL,
            id  
        ]);
        return result.affectedRows > 0;
    }

    async delete(id) {
        const query = `DELETE FROM ${this.table} WHERE idCategoria = ?`;
        const [result] = await this.pool.query(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Cliente;
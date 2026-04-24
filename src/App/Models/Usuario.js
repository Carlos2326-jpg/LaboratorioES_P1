const mysql = require("mysql2/promise");

class Usuarios {
    constructor(dbConfig) {
        this.pool = mysql.createPool(dbConfig);
        this.table = "Usuario";
    }

    async all() {
        const query = `SELECT * FROM ${this.table}`;
        const [rows] = await this.pool.query(query);
        // Remove senhas por segurança
        return rows.map(user => {
            delete user.senha;
            return user;
        });
    }

    async find(id) {
        const query = `SELECT * FROM ${this.table} WHERE idUsuario = ?`;
        const [rows] = await this.pool.query(query, [id]);
        if (rows[0]) {
            delete rows[0].senha; // Remove senha por segurança
        }
        return rows[0];
    }

    async findByEmail(email) {
        const query = `SELECT * FROM ${this.table} WHERE email = ?`;
        const [rows] = await this.pool.query(query, [email]);
        if (rows[0]) {
            delete rows[0].senha; // Remove senha por segurança
        }
        return rows[0];
    }

    async login(email, senha) {
        const query = `SELECT * FROM ${this.table} WHERE email = ? AND senha = ?`;
        const [rows] = await this.pool.query(query, [email, senha]);
        if (rows[0]) {
            delete rows[0].senha; // Remove senha por segurança
        }
        return rows[0] || null;
    }

    async emailExists(email) {
        const query = `SELECT COUNT(*) as count FROM ${this.table} WHERE email = ?`;
        const [rows] = await this.pool.query(query, [email]);
        return rows[0].count > 0;
    }

    async create(dados) {
        const exists = await this.emailExists(dados.email);
        if (exists) {
            throw new Error('Email já cadastrado');
        }

        const query = `INSERT INTO ${this.table} (nomeCompleto, email, senha, nivelAcesso) 
                    VALUES (?, ?, ?, ?)`;
        const [result] = await this.pool.query(query, [
            dados.nomeCompleto,
            dados.email,
            dados.senha,
            dados.nivelAcesso || 'usuario'
        ]);

        const newUser = { idUsuario: result.insertId, ...dados };
        delete newUser.senha;
        return newUser;
    }

    async update(id, dados) {
        // Se não veio senha nos dados, mantém a atual
        if (!dados.senha) {
            return this.updateWithoutPassword(id, dados);
        }

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
            id
        ]);
        return result.affectedRows > 0;
    }

    async updateWithoutPassword(id, dados) {
        const query = `UPDATE ${this.table} 
                    SET nomeCompleto = ?,
                        email = ?,
                        nivelAcesso = ?
                    WHERE idUsuario = ?`;
        const [result] = await this.pool.query(query, [
            dados.nomeCompleto,
            dados.email,
            dados.nivelAcesso,
            id
        ]);
        return result.affectedRows > 0;
    }

    async updatePassword(id, novaSenha) {
        const query = `UPDATE ${this.table} SET senha = ? WHERE idUsuario = ?`;
        const [result] = await this.pool.query(query, [novaSenha, id]);
        return result.affectedRows > 0;
    }

    async delete(id) {
        const query = `DELETE FROM ${this.table} WHERE idUsuario = ?`;
        const [result] = await this.pool.query(query, [id]);
        return result.affectedRows > 0;
    }

    async findByNivelAcesso(nivelAcesso) {
        const query = `SELECT * FROM ${this.table} WHERE nivelAcesso = ?`;
        const [rows] = await this.pool.query(query, [nivelAcesso]);
        return rows.map(user => {
            delete user.senha;
            return user;
        });
    }
}

module.exports = Usuarios;
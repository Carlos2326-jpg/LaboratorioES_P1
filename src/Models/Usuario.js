const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class UsuarioModel extends BaseModel {
    constructor() {
        super('Usuario');
        this.idField = 'idUsuario';
    }

    async findByEmail(email) {
        const rows = await this.db.query(`SELECT * FROM ${this.table} WHERE email = ?`, [email]);
        return rows[0];
    }

    async findByResetToken(token) {
        const rows = await this.db.query(
            `SELECT * FROM ${this.table} WHERE resetPasswordToken = ?`,
            [token]
        );
        return rows[0];
    }

    async login(email, senha) {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return null;

        delete user.senha;
        return user;
    }

    async create(data) {
        const exists = await this.findByEmail(data.email);
        if (exists) {
            throw new Error('Email já cadastrado');
        }

        const hashedPassword = await bcrypt.hash(data.senha, 10);
        data.senha = hashedPassword;

        return await super.create(data);
    }

    async updatePassword(id, novaSenha) {
        const hashedPassword = await bcrypt.hash(novaSenha, 10);
        return await this.update(id, { senha: hashedPassword }, this.idField);
    }

    async findByNivelAcesso(nivelAcesso) {
        return await this.db.query(`SELECT * FROM ${this.table} WHERE nivelAcesso = ?`, [nivelAcesso]);
    }

    async getUserWithStats(id) {
        const query = `
            SELECT u.*, 
                COUNT(DISTINCT p.idPostagem) as total_postagens,
                COUNT(DISTINCT c.idComentario) as total_comentarios
            FROM ${this.table} u
            LEFT JOIN Postagem p ON u.idUsuario = p.usuario_idUsuario
            LEFT JOIN Comentario c ON u.idUsuario = c.usuario_id
            WHERE u.idUsuario = ?
            GROUP BY u.idUsuario
        `;
        const rows = await this.db.query(query, [id]);
        if (rows[0]) delete rows[0].senha;
        return rows[0];
    }
}

module.exports = UsuarioModel;
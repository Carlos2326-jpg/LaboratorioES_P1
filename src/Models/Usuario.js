const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class UsuarioModel extends BaseModel {
    constructor() {
        super('Usuario', 'idUsuario');
    }

    async findByEmail(email) {
        const rows = await this.db.query(
            `SELECT * FROM ${this.table} WHERE email = ? LIMIT 1`, 
            [email]
        );
        return rows[0] || null;
    }

    async findByResetToken(token) {
        const rows = await this.db.query(
            `SELECT * FROM ${this.table} WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW() LIMIT 1`,
            [token]
        );
        return rows[0] || null;
    }

    // Verificar OTP
    async verifyOTP(email, otp) {
        const user = await this.findByEmail(email);
        if (!user || !user.otp || user.otp !== otp) {
            return null;
        }
        
        if (new Date(user.otp_expires) < new Date()) {
            return null;
        }
        
        return user;
    }

    // Verificar se tem OTP pendente
    async hasPendingOTP(email) {
        const user = await this.findByEmail(email);
        if (!user?.otp) return false;
        return new Date(user.otp_expires) > new Date();
    }

    // Limpar OTP
    async clearOTP(idUsuario) {
        return await this.update(idUsuario, { 
            otp: null, 
            otp_expires: null 
        });
    }

    async login(email, senha) {
        const user = await this.findByEmail(email);
        if (!user || user.status !== 'ativo') return null;

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return null;

        // Atualizar último acesso
        await this.update(user.idUsuario, { ultimoAcesso: new Date() });
        
        // Remover senha do retorno
        const { senha: _, ...userSemSenha } = user;
        return userSemSenha;
    }

    async create(data) {
        const exists = await this.findByEmail(data.email);
        if (exists) {
            throw new Error('Email já cadastrado');
        }

        const hashedPassword = await bcrypt.hash(data.senha, 12);
        return await super.create({ ...data, senha: hashedPassword });
    }

    async updatePassword(id, novaSenha) {
        const hashedPassword = await bcrypt.hash(novaSenha, 12);
        return await super.update(id, { senha: hashedPassword });
    }

    async findByNivelAcesso(nivelAcesso) {
        return await this.db.query(`SELECT * FROM ${this.table} WHERE nivelAcesso = ?`, [nivelAcesso]);
    }

    async getUserWithStats(id) {
        const query = `
            SELECT 
                u.*, 
                COUNT(DISTINCT p.idPostagem) as total_postagens,
                COUNT(DISTINCT c.id) as total_categorias
            FROM ${this.table} u
            LEFT JOIN Postagem p ON u.${this.idField} = p.usuario_idUsuario
            LEFT JOIN Postagem_Categoria c ON p.idPostagem = c.postagem_id
            WHERE u.${this.idField} = ?
            GROUP BY u.${this.idField}
        `;
        const rows = await this.db.query(query, [id]);
        if (rows[0]) {
            const { senha: _, ...user } = rows[0];
            return user;
        }
        return null;
    }

    async search(filtros = {}) {
        let query = `SELECT * FROM ${this.table} WHERE 1=1`;
        const params = [];

        if (filtros.busca) {
            query += ` AND (nomeCompleto LIKE ? OR email LIKE ?)`;
            params.push(`%${filtros.busca}%`, `%${filtros.busca}%`);
        }

        if (filtros.nivelAcesso) {
            query += ` AND nivelAcesso = ?`;
            params.push(filtros.nivelAcesso);
        }

        if (filtros.status) {
            query += ` AND status = ?`;
            params.push(filtros.status);
        }

        query += ` ORDER BY dataCadastro DESC`;
        return await this.db.query(query, params);
    }
}

module.exports = UsuarioModel;
// src/Models/Postagem.js
const BaseModel = require('./BaseModel');

class PostagemModel extends BaseModel {
    constructor() {
        super('Postagem', 'idPostagem');
    }

    async findBySlug(slug) {
        const query = `
            SELECT
                p.*,
                u.nomeCompleto as autor_nome,
                GROUP_CONCAT(DISTINCT c.nome SEPARATOR ', ') as categorias_nome
            FROM ${this.table} p
            LEFT JOIN Usuario u ON p.usuario_idUsuario = u.idUsuario
            LEFT JOIN Postagem_Categoria pc ON p.idPostagem = pc.postagem_id
            LEFT JOIN Categorias c ON pc.categoria_id = c.idCategoria
            WHERE p.slug = ?
            GROUP BY p.idPostagem
        `;
        const rows = await this.db.query(query, [slug]);
        return rows[0] || null;
    }

    async findByUsuario(usuarioId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return await this.db.query(
            `SELECT p.*,
             GROUP_CONCAT(DISTINCT c.nome SEPARATOR ', ') as categorias_nome
             FROM ${this.table} p
             LEFT JOIN Postagem_Categoria pc ON p.idPostagem = pc.postagem_id
             LEFT JOIN Categorias c ON pc.categoria_id = c.idCategoria
             WHERE p.usuario_idUsuario = ?
             GROUP BY p.idPostagem
             ORDER BY p.dataPostagem DESC
             LIMIT ? OFFSET ?`,
            [usuarioId, limit, offset]
        );
    }

    async findPublicadas(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT
                p.*,
                u.nomeCompleto as autor_nome,
                GROUP_CONCAT(DISTINCT c.nome SEPARATOR ', ') as categorias_nome
            FROM ${this.table} p
            LEFT JOIN Usuario u ON p.usuario_idUsuario = u.idUsuario
            LEFT JOIN Postagem_Categoria pc ON p.idPostagem = pc.postagem_id
            LEFT JOIN Categorias c ON pc.categoria_id = c.idCategoria
            WHERE p.status = 'publicado' AND p.dataPostagem <= NOW()
            GROUP BY p.idPostagem
            ORDER BY p.dataPostagem DESC
            LIMIT ? OFFSET ?
        `;
        return await this.db.query(query, [limit, offset]);
    }

    async findRecentes(limit = 5) {
        const query = `
            SELECT p.*, u.nomeCompleto as autor_nome
            FROM ${this.table} p
            LEFT JOIN Usuario u ON p.usuario_idUsuario = u.idUsuario
            WHERE p.status = 'publicado' AND p.dataPostagem <= NOW()
            ORDER BY p.dataPostagem DESC
            LIMIT ?
        `;
        return await this.db.query(query, [limit]);
    }

    async search(termo, categoriaId = null, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT
                p.*,
                u.nomeCompleto as autor_nome,
                GROUP_CONCAT(DISTINCT c.nome SEPARATOR ', ') as categorias_nome
            FROM ${this.table} p
            LEFT JOIN Usuario u ON p.usuario_idUsuario = u.idUsuario
            LEFT JOIN Postagem_Categoria pc ON p.idPostagem = pc.postagem_id
            LEFT JOIN Categorias c ON pc.categoria_id = c.idCategoria
            WHERE p.status = 'publicado'
            AND (p.titulo LIKE ? OR p.conteudo LIKE ? OR p.resumo LIKE ?)
        `;
        const params = [`%${termo}%`, `%${termo}%`, `%${termo}%`];

        if (categoriaId) {
            query += ` AND pc.categoria_id = ?`;
            params.push(parseInt(categoriaId));
        }

        query += ` GROUP BY p.idPostagem ORDER BY p.dataPostagem DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return await this.db.query(query, params);
    }

    async updateCategories(postagemId, categorias) {
        return await this.db.transaction(async (connection) => {
            await connection.query(
                `DELETE FROM Postagem_Categoria WHERE postagem_id = ?`,
                [postagemId]
            );

            for (const categoriaId of categorias) {
                await connection.query(
                    `INSERT INTO Postagem_Categoria (postagem_id, categoria_id) VALUES (?, ?)`,
                    [postagemId, categoriaId]
                );
            }
        });
    }

    async createWithCategories(data, categorias) {
        return await this.db.transaction(async (connection) => {
            const [result] = await connection.query(
                `INSERT INTO ${this.table} (
                    titulo, subTitulo, slug, resumo, conteudo,
                    imagem_destaque, imagem_alt, dataPostagem,
                    dataAtualizacao, destaque, status, usuario_idUsuario
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.titulo,
                    data.subTitulo || null,
                    data.slug,
                    data.resumo || null,
                    data.conteudo,
                    data.imagem_destaque || null,
                    data.imagem_alt || null,
                    data.dataPostagem || new Date(),
                    new Date(),
                    data.destaque || false,
                    data.status || 'rascunho',
                    data.usuario_idUsuario
                ]
            );

            const postagemId = result.insertId;

            for (const categoriaId of (categorias || [])) {
                await connection.query(
                    `INSERT INTO Postagem_Categoria (postagem_id, categoria_id) VALUES (?, ?)`,
                    [postagemId, categoriaId]
                );
            }

            return { idPostagem: postagemId, ...data };
        });
    }

    // FIX: método que estava sendo chamado mas não existia
    async incrementarVisualizacoes(idPostagem) {
        return await this.db.query(
            `UPDATE ${this.table} SET visualizacoes = visualizacoes + 1 WHERE idPostagem = ?`,
            [idPostagem]
        );
    }
}

module.exports = PostagemModel;

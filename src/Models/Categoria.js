const BaseModel = require('./BaseModel');

class CategoriaModel extends BaseModel {
    constructor() {
        super('Categorias', 'idCategoria');
    }

    async findBySlug(slug) {
        const rows = await this.db.query(
            `SELECT * FROM ${this.table} WHERE slug = ? AND status = 'ativo' LIMIT 1`, 
            [slug]
        );
        return rows[0] || null;
    }

    async getAllWithPostCount() {
        const query = `
            SELECT 
                c.*, 
                COUNT(DISTINCT pc.postagem_id) as total_postagens,
                COUNT(DISTINCT p.idPostagem) as postagens_publicadas
            FROM ${this.table} c
            LEFT JOIN Postagem_Categoria pc ON c.idCategoria = pc.categoria_id
            LEFT JOIN Postagem p ON pc.postagem_id = p.idPostagem AND p.status = 'publicado'
            GROUP BY c.idCategoria
            ORDER BY c.nome
        `;
        return await this.db.query(query);
    }

    async getForPostagemSelect() {
        return await this.db.query(
            `SELECT idCategoria as id, nome FROM ${this.table} WHERE status = 'ativo' ORDER BY nome`
        );
    }
}

module.exports = CategoriaModel;
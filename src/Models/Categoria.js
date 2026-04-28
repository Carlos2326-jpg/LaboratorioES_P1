const BaseModel = require('./BaseModel');

class CategoriaModel extends BaseModel {
    constructor() {
        super('Categorias');
        this.idField = 'idCategoria';
    }

    async findBySlug(slug) {
        const rows = await this.db.query(`SELECT * FROM ${this.table} WHERE slug = ?`, [slug]);
        return rows[0];
    }

    async getAllWithPostCount() {
        const query = `
            SELECT c.*, COUNT(p.idPostagem) as total_postagens 
            FROM ${this.table} c
            LEFT JOIN Postagem_Categoria pc ON c.idCategoria = pc.categoria_id
            LEFT JOIN Postagem p ON pc.postagem_id = p.idPostagem AND p.status = 'publicado'
            GROUP BY c.idCategoria
        `;
        return await this.db.query(query);
    }
}

module.exports = CategoriaModel;
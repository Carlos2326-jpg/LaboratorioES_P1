const BaseModel = require('./BaseModel');

class PostagemModel extends BaseModel {
  constructor() {
    super('Postagem');
    this.idField = 'idPostagem';
  }

  async findBySlug(slug) {
    const rows = await this.db.query(`SELECT * FROM ${this.table} WHERE slug = ?`, [slug]);
    return rows[0];
  }

  async findByUsuario(usuarioId) {
    return await this.db.query(`SELECT * FROM ${this.table} WHERE usuario_idUsuario = ? ORDER BY dataPostagem DESC`, [usuarioId]);
  }

  async findPublicados(limit = 10, offset = 0) {
    const query = `
            SELECT p.*, u.nomeCompleto as autor_nome,
                   GROUP_CONCAT(DISTINCT c.nome) as categorias
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

  async search(termo, categoriaId = null) {
    let query = `
            SELECT p.*, u.nomeCompleto as autor_nome
            FROM ${this.table} p
            LEFT JOIN Usuario u ON p.usuario_idUsuario = u.idUsuario
            LEFT JOIN Postagem_Categoria pc ON p.idPostagem = pc.postagem_id
            WHERE p.status = 'publicado' 
            AND (p.titulo LIKE ? OR p.conteudo LIKE ? OR p.resumo LIKE ?)
        `;
    const params = [`%${termo}%`, `%${termo}%`, `%${termo}%`];

    if (categoriaId) {
      query += ` AND pc.categoria_id = ?`;
      params.push(categoriaId);
    }

    query += ` GROUP BY p.idPostagem ORDER BY p.dataPostagem DESC`;

    return await this.db.query(query, params);
  }

  async updateCategories(postagemId, categorias) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(`DELETE FROM Postagem_Categoria WHERE postagem_id = ?`, [postagemId]);
      for (const categoriaId of categorias) {
        await connection.query(
          `INSERT INTO Postagem_Categoria (postagem_id, categoria_id) VALUES (?, ?)`,
          [postagemId, categoriaId]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createWithCategories(data, categorias) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO ${this.table} (titulo, subTitulo, slug, resumo, conteudo, 
                                            imagem_destaque, imagem_alt, dataPostagem, 
                                            dataAtualizacao, destaque, status, usuario_idUsuario) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.titulo, data.subTitulo, data.slug, data.resumo, data.conteudo,
        data.imagem_destaque, data.imagem_alt, data.dataPostagem, data.dataAtualizacao,
        data.destaque, data.status, data.usuario_idUsuario]
      );

      const postagemId = result.insertId;

      for (const categoriaId of categorias) {
        await connection.query(
          `INSERT INTO Postagem_Categoria (postagem_id, categoria_id) VALUES (?, ?)`,
          [postagemId, categoriaId]
        );
      }

      await connection.commit();
      return { idPostagem: postagemId, ...data };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = PostagemModel;
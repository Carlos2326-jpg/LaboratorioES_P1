const mysql = require("mysql2/promise");

class Postagem {
  constructor(dbConfig) {
    this.pool = mysql.createPool(dbConfig);
    this.table = "Postagem";
  }

  async all() {
    const query = `SELECT * FROM ${this.table}`;
    const [rows] = await this.pool.query(query);
    return rows;
  }

  async find(id) {
    const query = `SELECT * FROM ${this.table} WHERE idPostagem = ?`;
    const [rows] = await this.pool.query(query, [id]);
    return rows[0];
  }

  async findBySlug(slug) {
    const query = `SELECT * FROM ${this.table} WHERE slug = ?`;
    const [rows] = await this.pool.query(query, [slug]);
    return rows[0];
  }

  async findByUsuario(usuarioId) {
    const query = `SELECT * FROM ${this.table} WHERE usuario_idUsuario = ?`;
    const [rows] = await this.pool.query(query, [usuarioId]);
    return rows;
  }

  async findRecentes(limit = 10) {
    const query = `SELECT * FROM ${this.table} ORDER BY dataPostagem DESC LIMIT ?`;
    const [rows] = await this.pool.query(query, [limit]);
    return rows;
  }

  async create(dados) {
    const query = `INSERT INTO ${this.table} (
                  titulo, 
                  subTitulo, 
                  slug, 
                  resumo, 
                  conteudo, 
                  imagem_destaque, 
                  imagem_alt, 
                  dataPostagem, 
                  dataAtualizacao,
                  destaque,
                  usuario_idUsuario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await this.pool.query(query, [
      dados.titulo,
      dados.subTitulo,
      dados.slug,
      dados.resumo,
      dados.conteudo,
      dados.imagem_destaque,
      dados.imagem_alt,
      dados.dataPostagem,
      dados.dataAtualizacao,
      dados.destaque,
      dados.usuario_idUsuario
    ]);
    return { idPostagem: result.insertId, ...dados };
  }

  async update(id, dados) {
    const query = `UPDATE ${this.table} 
                SET  titulo = ?, 
                  subTitulo = ?, 
                  slug = ?,  
                  resumo = ?, 
                  conteudo = ?, 
                  imagem_destaque = ?, 
                  imagem_alt = ?, 
                  dataPostagem = ?, 
                  dataAtualizacao = ?,
                  destaque = ?
                WHERE idPostagem = ?`;
    const [result] = await this.pool.query(query, [
      dados.titulo,
      dados.subTitulo,
      dados.slug,
      dados.resumo,
      dados.conteudo,
      dados.imagem_destaque,
      dados.imagem_alt,
      dados.dataPostagem,
      dados.dataAtualizacao,
      dados.destaque,
      id
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `DELETE FROM ${this.table} WHERE idPostagem = ?`;
    const [result] = await this.pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Postagem; 
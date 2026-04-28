const CategoriaModel = require('../Models/Categoria');

class CategoriaService {
  constructor() {
    this.categoriaModel = new CategoriaModel();
  }

  async listarTodas() {
    return await this.categoriaModel.getAllWithPostCount();
  }

  async buscarPorId(id) {
    const categoria = await this.categoriaModel.find(id, this.categoriaModel.idField);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }
    return categoria;
  }

  async criarCategoria(dados, usuario) {
    if (!['admin', 'editor'].includes(usuario.nivelAcesso)) {
      throw new Error('Sem permissão para criar categorias');
    }

    const categoriaExistente = await this.categoriaModel.findBySlug(dados.slug);
    if (categoriaExistente) {
      throw new Error('Slug já existe');
    }

    return await this.categoriaModel.create(dados);
  }

  async atualizarCategoria(id, dados, usuario) {
    if (!['admin', 'editor'].includes(usuario.nivelAcesso)) {
      throw new Error('Sem permissão para editar categorias');
    }

    const categoria = await this.buscarPorId(id);
    const updated = await this.categoriaModel.update(id, dados, this.categoriaModel.idField);
    if (!updated) {
      throw new Error('Erro ao atualizar categoria');
    }

    return { ...categoria, ...dados };
  }

  async deletarCategoria(id, usuario) {
    if (usuario.nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem excluir categorias');
    }

    await this.buscarPorId(id);
    const deleted = await this.categoriaModel.delete(id, this.categoriaModel.idField);
    if (!deleted) {
      throw new Error('Erro ao excluir categoria');
    }

    return true;
  }
}

module.exports = CategoriaService;
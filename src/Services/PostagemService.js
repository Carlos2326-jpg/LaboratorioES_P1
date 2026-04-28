const PostagemModel = require('../Models/Postagem');
const slugify = require('slugify');

class PostagemService {
  constructor() {
    this.postagemModel = new PostagemModel();
  }

  gerarSlug(titulo) {
    return slugify(titulo, { lower: true, strict: true, locale: 'pt' });
  }

  async listarPublicadas(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const postagens = await this.postagemModel.findPublicados(limit, offset);
    const total = await this.postagemModel.count();

    return {
      data: postagens,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async buscarPorId(id) {
    const postagem = await this.postagemModel.find(id, this.postagemModel.idField);
    if (!postagem) {
      throw new Error('Postagem não encontrada');
    }
    return postagem;
  }

  async buscarPorSlug(slug) {
    const postagem = await this.postagemModel.findBySlug(slug);
    if (!postagem) {
      throw new Error('Postagem não encontrada');
    }
    return postagem;
  }

  async buscarPorUsuario(usuarioId) {
    return await this.postagemModel.findByUsuario(usuarioId);
  }

  async criarPostagem(dados, categorias, usuario) {
    if (!['admin', 'editor', 'autor'].includes(usuario.nivelAcesso)) {
      throw new Error('Sem permissão para criar postagens');
    }

    if (!dados.slug) {
      dados.slug = this.gerarSlug(dados.titulo);
    }

    if (usuario.nivelAcesso === 'autor') {
      dados.status = 'rascunho';
    } else {
      dados.status = dados.status || 'publicado';
    }

    dados.dataPostagem = dados.dataPostagem || new Date();
    dados.dataAtualizacao = new Date();
    dados.usuario_idUsuario = usuario.id;

    return await this.postagemModel.createWithCategories(dados, categorias);
  }

  async atualizarPostagem(id, dados, categorias, usuario) {
    const postagem = await this.buscarPorId(id);

    if (usuario.nivelAcesso !== 'admin' && postagem.usuario_idUsuario !== usuario.id) {
      throw new Error('Sem permissão para editar esta postagem');
    }

    dados.dataAtualizacao = new Date();
    const updated = await this.postagemModel.update(id, dados, this.postagemModel.idField);

    if (updated && categorias) {
      await this.postagemModel.updateCategories(id, categorias);
    }

    return updated;
  }

  async deletarPostagem(id, usuario) {
    const postagem = await this.buscarPorId(id);

    if (usuario.nivelAcesso !== 'admin' && postagem.usuario_idUsuario !== usuario.id) {
      throw new Error('Sem permissão para excluir esta postagem');
    }

    const deleted = await this.postagemModel.delete(id, this.postagemModel.idField);
    if (!deleted) {
      throw new Error('Erro ao excluir postagem');
    }

    return true;
  }

  async buscarPostagensRecentes(limit = 5) {
    return await this.postagemModel.findRecentes(limit);
  }

  async buscarPorTermo(termo, categoriaId = null) {
    if (!termo || termo.length < 3) {
      throw new Error('Termo de busca deve ter pelo menos 3 caracteres');
    }
    return await this.postagemModel.search(termo, categoriaId);
  }
}

module.exports = PostagemService;
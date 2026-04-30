const CategoriaModel = require('../Models/Categoria');
const slugify = require('slugify');

class CategoriaService {
    constructor() {
        this.categoriaModel = new CategoriaModel();
    }

    async listarTodas() {
        return await this.categoriaModel.getAllWithPostCount();
    }

    async buscarPorId(id) {
        const categoria = await this.categoriaModel.find(id);
        if (!categoria) {
            throw new Error('Categoria não encontrada');
        }
        return categoria;
    }

    async criarCategoria(dados, usuario) {
        // Verificação de permissão
        if (!['admin', 'editor'].includes(usuario.nivelAcesso)) {
            throw new Error('Sem permissão para criar categorias');
        }

        // Gerar slug se não fornecido
        if (!dados.slug) {
            dados.slug = slugify(dados.nome, { 
                lower: true, 
                strict: true, 
                locale: 'pt' 
            });
        }

        // Verificar slug duplicado
        const categoriaExistente = await this.categoriaModel.findBySlug(dados.slug);
        if (categoriaExistente) {
            throw new Error('Slug já existe');
        }

        // Sanitizar dados
        const dadosLimpos = {
            nome: dados.nome.trim(),
            slug: dados.slug.trim().toLowerCase(),
            descricao: dados.descricao ? dados.descricao.trim() : null,
            status: dados.status || 'ativo'
        };

        return await this.categoriaModel.create(dadosLimpos);
    }

    async atualizarCategoria(id, dados, usuario) {
        if (!['admin', 'editor'].includes(usuario.nivelAcesso)) {
            throw new Error('Sem permissão para editar categorias');
        }

        const categoriaExistente = await this.buscarPorId(id);
        
        // Gerar novo slug se nome mudou
        if (dados.nome && dados.nome.trim() !== categoriaExistente.nome) {
            dados.slug = slugify(dados.nome, { 
                lower: true, 
                strict: true, 
                locale: 'pt' 
            });
            
            // Verificar se novo slug já existe
            const slugExistente = await this.categoriaModel.findBySlug(dados.slug);
            if (slugExistente && slugExistente.idCategoria !== id) {
                throw new Error('Slug já existe');
            }
        }

        const dadosLimpos = {};
        if (dados.nome) dadosLimpos.nome = dados.nome.trim();
        if (dados.slug) dadosLimpos.slug = dados.slug.trim().toLowerCase();
        if (dados.descricao !== undefined) dadosLimpos.descricao = dados.descricao.trim() || null;
        if (dados.status) dadosLimpos.status = dados.status;

        const updated = await this.categoriaModel.update(id, dadosLimpos);
        if (!updated) {
            throw new Error('Erro ao atualizar categoria');
        }

        return await this.buscarPorId(id);
    }

    async deletarCategoria(id, usuario) {
        if (usuario.nivelAcesso !== 'admin') {
            throw new Error('Apenas administradores podem excluir categorias');
        }

        await this.buscarPorId(id);
        
        const deleted = await this.categoriaModel.delete(id);
        if (!deleted) {
            throw new Error('Erro ao excluir categoria');
        }

        return true;
    }

    async getCategoriasParaSelect() {
        return await this.categoriaModel.getForPostagemSelect();
    }
}

module.exports = CategoriaService;
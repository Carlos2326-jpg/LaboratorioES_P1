const PostagemModel = require('../Models/Postagem');
const CategoriaModel = require('../Models/Categoria');
const slugify = require('slugify');

class PostagemService {
    constructor() {
        this.postagemModel = new PostagemModel();
        this.categoriaModel = new CategoriaModel();
    }

    gerarSlug(titulo) {
        return slugify(titulo, { 
            lower: true, 
            strict: true, 
            locale: 'pt' 
        });
    }

    async listarPublicadas(page = 1, limit = 10) {
        const postagens = await this.postagemModel.findPublicadas(page, limit);
        const total = await this.postagemModel.count("status = 'publicado' AND dataPostagem <= NOW()");
        
        return {
            data: postagens,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async buscarPorId(id) {
        const postagem = await this.postagemModel.find(id);
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

    async buscarPorUsuario(usuarioId, page = 1, limit = 10) {
        return await this.postagemModel.findByUsuario(usuarioId, page, limit);
    }

    async criarPostagem(dadosPostagem, categorias, usuario) {
        // Verificação de permissão
        if (!['admin', 'editor', 'autor'].includes(usuario.nivelAcesso)) {
            throw new Error('Sem permissão para criar postagens');
        }

        // Validações básicas
        if (!dadosPostagem.titulo || dadosPostagem.titulo.trim().length < 3) {
            throw new Error('Título deve ter pelo menos 3 caracteres');
        }

        if (!dadosPostagem.conteudo || dadosPostagem.conteudo.trim().length < 10) {
            throw new Error('Conteúdo deve ter pelo menos 10 caracteres');
        }

        // Gerar slug
        const slug = dadosPostagem.slug || this.gerarSlug(dadosPostagem.titulo);
        const slugExistente = await this.postagemModel.findBySlug(slug);
        if (slugExistente) {
            throw new Error('Slug já existe. Escolha outro título.');
        }

        // Definir status baseado no nível de acesso
        let status = dadosPostagem.status;
        if (usuario.nivelAcesso === 'autor') {
            status = 'rascunho';
        } else if (!status) {
            status = 'publicado';
        }

        // Definir datas
        const dataPostagem = dadosPostagem.dataPostagem ? new Date(dadosPostagem.dataPostagem) : new Date();

        const dadosPostagemLimpos = {
            titulo: dadosPostagem.titulo.trim(),
            subTitulo: dadosPostagem.subTitulo?.trim() || null,
            slug: slug,
            resumo: dadosPostagem.resumo?.trim() || null,
            conteudo: dadosPostagem.conteudo.trim(),
            imagem_destaque: dadosPostagem.imagem_destaque || null,
            imagem_alt: dadosPostagem.imagem_alt?.trim() || null,
            dataPostagem,
            destaque: dadosPostagem.destaque || false,
            status,
            usuario_idUsuario: usuario.idUsuario
        };

        // Validar categorias
        if (categorias && categorias.length > 0) {
            const categoriasValidas = await this.categoriaModel.getForPostagemSelect();
            const idsValidos = categoriasValidas.map(c => c.id);
            const categoriasInvalidas = categorias.filter(id => !idsValidos.includes(id));
            
            if (categoriasInvalidas.length > 0) {
                throw new Error(`Categorias inválidas: ${categoriasInvalidas.join(', ')}`);
            }
        }

        return await this.postagemModel.createWithCategories(dadosPostagemLimpos, categorias || []);
    }

    async atualizarPostagem(id, dadosPostagem, categorias, usuario) {
        const postagem = await this.buscarPorId(id);

        // Verificação de permissão
        if (usuario.nivelAcesso !== 'admin' && postagem.usuario_idUsuario !== usuario.idUsuario) {
            throw new Error('Sem permissão para editar esta postagem');
        }

        // Preparar dados para update
        const dadosUpdate = {};
        if (dadosPostagem.titulo) {
            dadosUpdate.titulo = dadosPostagem.titulo.trim();
            if (!dadosPostagem.slug) {
                dadosUpdate.slug = this.gerarSlug(dadosPostagem.titulo);
            }
        }
        
        if (dadosPostagem.subTitulo !== undefined) {
            dadosUpdate.subTitulo = dadosPostagem.subTitulo?.trim() || null;
        }
        if (dadosPostagem.resumo !== undefined) {
            dadosUpdate.resumo = dadosPostagem.resumo?.trim() || null;
        }
        if (dadosPostagem.conteudo) {
            dadosUpdate.conteudo = dadosPostagem.conteudo.trim();
        }
        if (dadosPostagem.imagem_destaque !== undefined) {
            dadosUpdate.imagem_destaque = dadosPostagem.imagem_destaque || null;
        }
        if (dadosPostagem.imagem_alt !== undefined) {
            dadosUpdate.imagem_alt = dadosPostagem.imagem_alt?.trim() || null;
        }
        if (dadosPostagem.destaque !== undefined) {
            dadosUpdate.destaque = dadosPostagem.destaque;
        }
        if (dadosPostagem.status && ['admin', 'editor'].includes(usuario.nivelAcesso)) {
            dadosUpdate.status = dadosPostagem.status;
        }

        // Verificar slug único se alterado
        if (dadosUpdate.slug && dadosUpdate.slug !== postagem.slug) {
            const slugExistente = await this.postagemModel.findBySlug(dadosUpdate.slug);
            if (slugExistente) {
                throw new Error('Slug já existe');
            }
        }

        const updated = await this.postagemModel.update(id, dadosUpdate);
        if (!updated) {
            throw new Error('Erro ao atualizar postagem');
        }

        // Atualizar categorias se fornecidas
        if (categorias && categorias.length > 0) {
            await this.postagemModel.updateCategories(id, categorias);
        }

        return await this.buscarPorId(id);
    }

    async deletarPostagem(id, usuario) {
        const postagem = await this.buscarPorId(id);

        if (usuario.nivelAcesso !== 'admin' && postagem.usuario_idUsuario !== usuario.idUsuario) {
            throw new Error('Sem permissão para excluir esta postagem');
        }

        const deleted = await this.postagemModel.delete(id);
        if (!deleted) {
            throw new Error('Erro ao excluir postagem');
        }

        return true;
    }

    async buscarPostagensRecentes(limit = 5) {
        return await this.postagemModel.findRecentes(limit);
    }

    async buscarPorTermo(termo, categoriaId = null, page = 1, limit = 10) {
        if (!termo || termo.trim().length < 2) {
            throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
        }
        
        return await this.postagemModel.search(termo.trim(), categoriaId, page, limit);
    }
}

module.exports = PostagemService;
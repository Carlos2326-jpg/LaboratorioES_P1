// src/Services/PostagemService.js
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

    // ─── BUSCAR POR ID (única definição) ───
    async buscarPorId(id) {
        const postagem = await this.postagemModel.find(id);
        if (!postagem) {
            throw new Error('Postagem não encontrada');
        }

        // Buscar e anexar categorias como string legível
        const categorias = await this.buscarCategoriasDaPostagem(id);
        postagem.categorias_nome = categorias.map(c => c.nome).join(', ');

        return postagem;
    }

    // ─── BUSCAR POR ID COM ARRAY DE IDs DE CATEGORIAS (para edição) ───
    async buscarPorIdComCategorias(id) {
        const postagem = await this.postagemModel.find(id);
        if (!postagem) {
            throw new Error('Postagem não encontrada');
        }

        const categoriasQuery = `
            SELECT c.idCategoria, c.nome
            FROM Categorias c
            INNER JOIN Postagem_Categoria pc ON c.idCategoria = pc.categoria_id
            WHERE pc.postagem_id = ?
        `;
        const categorias = await this.postagemModel.db.query(categoriasQuery, [id]);

        return {
            ...postagem,
            categorias: categorias.map(c => c.idCategoria),
            categorias_nome: categorias.map(c => c.nome).join(', ')
        };
    }

    // ─── MÉTODO AUXILIAR: categorias de uma postagem ───
    async buscarCategoriasDaPostagem(postagemId) {
        return await this.postagemModel.db.query(`
            SELECT c.*
            FROM Categorias c
            JOIN Postagem_Categoria pc ON c.idCategoria = pc.categoria_id
            WHERE pc.postagem_id = ?
        `, [postagemId]);
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
        if (!['admin', 'editor', 'autor'].includes(usuario.nivelAcesso)) {
            throw new Error('Sem permissão para criar postagens');
        }

        if (!dadosPostagem.titulo || dadosPostagem.titulo.trim().length < 3) {
            throw new Error('Título deve ter pelo menos 3 caracteres');
        }

        if (!dadosPostagem.conteudo || dadosPostagem.conteudo.trim().length < 10) {
            throw new Error('Conteúdo deve ter pelo menos 10 caracteres');
        }

        const slug = dadosPostagem.slug || this.gerarSlug(dadosPostagem.titulo);
        const slugExistente = await this.postagemModel.findBySlug(slug);
        if (slugExistente) {
            throw new Error('Slug já existe. Escolha outro título.');
        }

        let status = dadosPostagem.status;
        if (usuario.nivelAcesso === 'autor') {
            status = 'rascunho';
        } else if (!status) {
            status = 'publicado';
        }

        const dataPostagem = dadosPostagem.dataPostagem
            ? new Date(dadosPostagem.dataPostagem)
            : new Date();

        const dadosPostagemLimpos = {
            titulo: dadosPostagem.titulo.trim(),
            subTitulo: dadosPostagem.subTitulo?.trim() || null,
            slug,
            resumo: dadosPostagem.resumo?.trim() || null,
            conteudo: dadosPostagem.conteudo.trim(),
            imagem_destaque: dadosPostagem.imagem_destaque || null,
            imagem_alt: dadosPostagem.imagem_alt?.trim() || null,
            dataPostagem,
            destaque: dadosPostagem.destaque || false,
            status,
            usuario_idUsuario: usuario.idUsuario
        };

        if (categorias && categorias.length > 0) {
            const categoriasValidas = await this.categoriaModel.getForPostagemSelect();
            const idsValidos = categoriasValidas.map(c => c.id);
            const categoriasInvalidas = categorias.filter(id => !idsValidos.includes(parseInt(id)));

            if (categoriasInvalidas.length > 0) {
                throw new Error(`Categorias inválidas: ${categoriasInvalidas.join(', ')}`);
            }
        }

        return await this.postagemModel.createWithCategories(
            dadosPostagemLimpos,
            (categorias || []).map(id => parseInt(id))
        );
    }

    async atualizarPostagem(id, dadosPostagem, categorias, usuario) {
        const postagem = await this.buscarPorId(id);

        if (usuario.nivelAcesso !== 'admin' && postagem.usuario_idUsuario !== usuario.idUsuario) {
            throw new Error('Sem permissão para editar esta postagem');
        }

        const dadosUpdate = {};

        if (dadosPostagem.titulo) {
            dadosUpdate.titulo = dadosPostagem.titulo.trim();
            if (!dadosPostagem.slug) {
                dadosUpdate.slug = this.gerarSlug(dadosPostagem.titulo);
            }
        }
        if (dadosPostagem.slug) {
            dadosUpdate.slug = dadosPostagem.slug.trim();
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
            if (slugExistente && slugExistente.idPostagem !== id) {
                throw new Error('Slug já existe');
            }
        }

        if (Object.keys(dadosUpdate).length > 0) {
            const updated = await this.postagemModel.update(id, dadosUpdate);
            if (!updated) {
                throw new Error('Erro ao atualizar postagem');
            }
        }

        // Atualizar categorias se fornecidas
        if (categorias && categorias.length > 0) {
            await this.postagemModel.updateCategories(
                id,
                categorias.map(cid => parseInt(cid))
            );
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

    async incrementarVisualizacoes(idPostagem) {
        try {
            await this.postagemModel.db.query(
                `UPDATE Postagem SET visualizacoes = visualizacoes + 1 WHERE idPostagem = ?`,
                [idPostagem]
            );
        } catch (error) {
            // Não propaga erro — visualizações são não-críticas
            console.error('Erro ao incrementar visualizações:', error.message);
        }
    }
}

module.exports = PostagemService;
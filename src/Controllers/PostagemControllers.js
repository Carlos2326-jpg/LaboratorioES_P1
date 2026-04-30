// src/Controllers/PostagemControllers.js
const PostagemService = require('../Services/PostagemService');

class PostagemController {
    constructor() {
        this.postagemService = new PostagemService();
    }

    async listarPublicadas(req, res) {
        try {
            const page  = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const resultado = await this.postagemService.listarPublicadas(page, limit);
            res.json({ success: true, ...resultado });
        } catch (error) {
            console.error('Erro ao listar postagens:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }
            const postagem = await this.postagemService.buscarPorId(id);
            res.json({ success: true, data: postagem });
        } catch (error) {
            console.error('Erro ao buscar postagem por ID:', error.message);
            res.status(404).json({ success: false, error: error.message });
        }
    }

    // Busca postagem com array de IDs de categorias — usada pela tela de edição
    async buscarPorIdParaEdicao(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            const postagem = await this.postagemService.buscarPorIdComCategorias(id);

            // Verificar permissão
            if (
                req.usuario.nivelAcesso !== 'admin' &&
                postagem.usuario_idUsuario !== req.usuario.idUsuario
            ) {
                return res.status(403).json({
                    success: false,
                    error: 'Sem permissão para editar esta postagem'
                });
            }

            res.json({ success: true, data: postagem });
        } catch (error) {
            console.error('Erro ao buscar para edição:', error.message);
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async buscarPorSlug(req, res) {
        try {
            const postagem = await this.postagemService.buscarPorSlug(req.params.slug);
            if (!postagem) {
                return res.status(404).json({ success: false, error: 'Postagem não encontrada' });
            }

            // Incrementar visualizações (não-bloqueante)
            this.postagemService.incrementarVisualizacoes(postagem.idPostagem).catch(() => {});

            res.json({ success: true, data: postagem });
        } catch (error) {
            console.error('Erro ao buscar por slug:', error.message);
            res.status(404).json({ success: false, error: 'Postagem não encontrada' });
        }
    }

    async buscarPorUsuario(req, res) {
        try {
            const usuarioId = req.usuario.idUsuario;
            const page  = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const postagens = await this.postagemService.buscarPorUsuario(usuarioId, page, limit);
            res.json({ success: true, data: postagens });
        } catch (error) {
            console.error('Erro ao buscar postagens do usuário:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async criar(req, res) {
        try {
            // Suporta tanto JSON ({ categorias: [...] }) quanto form-data (categorias[] )
            let categorias = req.body.categorias;
            if (!categorias && req.body['categorias[]']) {
                categorias = [].concat(req.body['categorias[]']);
            }
            categorias = (categorias || []).map(id => parseInt(id)).filter(Boolean);

            const { categorias: _removed, 'categorias[]': _removed2, ...dadosPostagem } = req.body;

            const postagem = await this.postagemService.criarPostagem(
                dadosPostagem,
                categorias,
                req.usuario
            );
            res.status(201).json({
                success: true,
                message: 'Postagem criada com sucesso!',
                data: postagem
            });
        } catch (error) {
            console.error('Erro ao criar postagem:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            // Suporta tanto JSON quanto form-data
            let categorias = req.body.categorias;
            if (!categorias && req.body['categorias[]']) {
                categorias = [].concat(req.body['categorias[]']);
            }
            categorias = (categorias || []).map(cid => parseInt(cid)).filter(Boolean);

            const { categorias: _r1, 'categorias[]': _r2, ...dadosPostagem } = req.body;

            const postagem = await this.postagemService.atualizarPostagem(
                id,
                dadosPostagem,
                categorias,
                req.usuario
            );
            res.json({
                success: true,
                message: 'Postagem atualizada!',
                data: postagem
            });
        } catch (error) {
            console.error('Erro ao atualizar postagem:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }
            await this.postagemService.deletarPostagem(id, req.usuario);
            res.json({ success: true, message: 'Postagem excluída com sucesso!' });
        } catch (error) {
            console.error('Erro ao deletar postagem:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async buscarRecentes(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 5, 20);
            const recentes = await this.postagemService.buscarPostagensRecentes(limit);
            res.json({ success: true, data: recentes });
        } catch (error) {
            console.error('Erro ao buscar recentes:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async buscarPorTermo(req, res) {
        try {
            const { termo, categoriaId } = req.query;
            const page  = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const resultados = await this.postagemService.buscarPorTermo(
                termo,
                categoriaId || null,
                page,
                limit
            );
            res.json({ success: true, data: resultados });
        } catch (error) {
            console.error('Erro na busca:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = PostagemController;
